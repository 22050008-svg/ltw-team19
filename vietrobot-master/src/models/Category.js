const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
        },
        // UI Enhancement Fields
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Icon name (antd icon or emoji) - VD: 'fridge', 'washing-machine', '❄️'"
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Hex color or color name - VD: '#1890ff', '#52c41a'"
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Image URL or path for category banner"
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Sort order for display"
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        type: {
            type: DataTypes.ENUM('appliance', 'electronics', 'other'),
            defaultValue: 'other',
            comment: "Category type for grouping"
        },
    }, {
        tableName: "categories",
        timestamps: false,
    });
};