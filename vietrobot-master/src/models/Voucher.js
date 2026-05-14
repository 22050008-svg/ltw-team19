const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Voucher", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        // Loại voucher: freeship, discount, brand, payment_method, category
        voucherType: {
            type: DataTypes.ENUM('freeship', 'discount', 'brand', 'payment_method', 'category'),
            field: 'voucher_type',
            defaultValue: 'discount',
        },
        discountType: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            field: 'discount_type',
        },
        discountValue: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'discount_value',
        },
        // Cho voucher freeship
        minOrderValue: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'min_order_value',
            comment: 'Giá trị đơn hàng tối thiểu để áp dụng freeship',
        },
        shippingDiscount: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'shipping_discount',
            comment: 'Giá trị freeship (cố định hoặc phần trăm)',
        },
        // Cho voucher brand
        brandId: {
            type: DataTypes.INTEGER,
            field: 'brand_id',
            comment: 'ID của thương hiệu áp dụng voucher (deprecated - sử dụng brandAttributeValueId)',
        },
        brandAttributeValueId: {
            type: DataTypes.INTEGER,
            field: 'brand_attribute_value_id',
            comment: 'ID của brand attribute value - chứa tất cả dữ liệu brand',
        },
        // Cho voucher category
        categoryId: {
            type: DataTypes.INTEGER,
            field: 'category_id',
            comment: 'ID của loại sản phẩm áp dụng voucher',
        },
        // Cho voucher payment method
        paymentMethod: {
            type: DataTypes.ENUM('VNPAY', 'QR', 'BANK_TRANSFER', 'COD'),
            field: 'payment_method',
            comment: 'Phương thức thanh toán áp dụng voucher',
        },
        expiryDate: {
            type: DataTypes.DATE,
            field: 'expiry_date',
        },
        usageCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'usage_count',
        },
        usageLimit: {
            type: DataTypes.INTEGER,
            field: 'usage_limit',
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description',
            comment: 'Mô tả chi tiết về voucher',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active',
        },
    }, {
        tableName: "vouchers",
        timestamps: true,
    });
};