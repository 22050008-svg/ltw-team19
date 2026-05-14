const { DataTypes } = require("sequelize");
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    return sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'full_name',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                const salt = bcrypt.genSaltSync();
                const hashedPassword = bcrypt.hashSync(value, salt);
                this.setDataValue("password", hashedPassword);
            },
        },
        phone: {
            type: DataTypes.STRING,
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'avatar_url',
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_verified',
        },
        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'verification_code',
        },
        verificationCodeExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verification_code_expires',
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'password_reset_token',
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'password_reset_expires',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active',
        },
    }, {
        tableName: "users",
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ["password", "verificationCode", "verificationCodeExpires", "passwordResetToken", "passwordResetExpires"] },
        },
        hooks: {
            afterCreate: (record) => {
                delete record.dataValues.password;
                delete record.dataValues.verificationCode;
                delete record.dataValues.verificationCodeExpires;
                delete record.dataValues.passwordResetToken;
                delete record.dataValues.passwordResetExpires;
            },
            afterUpdate: (record) => {
                delete record.dataValues.password;
                delete record.dataValues.verificationCode;
                delete record.dataValues.verificationCodeExpires;
                delete record.dataValues.passwordResetToken;
                delete record.dataValues.passwordResetExpires;
            },
        }
    });
};