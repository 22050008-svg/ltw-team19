-- =====================================================================
-- Setup MailConfig - Cấu hình Email cho ứng dụng
-- =====================================================================

-- Thêm bản ghi MailConfig mặc định (Nếu bảng trống)
INSERT INTO mail_configs (
    id,
    auth_type,
    host,
    port,
    secure,
    user,
    pass,
    tenant_id,
    client_id,
    client_secret,
    from_email,
    from_name,
    created_at,
    updated_at
) VALUES (
    1,
    'smtp',
    'smtp.gmail.com',
    587,
    false,
    'thebui2k@gmail.com',
    'svyp bmzl drsr lvdp',
    NULL,
    NULL,
    NULL,
    'noreply@example.com',
    'Web Ban Hang',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    auth_type = 'smtp',
    host = 'smtp.gmail.com',
    port = 587,
    secure = false,
    user = 'thebui2k@gmail.com',
    pass = 'svyp bmzl drsr lvdp',
    from_email = 'noreply@example.com',
    from_name = 'Web Ban Hang',
    updated_at = NOW();

-- =====================================================================
-- Instructions - Hướng dẫn cấu hình
-- =====================================================================

/*
GMAIL Configuration:
1. Bật 2-Factor Authentication trên Gmail account
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Cấu hình MailConfig:
   - host: smtp.gmail.com
   - port: 587
   - secure: false (TLS)
   - user: your-email@gmail.com
   - pass: app-password-16-chars

Hoặc sử dụng Microsoft 365 (Graph API):
1. Tạo Azure App Registration
2. Cấu hình MailConfig:
   - auth_type: graph
   - tenant_id: your-tenant-id
   - client_id: your-client-id
   - client_secret: your-client-secret
   - from_email: your-email@company.com

Hoặc sử dụng SendGrid:
1. Lấy API Key từ SendGrid
2. Cấu hình MailConfig:
   - host: smtp.sendgrid.net
   - port: 587
   - user: apikey
   - pass: SG.xxxxx
   - from_email: noreply@company.com
*/
