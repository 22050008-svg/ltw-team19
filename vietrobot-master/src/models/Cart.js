const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Cart", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // userId sẽ được Sequelize tự động tạo khi định nghĩa quan hệ
    }, {
        tableName: "carts",
        timestamps: true,
    });
};