// /routers/v1/categories.router.js
const express = require("express");
const categoryController = require("../../controllers/category.controller");
const { checkPermission } = require("../../middlewares/permission.middleware");

// Path: /api/v1/categories
const categoryRouter = express.Router();

// Public routes
/**
 * GET /api/v1/categories
 * Lấy tất cả danh mục (active only)
 */
categoryRouter.get("/", categoryController.getPublicCategories);

/**
 * GET /api/v1/categories/with-count
 * Lấy danh mục kèm số sản phẩm (dùng cho admin panel)
 */
categoryRouter.get("/with-count", categoryController.getCategoriesWithCount);

/**
 * GET /api/v1/categories/type/:type
 * Lấy danh mục theo loại (appliance, electronics, etc)
 */
categoryRouter.get("/type/:type", categoryController.getCategoriesByType);

/**
 * GET /api/v1/categories/:id
 * Lấy chi tiết danh mục
 */
categoryRouter.get("/:id", categoryController.getCategoryById);

/**
 * GET /api/v1/categories/:id/products
 * Lấy sản phẩm của danh mục
 */
categoryRouter.get("/:id/products", categoryController.getProductsByCategory);

// Admin routes (protected)
/**
 * POST /api/v1/admin/categories
 * Tạo danh mục mới
 */
categoryRouter.post("/admin", checkPermission("category.create"), categoryController.createCategory);

/**
 * PUT /api/v1/admin/categories/:id
 * Cập nhật danh mục
 */
categoryRouter.put("/admin/:id", checkPermission("category.update"), categoryController.updateCategory);

/**
 * DELETE /api/v1/admin/categories/:id
 * Xóa danh mục (soft delete)
 */
categoryRouter.delete("/admin/:id", checkPermission("category.delete"), categoryController.deleteCategory);

module.exports = categoryRouter;