const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Address", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        recipientName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'recipient_name',
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // --- CÁC TRƯỜDEs' => 'Vĩnh Long',NG ĐỊA CHỈ ĐÃ ĐƯỢC NÂNG CẤP ---
        street: { // Địa chỉ chi tiết (số nhà, tên đường)
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Tỉnh/Thành phố
        provinceCode: {
            type: DataTypes.INTEGER, // Thường là số, ví dụ: 201
            allowNull: false,
            field: 'province_code',
        },
        provinceName: {
            type: DataTypes.STRING, // Ví dụ: "Thành phố Hà Nội"
            allowNull: false,
            field: 'province_name',
        },
<<<<<<< HEAD
        // Quận/Huyện (đã bỏ sau sáp nhập 2025 - 34 tỉnh, không còn cấp huyện)
        districtCode: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'district_code',
        },
        districtName: {
            type: DataTypes.STRING,
            allowNull: true,
=======
        // Quận/Huyện
        districtCode: {
            type: DataTypes.INTEGER, // Thường là số, ví dụ: 1
            allowNull: false,
            field: 'district_code',
        },
        districtName: {
            type: DataTypes.STRING, // Ví dụ: "Quận Ba Đình"
            allowNull: false,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            field: 'district_name',
        },
        // Phường/Xã
        wardCode: {
            type: DataTypes.STRING, // Thường là chuỗi, ví dụ: "00001"
            allowNull: false,
            field: 'ward_code',
        },
        wardName: {
            type: DataTypes.STRING, // Ví dụ: "Phường Phúc Xá"
            allowNull: false,
            field: 'ward_name',
        },
        // ---------------------------------------------
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_default',
        },
        // userId sẽ được tự động thêm qua association
    }, {
        tableName: "addresses",
        timestamps: true,
    });
};