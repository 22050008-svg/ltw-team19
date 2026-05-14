// services/cart.service.js
const { User, Cart, CartItem, Product, ProductVariant, sequelize } = require("../models");
const { AppError } = require("../helpers/error");
const productVariantService = require("./productVariant.service");

/**
 * Helper function để tìm hoặc tạo giỏ hàng cho một người dùng.
 * @param {number} userId - ID của người dùng.
 * @param {object} transaction - Transaction của Sequelize (nếu có).
 * @returns {Promise<Cart>} - Trả về instance của Cart.
 */
const findOrCreateCart = async (userId, transaction = null) => {
    const [cart] = await Cart.findOrCreate({
        where: { userId },
        transaction,
    });
    return cart;
};

/**
 * Lấy toàn bộ sản phẩm trong giỏ hàng của người dùng (với variant info)
 * @param {number} userId - ID của người dùng.
 * @returns {Promise<object>} - Object chứa danh sách items và tổng tiền.
 */
const getCartByUserId = async (userId) => {
    try {
        const cart = await findOrCreateCart(userId);

        // ★ THAY ĐỔI: Lấy CartItem kèm ProductVariant & Product
        const cartItems = await CartItem.findAll({
            where: { cartId: cart.id },
            include: [
                {
                    model: ProductVariant,
                    as: 'variant',
                    attributes: ['id', 'sku', 'name', 'price', 'imageUrl', 'attributes'],
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'quantity', 'productVariantId']
        });

        // ★ Format lại dữ liệu để trả về
        const items = cartItems.map(item => ({
            id: item.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            product: item.variant.product,
            variant: {
                id: item.variant.id,
                sku: item.variant.sku,
                name: item.variant.name,
                price: item.variant.price,
                imageUrl: item.variant.imageUrl,
                attributes: item.variant.attributes
            },
            subtotal: parseFloat(item.variant.price) * item.quantity
        }));

        // Tính tổng tiền
        const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

        return { items, totalAmount, itemCount: items.length };
    } catch (error) {
        console.error("getCartByUserId service error:", error);
        throw new AppError(500, "Không thể lấy thông tin giỏ hàng");
    }
};

/**
 * Thêm biến thể sản phẩm vào giỏ hoặc cập nhật số lượng nếu đã tồn tại.
 * ★ THAY ĐỔI: productId -> productVariantId
 * @param {number} userId - ID người dùng.
 * @param {number} productVariantId - ID biến thể sản phẩm.
 * @param {number} quantity - Số lượng mong muốn.
 * @returns {Promise<object>} - Trả về giỏ hàng đã được cập nhật.
 */
const addOrUpdateItem = async (userId, productVariantId, quantity) => {
    const t = await sequelize.transaction();
    try {
        // 1. ★ THAY ĐỔI: Kiểm tra biến thể có tồn tại và đủ hàng không
        const variant = await ProductVariant.findByPk(productVariantId);
        if (!variant) {
            throw new AppError(404, "Biến thể sản phẩm không tồn tại");
        }
        if (variant.status !== 'active') {
            throw new AppError(400, "Sản phẩm này không còn được bán");
        }
        if (variant.stockQuantity < quantity) {
            throw new AppError(400, `Sản phẩm không đủ số lượng tồn kho. Còn lại: ${variant.stockQuantity}`);
        }
        if (quantity <= 0) {
            // Nếu số lượng <= 0, coi như là xóa sản phẩm
            return await removeItem(userId, productVariantId);
        }

        // 2. Tìm hoặc tạo giỏ hàng cho user
        const cart = await findOrCreateCart(userId, t);

        // 3. ★ THAY ĐỔI: Tìm CartItem dựa trên productVariantId
        const [cartItem, created] = await CartItem.findOrCreate({
            where: { cartId: cart.id, productVariantId: productVariantId },
            defaults: { quantity: quantity },
            transaction: t,
        });

        // Nếu CartItem đã tồn tại (không phải mới tạo), thì CẬP NHẬT số lượng
        if (!created) {
            cartItem.quantity = quantity;  // ✅ SET bằng quantity (không += !)
            await cartItem.save({ transaction: t });
        }
        
        await t.commit();

        // 4. Trả về giỏ hàng mới nhất
        return await getCartByUserId(userId);
    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) {
            throw error;
        }
        console.error("addOrUpdateItem service error:", error);
        throw new AppError(500, "Không thể cập nhật giỏ hàng");
    }
};

/**
 * Xóa một biến thể sản phẩm khỏi giỏ hàng.
 * ★ THAY ĐỔI: productId -> productVariantId
 * @param {number} userId - ID người dùng.
 * @param {number} productVariantId - ID biến thể cần xóa.
 * @returns {Promise<object>} - Trả về giỏ hàng đã được cập nhật.
 */
const removeItem = async (userId, productVariantId) => {
    try {
        const cart = await findOrCreateCart(userId);
        
        // ★ THAY ĐỔI: Xóa CartItem dựa trên productVariantId
        await CartItem.destroy({
            where: { cartId: cart.id, productVariantId: productVariantId }
        });

        return await getCartByUserId(userId);
    } catch (error) {
        console.error("removeItem service error:", error);
        throw new AppError(500, "Không thể xóa sản phẩm khỏi giỏ hàng");
    }
};

/**
 * Xóa sạch tất cả sản phẩm trong giỏ hàng của người dùng.
 * @param {number} userId - ID người dùng.
 * @param {object} transaction - Sequelize transaction (tùy chọn)
 * @returns {Promise<object>} - Trả về giỏ hàng trống.
 */
const clearCart = async (userId, transaction = null) => {
    try {
        const cart = await findOrCreateCart(userId, transaction);
        
        // ★ THAY ĐỔI: Xóa tất cả CartItems
        await CartItem.destroy({
            where: { cartId: cart.id },
            transaction
        });

        return await getCartByUserId(userId);
    } catch (error) {
        console.error("clearCart service error:", error);
        throw new AppError(500, "Không thể xóa sạch giỏ hàng");
    }
};

module.exports = {
    getCartByUserId,
    addOrUpdateItem,
    removeItem,
    clearCart,
    findOrCreateCart, // Export để dùng trong services khác
};