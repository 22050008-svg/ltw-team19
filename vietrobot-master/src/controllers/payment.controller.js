const paymentService = require("../services/payment.service");
<<<<<<< HEAD
const { AppError } = require("../helpers/error");

const handleSebayWebhook = async (req, res, next) => {
    try {
        // Log webhook được nhận
        console.log('🔔 [Webhook] Received webhook from SePay', {
            headers: req.headers,
            body: req.body
        });

        // Giả định signature nằm trong header, ví dụ: 'x-sebay-signature'
        const signature = req.headers['x-sebay-signature'];
        const payload = req.body;

        // Validate payload
        if (!payload) {
            console.warn('⚠️ [Webhook] Empty payload received');
            return res.status(400).json({ message: "Payload is empty" });
        }

        if (typeof payload === 'string') {
            console.warn('⚠️ [Webhook] Payload is string, attempting to parse...');
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                console.error('❌ [Webhook] Failed to parse payload string');
                return res.status(400).json({ message: "Invalid JSON payload" });
            }
        }

        console.log('📋 [Webhook] Payload structure:', Object.keys(payload));

        await paymentService.handleSebayWebhook(payload, signature);

        // Phản hồi cho SePay biết đã nhận thành công
        console.log('✅ [Webhook] Webhook processed successfully');
        return res.status(200).json({ success: true, message: "Webhook received successfully" });
    } catch (error) {
        console.error("❌ [Webhook Error] Full error:", error);
        console.error("❌ [Webhook Error] Message:", error.message);
        console.error("❌ [Webhook Error] Status:", error.statusCode);
        // Trả về 200 để SePay không gọi lại liên tục với cùng payload lỗi
        if (error.statusCode === 404 || error.statusCode === 400) {
            return res.status(200).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
=======
const { response } = require("../helpers/response");

/**
 * ★ PAYMENT CONTROLLERS
 */

// Xử lý VNPay webhook return
const handleVNPayReturn = async (req, res, next) => {
    try {
        const result = await paymentService.handleVNPayReturn(req.query);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

// Xử lý Sebay webhook
const handleSebayWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-sebay-signature'];
        const payload = req.body;

        await paymentService.handleSebayWebhook(payload, signature);

        res.status(200).json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    }
};

module.exports = {
<<<<<<< HEAD
=======
    handleVNPayReturn,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    handleSebayWebhook,
};