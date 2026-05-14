// services/productVariant.service.js
const { ProductVariant, Product, sequelize } = require("../models");
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize");

// ====================================================================
// SECTION: PUBLIC SERVICES
// ====================================================================

/**
 * Lấy một biến thể dựa trên SKU
 * @param {string} sku
 * @returns {Promise<ProductVariant>}
 */
const getVariantBySku = async (sku) => {
    try {
        const variant = await ProductVariant.findOne({
            where: { sku },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'categoryId']
                }
            ]
        });

        if (!variant) {
            throw new AppError(404, `Biến thể với SKU "${sku}" không tồn tại`);
        }

        return variant;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getVariantBySku service error:", error);
        throw new AppError(500, "Không thể lấy thông tin biến thể");
    }
};

/**
 * Lấy tất cả biến thể của một sản phẩm
 * @param {number} productId
 * @returns {Promise<Array>}
 */
const getVariantsByProduct = async (productId) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError(404, "Sản phẩm không tồn tại");
        }

        const variants = await ProductVariant.findAll({
            where: { productId },
            order: [['createdAt', 'DESC']]
        });

        return variants;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getVariantsByProduct service error:", error);
        throw new AppError(500, "Không thể lấy biến thể sản phẩm");
    }
};

/**
 * Lấy chi tiết một biến thể với tất cả thông tin
 * @param {number} variantId
 * @returns {Promise<ProductVariant>}
 */
const getVariantDetails = async (variantId) => {
    try {
        const variant = await ProductVariant.findByPk(variantId, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description', 'categoryId']
                }
            ]
        });

        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        return variant;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getVariantDetails service error:", error);
        throw new AppError(500, "Không thể lấy chi tiết biến thể");
    }
};

/**
 * Kiểm tra tồn kho của biến thể
 * @param {number} variantId
 * @param {number} requestedQuantity - Số lượng yêu cầu
 * @returns {Promise<boolean>}
 */
const checkStockAvailability = async (variantId, requestedQuantity) => {
    try {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        if (variant.stockQuantity < requestedQuantity) {
            return false;
        }

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("checkStockAvailability service error:", error);
        throw new AppError(500, "Không thể kiểm tra tồn kho");
    }
};

/**
 * Lấy thông tin tồn kho
 * @param {number} variantId
 * @returns {Promise<object>}
 */
const getStockInfo = async (variantId) => {
    try {
        const variant = await ProductVariant.findByPk(variantId, {
            attributes: ['id', 'sku', 'name', 'stockQuantity', 'status']
        });

        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        return {
            variantId: variant.id,
            sku: variant.sku,
            name: variant.name,
            stockQuantity: variant.stockQuantity,
            isAvailable: variant.stockQuantity > 0 && variant.status === 'active'
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getStockInfo service error:", error);
        throw new AppError(500, "Không thể lấy thông tin tồn kho");
    }
};

// ====================================================================
// SECTION: ADMIN SERVICES
// ====================================================================

/**
 * Tạo một biến thể sản phẩm mới (Admin)
 * @param {number} productId
 * @param {object} variantData - { sku, name, attributes, price, costPrice, stockQuantity, barcode, imageUrl, status }
 * @returns {Promise<ProductVariant>}
 */
const createVariant = async (productId, variantData) => {
    try {
        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError(404, "Sản phẩm không tồn tại");
        }

        const { sku, name, attributes, price, costPrice, stockQuantity, barcode, imageUrl, status } = variantData;

        // Kiểm tra SKU đã tồn tại chưa
        const existingSku = await ProductVariant.findOne({ where: { sku } });
        if (existingSku) {
            throw new AppError(400, `SKU "${sku}" đã tồn tại`);
        }

        // Kiểm tra barcode (nếu có)
        if (barcode) {
            const existingBarcode = await ProductVariant.findOne({ where: { barcode } });
            if (existingBarcode) {
                throw new AppError(400, `Barcode "${barcode}" đã tồn tại`);
            }
        }

        // Kiểm tra giá
        if (!price || price < 0) {
            throw new AppError(400, "Giá bán không hợp lệ");
        }

        const variant = await ProductVariant.create({
            productId,
            sku,
            name: name || `Variant ${sku}`,
            attributes: attributes || {},
            price,
            costPrice: costPrice || 0,
            stockQuantity: stockQuantity || 0,
            barcode: barcode || null,
            imageUrl: imageUrl || null,
            status: status || 'active'
        });

        return variant;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("createVariant service error:", error);
        throw new AppError(500, "Không thể tạo biến thể sản phẩm");
    }
};

/**
 * Cập nhật biến thể (Admin)
 * @param {number} variantId
 * @param {object} updateData - { name, attributes, price, costPrice, stockQuantity, barcode, imageUrl, status }
 * @returns {Promise<ProductVariant>}
 */
const updateVariant = async (variantId, updateData) => {
    try {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        // Kiểm tra SKU nếu update
        if (updateData.sku && updateData.sku !== variant.sku) {
            const existing = await ProductVariant.findOne({
                where: { sku: updateData.sku }
            });
            if (existing) {
                throw new AppError(400, `SKU "${updateData.sku}" đã tồn tại`);
            }
        }

        // Kiểm tra barcode nếu update
        if (updateData.barcode && updateData.barcode !== variant.barcode) {
            const existing = await ProductVariant.findOne({
                where: { barcode: updateData.barcode }
            });
            if (existing) {
                throw new AppError(400, `Barcode "${updateData.barcode}" đã tồn tại`);
            }
        }

        // Kiểm tra giá nếu update
        if (updateData.price !== undefined && updateData.price < 0) {
            throw new AppError(400, "Giá bán không hợp lệ");
        }

        await variant.update(updateData);
        return variant;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("updateVariant service error:", error);
        throw new AppError(500, "Không thể cập nhật biến thể");
    }
};

/**
 * Xóa biến thể (Admin)
 * @param {number} variantId
 * @returns {Promise<boolean>}
 */
const deleteVariant = async (variantId) => {
    try {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        await variant.destroy();
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("deleteVariant service error:", error);
        throw new AppError(500, "Không thể xóa biến thể");
    }
};

// ====================================================================
// SECTION: INTERNAL SERVICES (Sử dụng bởi Order/Cart Services)
// ====================================================================

/**
 * Giảm tồn kho (được gọi khi tạo đơn hàng)
 * @param {number} variantId
 * @param {number} quantity
 * @param {object} transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const decrementStock = async (variantId, quantity, transaction = null) => {
    try {
        const variant = await ProductVariant.findByPk(variantId, {
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined
        });

        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        if (variant.stockQuantity < quantity) {
            throw new AppError(400, `Sản phẩm "${variant.name}" không đủ hàng. Còn lại: ${variant.stockQuantity}`);
        }

        await variant.decrement('stockQuantity', {
            by: quantity,
            transaction
        });

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("decrementStock service error:", error);
        throw new AppError(500, "Không thể giảm tồn kho");
    }
};

/**
 * Tăng tồn kho (được gọi khi hủy đơn hàng)
 * @param {number} variantId
 * @param {number} quantity
 * @param {object} transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const incrementStock = async (variantId, quantity, transaction = null) => {
    try {
        const variant = await ProductVariant.findByPk(variantId, {
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined
        });

        if (!variant) {
            throw new AppError(404, "Biến thể không tồn tại");
        }

        await variant.increment('stockQuantity', {
            by: quantity,
            transaction
        });

        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("incrementStock service error:", error);
        throw new AppError(500, "Không thể tăng tồn kho");
    }
};

/**
 * Bulk giảm tồn kho (hữu ích cho multiple items)
 * @param {Array} items - [{ variantId, quantity }, ...]
 * @param {object} transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const decrementBulkStock = async (items, transaction) => {
    try {
        for (const item of items) {
            await decrementStock(item.variantId, item.quantity, transaction);
        }
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("decrementBulkStock service error:", error);
        throw error;
    }
};

module.exports = {
    // PUBLIC
    getVariantBySku,
    getVariantsByProduct,
    getVariantDetails,
    checkStockAvailability,
    getStockInfo,
    // ADMIN
    createVariant,
    updateVariant,
    deleteVariant,
    // INTERNAL
    decrementStock,
    incrementStock,
    decrementBulkStock,
};
