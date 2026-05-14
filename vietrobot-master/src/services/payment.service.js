const crypto = require('crypto');
const { sequelize, Order, OrderDetail, Product, Voucher, Payment, Transaction } = require("../models");
const cartService = require("./cart.service");
<<<<<<< HEAD
const productVariantService = require('./productVariant.service');
const { AppError } = require("../helpers/error");
const { getIo, getUserSocketId } = require('../services/socket'); // Import các hàm hỗ trợ từ socket.js
const { emitToUser } = require('./socket'); 
const initiateOnlinePayment = async (userId, orderData) => {
    const t = await sequelize.transaction();
    try {
        console.log('💳 [Payment] Received orderData:', JSON.stringify(orderData, null, 2));
        console.log('💳 [Payment] orderData keys:', Object.keys(orderData));
        console.log('💳 [Payment] orderData.paymentMethod =', orderData.paymentMethod, 'Type:', typeof orderData.paymentMethod);
        
=======
const vnpayService = require("./vnpay.service");
const { AppError } = require("../helpers/error");
const { emitToUser } = require('./socket');
const paymentConfig = require('../config/payment.config');

/**
 * Xử lý thanh toán - Hỗ trợ COD, VNPay, Sebay
 */

/**
 * Tạo đơn hàng với phương thức thanh toán
 * Cho phép cả COD và thanh toán online
 */
const createOrderWithPayment = async (userId, orderData) => {
    const t = await sequelize.transaction();
    try {
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        const {
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod,
            shippingFee = 0,
            customerNote,
            voucherCode
        } = orderData;

<<<<<<< HEAD
        // Ví dụ, chỉ hỗ trợ 'sepay' cho luồng này
        console.log('💳 [Payment] After destructure - paymentMethod:', paymentMethod, ', Type:', typeof paymentMethod);
        console.log('💳 [Payment] Checking: paymentMethod === "sepay" ?', paymentMethod === 'sepay');
        if (paymentMethod !== 'sepay') {
            console.error('💳 [Payment] ERROR: Expected "sepay" but got:', JSON.stringify(paymentMethod));
            throw new AppError(400, `Phương thức thanh toán không được hỗ trợ cho quy trình này. Nhận: '${paymentMethod}'`);
=======
        // Kiểm tra phương thức thanh toán
        const validMethods = Object.values(paymentConfig.paymentMethods);
        if (!validMethods.includes(paymentMethod)) {
            throw new AppError(400, `Phương thức thanh toán '${paymentMethod}' không được hỗ trợ`);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        }

        const { items: cartItems, totalAmount: subtotal } = await cartService.getCartByUserId(userId);
        if (!cartItems || cartItems.length === 0) {
            throw new AppError(400, "Không thể tạo đơn hàng với giỏ hàng trống");
        }

<<<<<<< HEAD
        // Xử lý voucher (tương tự createOrder service)
=======
        // Xử lý voucher
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        let discountAmount = 0;
        let finalAmount = subtotal + shippingFee;
        let voucher = null;
        if (voucherCode) {
            voucher = await Voucher.findOne({ where: { code: voucherCode } });
<<<<<<< HEAD
            if (voucher /* && validation logic... */) {
=======
            if (voucher && voucher.active) {
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                if (voucher.discountType === 'percentage') {
                    discountAmount = subtotal * (voucher.discountValue / 100);
                } else {
                    discountAmount = voucher.discountValue;
                }
            }
        }
        finalAmount = Math.max(0, finalAmount - discountAmount);

<<<<<<< HEAD
        // 1. Tạo đơn hàng với trạng thái chờ thanh toán
        const newOrder = await Order.create({
            userId,
            status: 'awaiting_payment', // QUAN TRỌNG
=======
        // ===== TẠO ĐƠN HÀNG =====
        let orderStatus = 'pending';
        if (paymentMethod === paymentConfig.paymentMethods.COD) {
            // COD: Đơn hàng ở trạng thái 'pending'
            orderStatus = 'pending';
        } else if (paymentMethod === paymentConfig.paymentMethods.VNPAY) {
            // VNPay: Đơn hàng ở trạng thái 'awaiting_payment' cho đến khi webhook xác nhận
            orderStatus = 'awaiting_payment';
        } else {
            // Sebay: Đơn hàng ở trạng thái 'awaiting_payment'
            orderStatus = 'awaiting_payment';
        }

        const newOrder = await Order.create({
            userId,
            status: orderStatus,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
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

<<<<<<< HEAD
        // Tạo các bản ghi OrderDetail
        for (const item of cartItems) {
            const { productVariantId, quantity, variant } = item;

            // Giảm tồn kho
            await productVariantService.decrementStock(productVariantId, quantity, t);

            await OrderDetail.create({
                orderId: newOrder.id,
                productVariantId: productVariantId,
                quantity: quantity,
                priceAtPurchase: parseFloat(variant.price),
                variantAttributes: variant.attributes,
                sku: variant.sku,
            }, { transaction: t });
        }

        // 2. Tạo bản ghi giao dịch thanh toán
        let rs=await Payment.create({
=======
        // Tạo OrderDetail
        for (const item of cartItems) {
            await OrderDetail.create({
                orderId: newOrder.id,
                productId: item.product.id,
                quantity: item.quantity,
                priceAtPurchase: item.variant.price,
            }, { transaction: t });
        }

        // Tạo Payment record
        const paymentRecord = await Payment.create({
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            orderId: newOrder.id,
            amount: finalAmount,
            paymentMethod: paymentMethod,
            status: 'pending',
        }, { transaction: t });

<<<<<<< HEAD
       

        await t.commit();

        // 4. Trả về Order object cho client (không phải Payment)
        console.log('✅ [Payment] Returning order data to client:', { orderId: newOrder.id, amount: finalAmount, id: newOrder.id });
        return {
            orderId: newOrder.id,
            id: newOrder.id,
            amount: finalAmount,
            paymentMethod: newOrder.paymentMethod,
            status: newOrder.status,
=======
        await t.commit();

        // Xử lý xóa giỏ hàng cho COD (vì không cần chờ webhook)
        if (paymentMethod === paymentConfig.paymentMethods.COD) {
            await cartService.clearCart(userId);
            
            // Trừ tồn kho
            for (const item of cartItems) {
                await Product.decrement('stockQuantity', {
                    by: item.quantity,
                    where: { id: item.product.id }
                });
            }

            // Emit socket event
            try {
                emitToUser(userId, 'order_created', {
                    message: `Đơn hàng ${newOrder.code} của bạn đã được tạo. Xin vui lòng chờ xác nhận.`,
                    orderId: newOrder.id,
                    orderCode: newOrder.code,
                    paymentMethod: 'cod'
                });
            } catch (err) {
                console.error("Socket emit error:", err);
            }
        }

        return {
            order: newOrder,
            payment: paymentRecord
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        };

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
<<<<<<< HEAD
        console.error("Error in initiateOnlinePayment service: ", error);
        throw new AppError(500, "Không thể khởi tạo thanh toán.");
=======
        console.error("Error in createOrderWithPayment: ", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw new AppError(500, `Không thể tạo đơn hàng: ${error.message}`);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    }
};

/**
<<<<<<< HEAD
 * Xử lý webhook từ Sebay.
 * 1. Xác thực chữ ký.
 * 2. Tìm đơn hàng và giao dịch.
 * 3. Cập nhật trạng thái đơn hàng, giao dịch.
 * 4. Trừ tồn kho, xóa giỏ hàng nếu thành công.
 * @param {object} payload - Dữ liệu Sebay gửi đến.
 * @param {string} signature - Chữ ký Sebay gửi trong header.
 */
/**
 * Trích xuất orderId từ nội dung chuyển khoản.
 * SePay gửi content = "SEVQR<orderId>" hoặc "... SEVQR<orderId> ..."
 * Cũng thử field `code` nếu content không khớp.
 */
function extractOrderId(content, code) {
    // Ưu tiên 1: tìm SEVQR<số> trong content
    if (content) {
        const match = content.match(/SEVQR(\d+)/i);
        if (match) return parseInt(match[1], 10);
    }
    // Ưu tiên 2: tìm SEVQR<số> trong code
    if (code) {
        const match = code.match(/SEVQR(\d+)/i);
        if (match) return parseInt(match[1], 10);
    }
    return null;
}

const handleSebayWebhook = async (payload, signature) => {
    console.log('📦 [Webhook] Full payload:', JSON.stringify(payload, null, 2));

    const { code, transferType, id: gatewayTransactionId, transferAmount, content } = payload;

    // Chỉ xử lý giao dịch tiền vào
    if (transferType !== 'in') {
        console.log(`Webhook: Bỏ qua vì không phải giao dịch tiền vào (type: ${transferType}).`);
        return;
    }

    const orderId = extractOrderId(content, code);
    console.log(`🔍 [Webhook] content="${content}", code="${code}" → orderId=${orderId}`);

    if (!orderId) {
        console.warn(`⚠️ [Webhook] Không thể trích xuất orderId từ content="${content}" và code="${code}". Bỏ qua.`);
=======
 * Khởi tạo thanh toán VNPay
 * Trả về URL thanh toán cho client
 */
const initiateVNPayPayment = async (userId, orderData) => {
    const t = await sequelize.transaction();
    try {
        // Tạo đơn hàng trước
        const result = await createOrderWithPayment(userId, orderData);
        const { order, payment } = result;

        if (orderData.paymentMethod !== paymentConfig.paymentMethods.VNPAY) {
            throw new AppError(400, "Phương thức thanh toán không phải VNPay");
        }

        // Tạo URL thanh toán VNPay
        const paymentUrl = vnpayService.createVNPayUrl(
            order.id,
            order.totalAmount,
            `Don hang ${order.code}`
        );

        // Cập nhật payment record với URL
        payment.paymentUrl = paymentUrl;
        await payment.save();

        return {
            paymentUrl: paymentUrl,
            orderId: order.id,
            orderCode: order.code,
            amount: order.totalAmount
        };

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Error in initiateVNPayPayment: ", error);
        throw new AppError(500, "Không thể khởi tạo thanh toán VNPay");
    }
};

/**
 * Xử lý VNPay Return (Khi khách quay lại từ VNPay)
 */
const handleVNPayReturn = async (vnpParams) => {
    const t = await sequelize.transaction();
    try {
        // Xác minh chữ ký
        if (!vnpayService.verifyVNPayResponse(vnpParams)) {
            throw new AppError(400, "Chữ ký VNPay không hợp lệ");
        }

        const orderId = parseInt(vnpParams.vnp_TxnRef);
        const responseCode = vnpParams.vnp_ResponseCode;
        
        const order = await Order.findOne({
            where: { id: orderId },
            include: [{ association: 'products', include: 'OrderDetail' }],
            transaction: t
        });

        if (!order) {
            throw new AppError(404, "Không tìm thấy đơn hàng");
        }

        const payment = await Payment.findOne({
            where: { orderId: order.id },
            transaction: t
        });

        if (!payment) {
            throw new AppError(404, "Không tìm thấy giao dịch thanh toán");
        }

        // Chống trùng lặp
        if (payment.transactionId) {
            console.log(`Bỏ qua vì giao dịch đã xử lý: ${payment.transactionId}`);
            await t.commit();
            return {
                success: true,
                message: "Giao dịch đã được xử lý trước đó"
            };
        }

        // Kiểm tra response code
        if (responseCode === '00') {
            // Thành công
            order.status = 'processing';
            payment.status = 'succeeded';
            payment.transactionId = vnpParams.vnp_TransactionNo || `VNPAY-${Date.now()}`;
            payment.gatewayResponse = vnpParams;

            // Trừ tồn kho
            if (order.products && Array.isArray(order.products)) {
                for (const product of order.products) {
                    const quantityOrdered = product.OrderDetail.quantity;
                    await Product.decrement('stockQuantity', {
                        by: quantityOrdered,
                        where: { id: product.id },
                        transaction: t
                    });
                }
            }

            // Xóa giỏ hàng
            await cartService.clearCart(order.userId, t);

            await order.save({ transaction: t });
            await payment.save({ transaction: t });
            await t.commit();

            try {
                emitToUser(order.userId, 'payment_success', {
                    message: `Thanh toán cho đơn hàng ${order.code} thành công!`,
                    orderId: order.id,
                    orderCode: order.code,
                    orderStatus: order.status
                });
            } catch (err) {
                console.error("Socket emit error:", err);
            }

            return {
                success: true,
                message: "Thanh toán thành công",
                orderId: order.id,
                orderCode: order.code
            };
        } else {
            // Thất bại
            order.status = 'cancelled';
            payment.status = 'failed';
            payment.gatewayResponse = vnpParams;

            await order.save({ transaction: t });
            await payment.save({ transaction: t });
            await t.commit();

            throw new AppError(400, `Thanh toán thất bại: ${vnpParams.vnp_ResponseCode}`);
        }

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Error in handleVNPayReturn: ", error);
        throw new AppError(500, "Lỗi xử lý kết quả thanh toán");
    }
};

/**
 * Khởi tạo thanh toán online (cũ - Sebay)
 */
const initiateOnlinePayment = async (userId, orderData) => {
    // Forward to COD hoặc VNPAY tùy theo paymentMethod
    const paymentMethod = orderData.paymentMethod;

    if (paymentMethod === paymentConfig.paymentMethods.COD) {
        return await createOrderWithPayment(userId, orderData);
    } else if (paymentMethod === paymentConfig.paymentMethods.VNPAY) {
        return await initiateVNPayPayment(userId, orderData);
    } else if (paymentMethod === paymentConfig.paymentMethods.SEBAY) {
        return await createOrderWithPayment(userId, orderData);
    } else {
        throw new AppError(400, "Phương thức thanh toán không được hỗ trợ");
    }
};

function getNumberFromEnd(str) {
    const match = str.match(/(\d+)$/);
    return match ? match[1] : null;
}

/**
 * Xử lý webhook từ Sebay
 */
const handleSebayWebhook = async (payload, signature) => {
    const { code: orderCode, transferType, id: gatewayTransactionId, transferAmount, content } = payload;
    let id = getNumberFromEnd(content);

    // Chỉ xử lý giao dịch tiền vào
    if (transferType !== 'in') {
        console.log(`Webhook: Skipping transaction because it's not an 'in' type.`);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        return;
    }

    const t = await sequelize.transaction();
    try {
<<<<<<< HEAD
        const order = await Order.findOne({ where: { id: orderId } });
        if (!order) {
            console.error(`❌ [Webhook] Không tìm thấy đơn hàng với id=${orderId}`);
            throw new AppError(404, "Webhook: Không tìm thấy đơn hàng.");
        }

        console.log(`✅ [Webhook] Tìm thấy đơn hàng #${order.id}, trạng thái: ${order.status}`);

        const payment = await Payment.findOne({ where: { orderId: order.id } });
        if (!payment) throw new AppError(404, "Webhook: Không tìm thấy giao dịch thanh toán.");

        // Chống trùng lặp: Nếu giao dịch này đã xử lý, bỏ qua
        if (payment.transactionId) {
            console.log(`Webhook: Bỏ qua vì đơn hàng #${order.id} đã được xử lý (transactionId: ${payment.transactionId}).`);
=======
        const order = await Order.findOne({
            where: { id },
            include: [{ association: 'products', include: 'OrderDetail' }],
            transaction: t
        });

        if (!order) throw new AppError(404, "Webhook: Không tìm thấy đơn hàng.");

        const payment = await Payment.findOne({ where: { orderId: order.id }, transaction: t });
        if (!payment) throw new AppError(404, "Webhook: Không tìm thấy giao dịch thanh toán.");

        // Chống trùng lặp
        if (payment.transactionId) {
            console.log(`Webhook: Bỏ qua vì giao dịch đã được xử lý (transactionId: ${payment.transactionId}).`);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            await t.commit();
            return;
        }

<<<<<<< HEAD
        // Kiểm tra số tiền có khớp không
        if (parseFloat(order.totalAmount) !== parseFloat(transferAmount)) {
            console.warn(`Webhook: Số tiền không khớp cho đơn hàng #${order.id}. Mong đợi: ${order.totalAmount}, Nhận: ${transferAmount}`);
=======
        // Kiểm tra số tiền
        if (parseFloat(order.totalAmount) !== parseFloat(transferAmount)) {
            console.warn(`Webhook: Amount mismatch for order ${orderCode}. Expected: ${order.totalAmount}, Received: ${transferAmount}`);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            order.status = 'failed';
            payment.status = 'failed';
            payment.gatewayResponse = { ...payload, error: 'Amount mismatch' };
            await order.save({ transaction: t });
            await payment.save({ transaction: t });
            await t.commit();
            return;
        }

<<<<<<< HEAD
        // Thanh toán hợp lệ
=======
        // Xử lý thành công
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        if (order.status === 'awaiting_payment') {
            order.status = 'processing';
            payment.status = 'succeeded';

<<<<<<< HEAD
            // XÓA GIỎ HÀNG (stock đã giảm khi tạo đơn trong initiateOnlinePayment)
            await cartService.clearCart(order.userId, t);
        } else {
            console.log(`Webhook: Bỏ qua vì đơn hàng #${order.id} không ở trạng thái awaiting_payment (hiện tại: ${order.status}).`);
        }

        payment.transactionId = String(gatewayTransactionId);
        payment.gatewayResponse = payload;
        await order.save({ transaction: t });
        await payment.save({ transaction: t });
        await t.commit();

        // Gửi socket notification cho user
        try {
            emitToUser(order.userId, 'payment_success', {
                message: `Thanh toán cho đơn hàng #${order.id} của bạn đã thành công!`,
=======
            // Trừ tồn kho
            if (order.products && Array.isArray(order.products)) {
                for (const product of order.products) {
                    const quantityOrdered = product.OrderDetail.quantity;
                    await Product.decrement('stockQuantity', {
                        by: quantityOrdered,
                        where: { id: product.id },
                        transaction: t
                    });
                }
            }

            // Xóa giỏ hàng
            await cartService.clearCart(order.userId, t);
        }

        payment.transactionId = gatewayTransactionId;
        payment.gatewayResponse = payload;
        await order.save({ transaction: t });
        await payment.save({ transaction: t });

        await t.commit();

        try {
            emitToUser(order.userId, 'payment_success', {
                message: `Thanh toán cho đơn hàng ${order.code} của bạn đã thành công!`,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                orderId: order.id,
                orderCode: order.code,
                orderStatus: order.status,
            });
<<<<<<< HEAD
            console.log(`✅ [Webhook] Emitted 'payment_success' to user ${order.userId}`);
        } catch (socketError) {
            console.error("Lỗi gửi socket sau thanh toán thành công:", socketError);
        }

    } catch (error) {
        await t.rollback();
        console.error(`❌ [Webhook] Xử lý thất bại:`, error.message);
=======
            console.log(`✅ Emitted 'payment_success' to user ${order.userId}`);
        } catch (socketError) {
            console.error("Error emitting socket event after successful payment:", socketError);
        }
    } catch (error) {
        await t.rollback();
        console.error(`Webhook processing failed for order ${orderCode}:`, error);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        throw error;
    }
};

module.exports = {
<<<<<<< HEAD
=======
    createOrderWithPayment,
    initiateVNPayPayment,
    handleVNPayReturn,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    initiateOnlinePayment,
    handleSebayWebhook,
};