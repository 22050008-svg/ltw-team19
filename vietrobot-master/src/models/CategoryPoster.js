// models/CategoryPoster.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CategoryPoster = sequelize.define("CategoryPoster", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id"
      },
      onDelete: "CASCADE",
      field: "category_id"
    },
    location: {
      type: DataTypes.ENUM('homepage', 'category'),
      defaultValue: 'category',
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "image_url"
    },
    // ★ UNCOMMENTED: redirectUrl field
    redirectUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      comment: "URL to redirect when poster is clicked (e.g., /category/1, /brand/5, /products?type=sale)",
      field: "redirect_url"
    },
    title: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "display_order"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active"
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "SET NULL",
      field: "created_by"
    }
  }, {
    tableName: "category_posters",
    timestamps: true,
    underscored: true
  });

  CategoryPoster.associate = (models) => {
    CategoryPoster.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
      allowNull: true
    });
    CategoryPoster.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator"
    });
  };

  return CategoryPoster;
};
