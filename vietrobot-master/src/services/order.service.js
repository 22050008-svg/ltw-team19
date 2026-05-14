// services/order.service.js
const { sequelize, Order, OrderDetail, Product, ProductVariant, Voucher, Payment } = require("../models");
const cartService = require("./cart.service");
const productVariantService = require("./productVariant.service");
const { AppError } = require("../helpers/error");

/**
 * Tạo một đơn hàng mới từ giỏ hàng của người dùng.
 * ★ THAY ĐỔI: Sử dụng ProductVariant thay vì Product
 * 
 * Quy trình:
 * 1. Lấy thông tin giỏ hàng (bây giờ lấy CartItem.productVariantId)
 * 2. Xác thực và áp dụng mã giảm giá
 * 3. Tạo Order chính
 * 4. Lặp qua CartItems với ProductVariant:
 *    a. Gọi productVariantService.decrementStock()
 *    b. Tạo OrderDetail với variant info (attributes, sku)
 * 5. Cập nhật voucher usageCount
 * 6. Xóa giỏ hàng
 * 
 * @param {number} userId - ID của người dùng đặt hàng
 * @param {object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<Order>}
 */
const createOrder = async (userId, orderData) => {
    const t = await sequelize.transaction();
    try {
        const {
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod,
            shippingFee = 0,
            customerNote,
            voucherCode
        } = orderData;

        // 1. Lấy thông tin giỏ hàng từ database
        // ★ THAY ĐỔI: getCartByUserId bây giờ trả về items với variant info
        const { items: cartItems, totalAmount: subtotal } = await cartService.getCartByUserId(userId);

        if (!cartItems || cartItems.length === 0) {
            throw new AppError(400, "Không thể tạo đơn hàng với giỏ hàng trống");
        }

        let discountAmount = 0;
        let finalAmount = subtotal + shippingFee;
        let voucher = null;

        // 2. Xác thực và áp dụng mã giảm giá
        if (voucherCode) {
            voucher = await Voucher.findOne({ where: { code: voucherCode } });
            if (!voucher) {
                throw new AppError(400, "Mã giảm giá không hợp lệ");
            }
            if (new Date(voucher.expiryDate) < new Date()) {
                throw new AppError(400, "Mã giảm giá đã hết hạn");
            }
            if (voucher.usageCount >= voucher.usageLimit) {
                throw new AppError(400, "Mã giảm giá đã hết lượt sử dụng");
            }

            if (voucher.discountType === 'percentage') {
                discountAmount = subtotal * (voucher.discountValue / 100);
            } else {
                discountAmount = voucher.discountValue;
            }
        }

        finalAmount -= discountAmount;
        finalAmount = Math.max(0, finalAmount);

        // 3. Tạo bản ghi Order chính
        const newOrder = await Order.create({
            userId,
            status: 'pending',
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingFee,
            discountAmount,
            totalAmount: finalAmount,
            customerNote,
            voucherCode: voucher ? voucher.code : null,
        }, { transaction: t });

        // 4. ★ THAY ĐỔI: Lặp qua CartItems với ProductVariant
        for (const item of cartItems) {
            const { productVariantId, quantity, variant } = item;

            // Gọi service để giảm tồn kho (nó sẽ check availability + decrement)
            await productVariantService.decrementStock(productVariantId, quantity, t);

            // Tạo OrderDetail với variant info
            await OrderDetail.create({
                orderId: newOrder.id,
                productVariantId: productVariantId,  // ★ THAY ĐỔI
                quantity: quantity,
                priceAtPurchase: parseFloat(variant.price),
                variantAttributes: variant.attributes,  // ★ THÊM: Lưu attributes
                sku: variant.sku  // ★ THÊM: Lưu SKU backup
            }, { transaction: t });
        }

        // 5. Cập nhật số lần sử dụng của voucher
        if (voucher) {
            await voucher.increment('usageCount', { transaction: t });
        }

        // 6. Xóa giỏ hàng
        await cartService.clearCart(userId, t);

        await t.commit();
        return newOrder;

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Error in createOrder service: ", error);
        throw new AppError(500, "Không thể tạo đơn hàng");
    }
};

/**
 * Lấy lịch sử đơn hàng của một người dùng
 * @param {number} userId
 * @returns {Promise<Array>}
 */
const getOrdersByUserId = async (userId) => {
    try {
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        return orders;
    } catch (error) {
        throw new AppError(500, "Không thể lấy lịch sử đơn hàng");
    }
};

/**
 * Lấy chi tiết một đơn hàng cụ thể
 * ★ THAY ĐỔI: Include ProductVariant + Product thay vì chỉ Product
 * @param {number} userId
 * @param {number} orderId
 * @returns {Promise<Order>}
 */
const getOrderDetails = async (userId, orderId) => {
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [
                {
                    model: OrderDetail,
                    as: 'items',
                    attributes: ['id', 'quantity', 'priceAtPurchase', 'variantAttributes', 'sku'],
                    include: [
                        {
                            model: ProductVariant,
                            as: 'variant',
<<<<<<< HEAD
                            attributes: ['id', 'sku', 'name', 'price', 'attributes', 'imageUrl'],
=======
                            attributes: ['id', 'sku', 'name', 'price', 'attributes'],
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['id', 'name', 'categoryId']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!order) {
            throw new AppError(404, "Không tìm thấy đơn hàng");
        }

        return order;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getOrderDetails service error:", error);
        throw new AppError(500, "Không thể lấy chi tiết đơn hàng");
    }
};

/**
 * Hủy một đơn hàng
 * ★ THAY ĐỔI: Gọi productVariantService.incrementStock() để hoàn kho
 * @param {number} userId
 * @param {number} orderId
 * @returns {Promise<Order>}
 */
const cancelOrder = async (userId, orderId) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [
                {
                    model: OrderDetail,
                    as: 'items'
                }
            ],
            transaction: t
        });

        if (!order) {
            throw new AppError(404, "Không tìm thấy đơn hàng");
        }

        // Chỉ cho phép hủy đơn hàng ở trạng thái pending
        if (order.status !== 'pending' && order.status !== 'processing') {
            throw new AppError(400, `Không thể hủy đơn hàng có trạng thái: ${order.status}`);
        }

        // Cập nhật trạng thái
        order.status = 'cancelled';
        await order.save({ transaction: t });

        // ★ THAY ĐỔI: Hoàn kho cho ProductVariant
        for (const orderDetail of order.items) {
            await productVariantService.incrementStock(
                orderDetail.productVariantId,
                orderDetail.quantity,
                t
            );
        }

        await t.commit();
        return order;

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("cancelOrder service error:", error);
        throw new AppError(500, "Không thể hủy đơn hàng");
    }
};

/**
 * Lấy trạng thái thanh toán của đơn hàng
 * @param {number} userId
 * @param {number} orderId
 * @returns {Promise<object>}
 */
const getPaymentStatus = async (userId, orderId) => {
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['status']
                }
            ],
            attributes: ['id', 'code', 'status']
        });

        if (!order) {
            throw new AppError(404, "Không tìm thấy đơn hàng");
        }

        return {
            orderStatus: order.status,
            paymentStatus: order.payment ? order.payment.status : null
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getPaymentStatus service error:", error);
        throw new AppError(500, "Không thể lấy trạng thái thanh toán");
    }
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    getOrderDetails,
    cancelOrder,
    getPaymentStatus,
};