const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductImage", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'product_id',
            references: {
                model: 'products',
                key: 'id'
            },
            comment: "Ảnh chung của sản phẩm"
        },
        productVariantId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'product_variant_id',
            references: {
                model: 'product_variants',
                key: 'id'
            },
            comment: "Ảnh riêng cho biến thể"
        },
        imageUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'image_url'
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'display_order',
            comment: "Thứ tự hiển thị ảnh"
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_primary',
            comment: "Ảnh chính (thumbnail)"
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
        tableName: "product_images",
        timestamps: true,
        indexes: [
            { fields: ['product_id'] },
            { fields: ['product_variant_id'] }
        ]
    });
};
