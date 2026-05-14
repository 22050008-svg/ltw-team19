// controllers/category.controller.js
const categoryService = require("../services/category.service");
const productService = require("../services/product.service");
const { response } = require("../helpers/response");

/**
 * GET /api/v1/categories
 * Lấy tất cả danh mục (chỉ active)
 */
const getPublicCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(response(categories));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/categories/with-count
 * Lấy danh mục kèm số lượng sản phẩm
 */
const getCategoriesWithCount = async (req, res, next) => {
    try {
        const { type } = req.query;
        const categories = await categoryService.getCategoriesWithProductCount(type);
        res.status(200).json(response(categories));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/categories/type/:type
 * Lấy danh mục theo type (appliance, electronics, etc)
 */
const getCategoriesByType = async (req, res, next) => {
    try {
        const { type } = req.params;
        const categories = await categoryService.getCategoriesByType(type);
        res.status(200).json(response(categories));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/categories/:id
 * Lấy chi tiết một danh mục
 */
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.status(200).json(response(category));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/categories/:id/products
 * Lấy sản phẩm của danh mục
 */
const getProductsByCategory = async (req, res, next) => {
    try {
        const { id: categoryId } = req.params;
        const queryParams = req.query; // { page, limit }
        const result = await productService.getPublicProducts({ ...queryParams, categoryId });
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/admin/categories
 * Tạo danh mục mới (Admin only)
 */
const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(response(category, "Category created successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/admin/categories/:id
 * Cập nhật danh mục (Admin only)
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.updateCategory(id, req.body);
        res.status(200).json(response(category, "Category updated successfully"));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/admin/categories/:id
 * Xóa danh mục (Admin only)
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await categoryService.deleteCategory(id);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPublicCategories,
    getCategoriesWithCount,
    getCategoriesByType,
    getCategoryById,
    getProductsByCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};