const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("OrderDetail", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            field: 'order_id',
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        // ★ THÊM: productVariantId
        productVariantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_variant_id',
            references: {
                model: 'product_variants',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        priceAtPurchase: {
            type: DataTypes.DECIMAL(12, 2),
            field: 'price_at_purchase',
            comment: "Giá sản phẩm tại thời điểm mua"
        },
        // ★ THÊM: Lưu lại thông tin variant tại thời điểm mua
        variantAttributes: {
            type: DataTypes.JSON,
            field: 'variant_attributes',
            comment: 'JSON lưu trữ: {"Color": "Xanh", "Size": "M"} tại thời điểm mua'
        },
        sku: {
            type: DataTypes.STRING(100),
            comment: "Lưu lại SKU tại thời điểm mua (backup)"
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    }, {
        tableName: "order_details",
        timestamps: true
    });
};