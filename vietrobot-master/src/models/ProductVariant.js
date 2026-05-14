const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductVariant", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id',
            references: {
                model: 'products',
                key: 'id'
            }
        },
        sku: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: "Mã sản phẩm riêng cho biến thể"
        },
        name: {
            type: DataTypes.STRING(255),
            comment: "Tên biến thể (vd: Áo xanh size M)"
        },
        // ★ JSON attributes
        attributes: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Ví dụ: {"Color": "Xanh", "Size": "M", "Version": "2024"}'
        },
        // ★ GIÁ riêng cho biến thể
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "Giá bán lẻ"
        },
        costPrice: {
            type: DataTypes.DECIMAL(12, 2),
            field: 'cost_price',
            comment: "Giá gốc/vốn"
        },
        // ★ TỒN KHO riêng cho biến thể
        stockQuantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'stock_quantity',
            comment: "Số lượng tồn kho của biến thể này"
        },
        barcode: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.STRING(500),
            field: 'image_url',
            comment: "Ảnh riêng cho biến thể (nếu có)"
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
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
        tableName: 'product_variants',
        timestamps: true
    });
};
