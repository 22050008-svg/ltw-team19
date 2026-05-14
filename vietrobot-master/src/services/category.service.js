// services/category.service.js
const { Category, Product } = require("../models");
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize");

/**
 * Lấy tất cả danh mục (chỉ active)
 */
const getAllCategories = async () => {
    try {
        const categories = await Category.findAll({
            where: { status: 'active' },
            order: [['displayOrder', 'ASC'], ['name', 'ASC']],
            attributes: ['id', 'name', 'description', 'icon', 'color', 'displayOrder', 'type', 'status']
        });
        return categories;
    } catch (error) {
        throw new AppError(500, "Failed to get categories");
    }
};

/**
 * Lấy danh mục theo type (appliance, electronics, etc)
 */
const getCategoriesByType = async (type) => {
    try {
        const categories = await Category.findAll({
            where: { status: 'active', type },
            order: [['displayOrder', 'ASC'], ['name', 'ASC']],
            attributes: ['id', 'name', 'description', 'icon', 'color', 'displayOrder', 'type']
        });
        return categories;
    } catch (error) {
        throw new AppError(500, `Failed to get ${type} categories`);
    }
};

/**
 * Lấy danh sách danh mục kèm số lượng sản phẩm
 * Dùng cho display ở frontend (admin hoặc customer)
 */
const getCategoriesWithProductCount = async (typeFilter = null) => {
    try {
        let whereClause = { status: 'active' };
        if (typeFilter) {
            whereClause.type = typeFilter;
        }

        const categories = await Category.findAll({
            where: whereClause,
            order: [['displayOrder', 'ASC'], ['name', 'ASC']],
            attributes: ['id', 'name', 'description', 'icon', 'color', 'displayOrder', 'type'],
            subQuery: false,
            include: [{
                model: Product,
                as: 'products',
                attributes: [],
                required: false,
            }],
            raw: true,
            group: ['Category.id'],
            attributes: {
                include: [
                    [require('sequelize').fn('COUNT', require('sequelize').col('products.id')), 'productCount']
                ]
            }
        });

        return categories;
    } catch (error) {
        throw new AppError(500, "Failed to get categories with product count");
    }
};

/**
 * Lấy chi tiết một danh mục
 */
const getCategoryById = async (id) => {
    try {
        const category = await Category.findByPk(id, {
            attributes: ['id', 'name', 'description', 'icon', 'color', 'displayOrder', 'type', 'status']
        });
        
        if (!category) {
            throw new AppError(404, "Category not found");
        }
        
        return category;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to get category");
    }
};

/**
 * Tạo danh mục mới (Admin only)
 */
const createCategory = async (data) => {
    try {
        // Check if category name already exists
        const existing = await Category.findOne({ where: { name: data.name } });
        if (existing) {
            throw new AppError(400, "Category name already exists");
        }

        const category = await Category.create({
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            image: data.image,
            displayOrder: data.displayOrder || 0,
            status: data.status || 'active',
            type: data.type || 'other'
        });

        return category;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to create category");
    }
};

/**
 * Cập nhật danh mục (Admin only)
 */
const updateCategory = async (id, data) => {
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError(404, "Category not found");
        }

        // Check if new name is unique (if being changed)
        if (data.name && data.name !== category.name) {
            const existing = await Category.findOne({ where: { name: data.name } });
            if (existing) {
                throw new AppError(400, "Category name already exists");
            }
        }

        await category.update(data);
        return category;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to update category");
    }
};

/**
 * Xóa danh mục (Admin only) - soft delete by changing status
 */
const deleteCategory = async (id) => {
    try {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError(404, "Category not found");
        }

        // Check if category has products
        const productCount = await Product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            throw new AppError(400, `Cannot delete category with ${productCount} products. Move products first.`);
        }

        // Soft delete
        await category.update({ status: 'inactive' });
        return { message: "Category deleted successfully" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to delete category");
    }
};

module.exports = {
    getAllCategories,
    getCategoriesByType,
    getCategoriesWithProductCount,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};