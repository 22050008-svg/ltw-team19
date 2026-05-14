const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Transaction", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('income', 'expense'),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Có thể là giao dịch không liên quan đến đơn hàng
            field: 'order_id',
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: "transactions",
        timestamps: false, // Sử dụng trường date riêng
    });
};