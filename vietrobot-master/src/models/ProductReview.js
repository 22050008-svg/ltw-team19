const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductReview", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            field: 'product_id',
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            },
            comment: "ID sản phẩm được đánh giá"
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: "ID khách hàng đánh giá"
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: "Đánh giá 1-5 sao"
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            comment: "Nhận xét/bình luận của khách hàng"
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            comment: "Tiêu đề đánh giá"
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            comment: "Trạng thái: chờ duyệt, đã duyệt, bị từ chối"
        },
        helpful_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'helpful_count',
            comment: "Số lượt vote 'hữu ích'"
        },
        edit_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'edit_count',
            comment: "Số lần chỉnh sửa đánh giá (tối đa 1 lần)"
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
        tableName: 'product_reviews',
        timestamps: true
    });
};
