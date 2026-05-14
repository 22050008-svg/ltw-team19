// controllers/productVariant.controller.js
const productVariantService = require("../services/productVariant.service");
const { response } = require("../helpers/response");

// ====================================================================
// PUBLIC ENDPOINTS
// ====================================================================

/**
 * GET /products/:productId/variants
 * Lấy tất cả biến thể của một sản phẩm (PUBLIC)
 */
const getProductVariants = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const variants = await productVariantService.getVariantsByProduct(productId);
        res.status(200).json(response({
            productId,
            count: variants.length,
            variants
        }));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /variants/:variantId
 * Lấy chi tiết một biến thể (PUBLIC)
 */
const getVariantDetails = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const variant = await productVariantService.getVariantDetails(variantId);
        res.status(200).json(response(variant));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /variants/:variantId/stock
 * Lấy thông tin tồn kho (PUBLIC)
 */
const checkVariantStock = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const stockInfo = await productVariantService.getStockInfo(variantId);
        res.status(200).json(response(stockInfo));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /variants/sku/:sku
 * Lấy biến thể theo SKU (PUBLIC)
 */
const getVariantBySku = async (req, res, next) => {
    try {
        const { sku } = req.params;
        const variant = await productVariantService.getVariantBySku(sku);
        res.status(200).json(response(variant));
    } catch (error) {
        next(error);
    }
};

// ====================================================================
// ADMIN ENDPOINTS
// ====================================================================

/**
 * POST /admin/products/:productId/variants
 * Tạo biến thể sản phẩm mới (ADMIN)
 */
const createVariant = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const variantData = req.body;

        // Validate required fields
        const { sku, price } = variantData;
        if (!sku || !price) {
            return res.status(400).json(response({ 
                error: "SKU và giá bán là bắt buộc" 
            }));
        }

        const variant = await productVariantService.createVariant(productId, variantData);
        res.status(201).json(response(variant));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /admin/variants/:variantId
 * Cập nhật biến thể (ADMIN)
 */
const updateVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const updateData = req.body;
        const variant = await productVariantService.updateVariant(variantId, updateData);
        res.status(200).json(response(variant));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /admin/variants/:variantId
 * Xóa biến thể (ADMIN)
 */
const deleteVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        await productVariantService.deleteVariant(variantId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * GET /admin/products/:productId/variants
 * Lấy tất cả biến thể của sản phẩm (ADMIN)
 */
const getVariantsByProductAdmin = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const variants = await productVariantService.getVariantsByProduct(productId);
        res.status(200).json(response({
            productId,
            count: variants.length,
            variants
        }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // PUBLIC
    getProductVariants,
    getVariantDetails,
    checkVariantStock,
    getVariantBySku,
    // ADMIN
    createVariant,
    updateVariant,
    deleteVariant,
    getVariantsByProductAdmin,
};
