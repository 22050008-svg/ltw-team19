const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ReviewReply", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reviewId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'review_id',
            references: {
                model: 'product_reviews',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            },
            comment: "Nhân viên bán hàng hoặc người phụ trách trả lời"
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Nội dung trả lời"
        },
        isOfficial: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_official',
            comment: "Trả lời chính thức từ cửa hàng"
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
        tableName: 'review_replies',
        timestamps: true,
        indexes: [
            { fields: ['review_id'] }
        ]
    });
};
