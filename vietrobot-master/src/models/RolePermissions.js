const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define('RolePermissions', {
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id',
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        permissionId: {
            type: DataTypes.INTEGER,
            field: 'permission_id',
            references: {
                model: 'permissions',
                key: 'id'
            }
        }
    }, {
        tableName: 'role_permissions',
        timestamps: false
    });
};