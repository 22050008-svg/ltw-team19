const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("MailConfig", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            defaultValue: 1, // Luôn dùng ID 1 cho bản ghi cấu hình duy nhất
        },
        authType: {
            type: DataTypes.ENUM('smtp', 'oauth2',"graph"),
            defaultValue: 'smtp',
            field: 'auth_type',
        },
        host: {
            type: DataTypes.STRING,
            allowNull: true,  // Changed: Allow null to avoid startup errors
        },
        port: {
            type: DataTypes.INTEGER,
            allowNull: true,  // Changed: Allow null to avoid startup errors
        },
        secure: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true, // Phổ biến cho port 465
        },
        user: {
            type: DataTypes.STRING,
            allowNull: true, // Không bắt buộc cho OAuth2
        },
        pass: {
            type: DataTypes.STRING,
            allowNull: true, // Không bắt buộc cho OAuth2
            // Lưu ý: Trong ứng dụng thực tế, trường này nên được mã hóa.
        },
        // --- OAuth2 Fields (for Microsoft 365) ---
        tenantId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'tenant_id',
        },
        clientId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_id',
        },
        clientSecret: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_secret',
        },
        fromEmail: {
            type: DataTypes.STRING,
            allowNull: true,  // Changed: Allow null to avoid startup errors
            field: 'from_email',
        },
        fromName: {
            type: DataTypes.STRING,
            allowNull: true,  // Changed: Allow null to avoid startup errors
            field: 'from_name',
        },
    }, {
        tableName: "mail_configs",
        timestamps: true, // Để biết thời điểm cập nhật cuối cùng
    });
};