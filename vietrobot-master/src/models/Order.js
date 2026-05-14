const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // Thêm trường code để dễ dàng tra cứu, giao tiếp với khách hàng
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Mã đơn hàng là duy nhất
        },
        status: {
            type: DataTypes.ENUM(
                'awaiting_payment', // Chờ thanh toán (cho thanh toán online)
                'pending',          // Chờ xác nhận
                'processing',       // Đang xử lý/đóng gói
                'shipped',          // Đang giao hàng
                'delivered',        // Đã giao thành công
                'cancelled',        // Đã hủy
                'failed'            // Giao hàng thất bại
            ),
            defaultValue: 'pending',
            allowNull: false,
        },
        // --- THÔNG TIN NGƯỜI NHẬN ---
        recipientName: {
            type: DataTypes.STRING,
            allowNull: false, // Bắt buộc phải có
            field: 'recipient_name',
        },
        recipientPhone: {
            type: DataTypes.STRING,
            allowNull: false, // Bắt buộc phải có
            field: 'recipient_phone',
        },
        shippingAddress: {
            type: DataTypes.STRING(500), // Tăng độ dài để chứa địa chỉ chi tiết
            allowNull: false, // Bắt buộc phải có
            field: 'shipping_address',
        },
        // -------------------------

        // --- THÔNG TIN THANH TOÁN & GIÁ TRỊ ĐƠN HÀNG ---
        paymentMethod: {
            type: DataTypes.ENUM('cod', 'vnpay', 'momo', 'sebay'),
            allowNull: false,
            field: 'payment_method',
        },
        subtotal: { // Tổng tiền hàng gốc
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        shippingFee: { // Phí vận chuyển
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00,
            field: 'shipping_fee',
        },
        discountAmount: { // Số tiền được giảm từ voucher
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00,
            field: 'discount_amount',
        },
        totalAmount: { // Tổng tiền cuối cùng khách phải trả
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'total_amount',
        },
        // ---------------------------------------------
        
        customerNote: {
            type: DataTypes.TEXT,
            field: 'customer_note',
        },
        
        // --- KHÓA NGOẠI ---
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Cho phép NULL để hỗ trợ khách vãng lai
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        voucherCode: { // Lưu lại mã voucher đã sử dụng (dạng text)
            type: DataTypes.STRING,
            allowNull: true,
            field: 'voucher_code',
        }
    }, {
        tableName: "orders",
        timestamps: true, // Giữ lại createdAt và updatedAt
        hooks: {
            // Tự động tạo mã đơn hàng trước khi tạo record mới
            beforeValidate: (order, options) => {
                if (!order.code) {
                    // Tạo mã ngẫu nhiên, ví dụ: "ORD-20230917-ABC12"
                    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
                    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
                    order.code = `ORD-${datePart}-${randomPart}`;
                }
            }
        }
    });
};