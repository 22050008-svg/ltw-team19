// =====================================================================================
// REQUIRED IMPORTS
// =====================================================================================
const nodemailer = require('nodemailer');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { MailConfig } = require('../models');
const { AppError } = require('../helpers/error');

// =====================================================================================
// MODULE SCOPE VARIABLES & SINGLETON INSTANCES
// =====================================================================================

// Singleton client for Microsoft Graph API
let graphClientInstance = null;
// Singleton transporter for Nodemailer (SMTP)
let transporterInstance = null;
// Stores the current config version to detect changes
let currentConfigVersion = null;

// =====================================================================================
// CLIENT INITIALIZATION HELPERS
// =====================================================================================

/**
 * Initializes and returns a singleton Microsoft Graph Client.
 * Creates a new client only if the configuration has changed.
 * @param {MailConfig} config - The mail configuration object.
 * @returns {Client} The Microsoft Graph client instance.
 */
const getGraphClient = (config) => {
    const configVersion = `${config.updatedAt.getTime()}-graph`;
    if (!graphClientInstance || currentConfigVersion !== configVersion) {
        console.log('[MAIL_SERVICE] Cấu hình Graph API thay đổi hoặc chưa khởi tạo. Đang tạo client mới...');
        if (!config.tenantId || !config.clientId || !config.clientSecret) {
            throw new AppError(500, "Cấu hình Graph API (Tenant ID, Client ID, Client Secret) không đầy đủ.");
        }
        const credential = new ClientSecretCredential(config.tenantId, config.clientId, config.clientSecret);
        graphClientInstance = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
                    return tokenResponse.token;
                }
            }
        });
        currentConfigVersion = configVersion;
    }
    return graphClientInstance;
};

/**
 * Initializes and returns a singleton Nodemailer transporter.
 * Creates a new transporter only if the configuration has changed.
 * @param {MailConfig} config - The mail configuration object.
 * @returns {import('nodemailer').Transporter} The Nodemailer transporter instance.
 */
const getNodemailerTransporter = (config) => {
    const configVersion = `${config.updatedAt.getTime()}-smtp`;
    if (!transporterInstance || currentConfigVersion !== configVersion) {
        console.log('[MAIL_SERVICE] Cấu hình SMTP thay đổi hoặc chưa khởi tạo. Đang tạo transporter mới...');
        const port = Number(config.port);
        const transportOptions = {
            host: config.host,
            port: port,
            auth: { user: config.user, pass: config.pass },
            tls: { ciphers: 'SSLv3' }
        };
        if (port === 465) transportOptions.secure = true;
        else if (port === 587) transportOptions.secure = false;
        else transportOptions.secure = !!config.secure;
        
        transporterInstance = nodemailer.createTransport(transportOptions);
        currentConfigVersion = configVersion;
    }
    return transporterInstance;
};

// =====================================================================================
// EXPORTED SERVICE FUNCTIONS
// =====================================================================================

/**
 * Retrieves the mail configuration from the database.
 * If not found, creates a default config from environment variables
 * @returns {Promise<MailConfig>}
 */
const getMailConfig = async () => {
    // Provide default values from environment variables or use dummy values
    const defaults = {
        id: 1,
        authType: process.env.MAIL_AUTH_TYPE || 'smtp',
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: process.env.MAIL_SECURE === 'true' || false,
        user: process.env.MAIL_USER || null,
        pass: process.env.MAIL_PASS || null,
        fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@example.com',
        fromName: process.env.MAIL_FROM_NAME || 'Web Ban Hang',
        tenantId: process.env.AZURE_TENANT_ID || null,
        clientId: process.env.AZURE_CLIENT_ID || null,
        clientSecret: process.env.AZURE_CLIENT_SECRET || null,
    };

    const [config] = await MailConfig.findOrCreate({
        where: { id: 1 },
        defaults: defaults
    });
    
    // Ensure config has necessary properties (handle case where DB record exists but is incomplete)
    const configData = config.get({ plain: true });
    
    // Merge environment variable overrides if present
    if (process.env.MAIL_HOST) configData.host = process.env.MAIL_HOST;
    if (process.env.MAIL_PORT) configData.port = parseInt(process.env.MAIL_PORT);
    if (process.env.MAIL_USER) configData.user = process.env.MAIL_USER;
    if (process.env.MAIL_PASS) configData.pass = process.env.MAIL_PASS;
    if (process.env.MAIL_FROM_EMAIL) configData.fromEmail = process.env.MAIL_FROM_EMAIL;
    if (process.env.MAIL_FROM_NAME) configData.fromName = process.env.MAIL_FROM_NAME;
    
    return configData;
};

/**
 * Updates the mail configuration and invalidates client/transporter caches.
 * @param {object} data - The new configuration data.
 * @returns {Promise<MailConfig>}
 */
const updateMailConfig = async (data) => {
    // Invalidate caches to force re-initialization on next send
    graphClientInstance = null;
    transporterInstance = null;
    currentConfigVersion = null;
    
    const [config] = await MailConfig.upsert({ id: 1, ...data }, { returning: true });
    return config;
};

/**
 * Sends an email using the configured method (Graph API or SMTP).
 * @param {object} mailOptions - Email options (to, subject, html, cc, bcc, attachments).
 */
const sendMail = async (mailOptions) => {
    try {
        const config = await getMailConfig();

        // If email is not configured, log warning and skip (don't throw error)
        if (!config.fromEmail || !config.host) {
            console.warn("⚠️  [MAIL_SERVICE] Email chưa được cấu hình đầy đủ. Bỏ qua gửi email.");
            console.warn(`    Cần cấu hình: fromEmail=${config.fromEmail || 'NOT SET'}, host=${config.host || 'NOT SET'}`);
            return; // Skip email sending gracefully
        }

        // For SMTP, verify credentials are provided
        if (config.authType !== 'graph' && (!config.user || !config.pass)) {
            console.warn("⚠️  [MAIL_SERVICE] SMTP credentials không đầy đủ. Bỏ qua gửi email.");
            console.warn(`    Cần cấu hình: user=${config.user || 'NOT SET'}, pass=${config.pass ? 'SET' : 'NOT SET'}`);
            return; // Skip email sending gracefully
        }

        // --- CHOOSE SENDING STRATEGY BASED ON AUTH TYPE ---
        if (config.authType === 'graph') {
            const graphClient = getGraphClient(config);
            const toRecipients = mailOptions.to.split(',').map(email => ({ emailAddress: { address: email.trim() } }));
            
            const emailPayload = {
                message: {
                    subject: mailOptions.subject,
                    body: { contentType: "HTML", content: mailOptions.html },
                    toRecipients: toRecipients,
                    // Optional fields
                    ...(mailOptions.cc && { ccRecipients: mailOptions.cc.split(',').map(email => ({ emailAddress: { address: email.trim() } })) }),
                    ...(mailOptions.bcc && { bccRecipients: mailOptions.bcc.split(',').map(email => ({ emailAddress: { address: email.trim() } })) }),
                }
            };
            
            await graphClient.api(`/users/${config.fromEmail}/sendMail`).post(emailPayload);
            console.log(`✅ [Graph API] Email đã gửi thành công tới: ${mailOptions.to}`);

        } else { // Fallback to SMTP
            const transporter = getNodemailerTransporter(config);
            const info = await transporter.sendMail({
                from: `"${config.fromName || config.fromEmail}" <${config.fromEmail}>`,
                ...mailOptions,
            });
            console.log(`✅ [SMTP] Email đã gửi thành công: ${info.messageId}`);
        }

    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
        if (error instanceof AppError) throw error;
        
        // Provide more specific error details from Graph API
        const graphError = error.body ? JSON.parse(error.body).error.message : null;
        throw new AppError(500, `Không thể gửi email: ${graphError || error.message}`);
    }
};

/**
 * Sends a test email to the specified address.
 * @param {string} toEmail - The recipient's email address.
 */
const sendTestEmail = async (toEmail) => {
    if (!toEmail) {
        throw new AppError(400, "Địa chỉ email nhận không được để trống.");
    }
    return sendMail({
        to: toEmail,
        subject: 'Email Test từ Hệ thống Vietrobot',
        html: `<h1>Đây là email kiểm tra.</h1><p>Nếu bạn nhận được email này, cấu hình email của bạn đã hoạt động chính xác.</p><p>Thời gian: ${new Date().toLocaleString()}</p>`,
    });
};

module.exports = {
    getMailConfig,
    updateMailConfig,
    sendMail,
    sendTestEmail,
};