const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Tên sản phẩm chung"
        },
        description: {
            type: DataTypes.TEXT,
        },
        htmlDescription: {
            type: DataTypes.TEXT, // Dùng 'long' để chứa được nội dung lớn
            allowNull: true,
            field: 'html_description',
            comment: 'HTML mô tả chi tiết sản phẩm'
        },
        specifications: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Thông số kỹ thuật - Array of {label, value} hoặc {section, items: [{label, value}]}'
        },
        usageGuide: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'usage_guide',
            comment: 'Hướng dẫn sử dụng sản phẩm'
        },
        categoryId: {
            type: DataTypes.INTEGER,
            field: 'category_id',
            references: {
                model: 'categories', // Tên bảng categories
                key: 'id'
            }
        },
        attributes: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Thuộc tính chung của sản phẩm (nếu cần). Ví dụ: {"material": "Cotton 100%"}'
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
        tableName: "products",
        timestamps: true, // Thêm createdAt và updatedAt
    });
};