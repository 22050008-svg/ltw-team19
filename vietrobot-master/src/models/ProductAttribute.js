const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductAttribute", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: "Color, Size, Version, etc."
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'category_id',
            references: {
                model: 'categories',
                key: 'id'
            },
            comment: "Nếu thuộc tính chỉ áp dụng cho danh mục nhất định"
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'display_order',
            comment: "Thứ tự hiển thị"
        },
        required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'required',
            comment: "Thuộc tính bắt buộc phải chọn (VD: Thương Hiệu)"
        },
        isFilter: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_filter',
            comment: "Có thể dùng để filter sản phẩm"
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
        tableName: 'product_attributes',
        timestamps: true,
        underscored: false
    });
};
