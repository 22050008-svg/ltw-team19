const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductAttributeValue", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        attributeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'attribute_id',
            references: {
                model: 'product_attributes',
                key: 'id'
            }
        },
        value: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "E.g., 'Xanh', 'M', 'Plus'"
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
        tableName: 'product_attribute_values',
        timestamps: true
    });
};
