// routers/v1/productVariant.router.js
const express = require("express");
const router = express.Router();
const productVariantController = require("../../controllers/productVariant.controller");
const authorization = require("../../middlewares/authorization");

// ====================================================================
// PUBLIC ENDPOINTS
// ====================================================================

/**
 * GET /api/v1/products/:productId/variants
 * Lấy tất cả biến thể của một sản phẩm
 * PUBLIC
 */
router.get("/products/:productId/variants", productVariantController.getProductVariants);

/**
 * GET /api/v1/variants/:variantId
 * Lấy chi tiết một biến thể
 * PUBLIC
 */
router.get("/variants/:variantId", productVariantController.getVariantDetails);

/**
 * GET /api/v1/variants/sku/:sku
 * Lấy biến thể theo SKU
 * PUBLIC
 */
router.get("/variants/sku/:sku", productVariantController.getVariantBySku);

/**
 * GET /api/v1/variants/:variantId/stock
 * Kiểm tra tồn kho
 * PUBLIC
 */
router.get("/variants/:variantId/stock", productVariantController.checkVariantStock);

// ====================================================================
// ADMIN ENDPOINTS
// ====================================================================

/**
 * POST /api/v1/admin/products/:productId/variants
 * Tạo biến thể sản phẩm mới
 * ADMIN ONLY
 */
router.post(
    "/admin/products/:productId/variants",
    authorization,
    productVariantController.createVariant
);

/**
 * PUT /api/v1/admin/variants/:variantId
 * Cập nhật biến thể
 * ADMIN ONLY
 */
router.put(
    "/admin/variants/:variantId",
    authorization,
    productVariantController.updateVariant
);

/**
 * DELETE /api/v1/admin/variants/:variantId
 * Xóa biến thể
 * ADMIN ONLY
 */
router.delete(
    "/admin/variants/:variantId",
    authorization,
    productVariantController.deleteVariant
);

/**
 * GET /api/v1/admin/products/:productId/variants
 * Lấy tất cả biến thể của sản phẩm (ADMIN)
 * ADMIN ONLY
 */
router.get(
    "/admin/products/:productId/variants",
    authorization,
    productVariantController.getVariantsByProductAdmin
);

module.exports = router;
