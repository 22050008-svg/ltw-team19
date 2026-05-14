const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define('UserRoles', {
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id',
            references: {
                model: 'roles',
                key: 'id'
            }
        },
       
    }, {
        tableName: 'user_roles',
        timestamps: false
    });
};