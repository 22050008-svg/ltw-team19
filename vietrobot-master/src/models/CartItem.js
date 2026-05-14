const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("CartItem", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // ★ THÊM: productVariantId
        productVariantId: {
            type: DataTypes.INTEGER,
            allowNull: false,  // ← BẮT BUỘC
            field: 'product_variant_id',
            references: {
                model: 'product_variants',
                key: 'id'
            },
            comment: "Reference tới ProductVariant thay vì Product"
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
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
        tableName: "cart_items",
        timestamps: true,
        indexes: [
            // Unique: một biến thể chỉ có 1 item trong giỏ
            { fields: ['cartId', 'product_variant_id'], unique: true }
        ]
    });
};