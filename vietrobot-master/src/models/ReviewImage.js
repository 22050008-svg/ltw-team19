const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ReviewImage", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reviewId: {
            type: DataTypes.INTEGER,
            field: 'review_id',
            allowNull: false,
            references: {
                model: 'product_reviews',
                key: 'id'
            },
            comment: "ID đánh giá sản phẩm"
        },
        imageUrl: {
            type: DataTypes.TEXT('long'), // Changed from STRING(500) to LONGTEXT for base64 support
            field: 'image_url',
            allowNull: false,
            comment: "URL ảnh đánh giá hoặc base64 data"
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'display_order',
            comment: "Thứ tự hiển thị ảnh"
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
        tableName: 'review_images',
        timestamps: true
    });
};
