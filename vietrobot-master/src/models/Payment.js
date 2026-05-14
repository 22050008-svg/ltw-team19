const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Payment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        paymentMethod: {
<<<<<<< HEAD
            type: DataTypes.STRING,
=======
            type: DataTypes.ENUM('cod', 'vnpay', 'momo', 'sebay'),
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            allowNull: false,
            field: 'payment_method',
        },
        status: {
<<<<<<< HEAD
            type: DataTypes.ENUM('pending', 'succeeded', 'failed'),
=======
            type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'cancelled'),
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            defaultValue: 'pending',
            allowNull: false,
        },
        transactionId: { // Mã giao dịch từ cổng thanh toán
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transaction_id',
        },
<<<<<<< HEAD
=======
        qrCode: { // QR code cho thanh toán online (VNPay, Momo)
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'qr_code',
        },
        paymentUrl: { // URL thanh toán (VNPay)
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'payment_url',
        },
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        gatewayResponse: { // Lưu lại toàn bộ response để debug
            type: DataTypes.JSON,
            allowNull: true,
            field: 'gateway_response',
        },
        // Khóa ngoại
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'order_id',
            references: {
                model: 'orders',
                key: 'id'
            }
        }
    }, {
        tableName: "payments",
        timestamps: true,
    });
};