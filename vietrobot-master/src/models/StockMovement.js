const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("StockMovement", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('sale', 'purchase', 'return', 'adjustment'),
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        productId: {
            type: DataTypes.INTEGER,
            field: 'product_id',
            references: {
                model: 'products',
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
        tableName: "stock_movements",
        timestamps: false, // Sử dụng trường timestamp riêng
    });
};