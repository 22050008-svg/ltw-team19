// services/admin/orders.service.js
const { Op } = require("sequelize");
<<<<<<< HEAD
const { sequelize, Order, OrderDetail, Product, ProductVariant, User, Transaction, Voucher } = require("../models");
=======
const { sequelize, Order, OrderDetail, Product, User, Transaction, Voucher } = require("../models");
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
const { AppError } = require("../helpers/error");

/**
 * Tạo một đơn hàng mới bởi Admin.
 * Quy trình này không sử dụng giỏ hàng mà nhận trực tiếp danh sách sản phẩm.
 * @param {object} orderData - Dữ liệu đơn hàng từ admin.
 * @param {number} [orderData.userId] - ID của khách hàng (nếu là khách đã có tài khoản).
 * @param {string} orderData.recipientName - Tên người nhận.
 * @param {string} orderData.recipientPhone - SĐT người nhận.
 * @param {string} orderData.shippingAddress - Địa chỉ giao hàng.
 * @param {string} orderData.paymentMethod - Phương thức thanh toán.
 * @param {string} orderData.status - Trạng thái ban đầu của đơn hàng.
 * @param {Array<object>} orderData.items - Mảng sản phẩm [{ productId, quantity, priceAtPurchase }].
 * @param {number} [orderData.shippingFee=0] - Phí vận chuyển.
 * @param {string} [orderData.voucherCode] - Mã giảm giá.
 * @param {string} [orderData.customerNote] - Ghi chú của khách.
 * @param {number} adminId - ID của admin tạo đơn hàng.
 * @returns {Promise<Order>} - Đơn hàng vừa được tạo.
 */
const createOrderByAdmin = async (orderData, adminId) => {
    const t = await sequelize.transaction();
    try {
        const {
            userId,
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod,
            status = 'processing', // Admin tạo đơn thường là đã xác nhận -> 'processing'
            items,
            shippingFee = 0,
            voucherCode,
            customerNote,
        } = orderData;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError(400, "Đơn hàng phải có ít nhất một sản phẩm.");
        }
        if (!recipientName || !recipientPhone || !shippingAddress) {
            throw new AppError(400, "Vui lòng cung cấp đầy đủ thông tin người nhận.");
        }

        // 1. Tính toán subtotal từ danh sách sản phẩm
        let subtotal = 0;
        for (const item of items) {
<<<<<<< HEAD
            const variant = await ProductVariant.findByPk(item.productVariantId);
            if (!variant) throw new AppError(404, `Biến thể sản phẩm với ID ${item.productVariantId} không tồn tại.`);
            const price = item.priceAtPurchase !== undefined ? item.priceAtPurchase : variant.price;
=======
            const product = await Product.findByPk(item.productId);
            if (!product) throw new AppError(404, `Sản phẩm với ID ${item.productId} không tồn tại.`);
            const price = item.priceAtPurchase !== undefined ? item.priceAtPurchase : product.price;
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            subtotal += price * item.quantity;
        }

        // 2. Xử lý voucher
        let discountAmount = 0;
        if (voucherCode) {
            const voucher = await Voucher.findOne({ where: { code: voucherCode } });
            if (voucher) {
                if (voucher.discountType === 'percentage') {
                    discountAmount = subtotal * (voucher.discountValue / 100);
                } else { // fixed_amount
                    discountAmount = voucher.discountValue;
                }
                await voucher.increment('usageCount', { transaction: t });
            }
        }

        // 3. Tính tổng tiền cuối cùng
        const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

        // 4. Tạo bản ghi Order chính
        const newOrder = await Order.create({ userId, recipientName, recipientPhone, shippingAddress, paymentMethod, status, subtotal, shippingFee, discountAmount, totalAmount, customerNote, voucherCode }, { transaction: t });

        // 5. Tạo OrderDetail và trừ tồn kho
        for (const item of items) {
<<<<<<< HEAD
            const variant = await ProductVariant.findByPk(item.productVariantId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!variant) throw new AppError(404, `Biến thể sản phẩm với ID ${item.productVariantId} không tồn tại.`);
            if (variant.stockQuantity < item.quantity) throw new AppError(400, `Biến thể "${variant.name}" không đủ hàng. Cần: ${item.quantity}, Tồn kho: ${variant.stockQuantity}`);
            const priceAtPurchase = item.priceAtPurchase !== undefined ? item.priceAtPurchase : variant.price;
            await OrderDetail.create({ orderId: newOrder.id, productVariantId: item.productVariantId, quantity: item.quantity, priceAtPurchase: priceAtPurchase }, { transaction: t });
            await variant.decrement('stockQuantity', { by: item.quantity, transaction: t });
=======
            const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
            if (product.stockQuantity < item.quantity) throw new AppError(400, `Sản phẩm "${product.name}" không đủ hàng. Cần: ${item.quantity}, Tồn kho: ${product.stockQuantity}`);
            const priceAtPurchase = item.priceAtPurchase !== undefined ? item.priceAtPurchase : product.price;
            await OrderDetail.create({ orderId: newOrder.id, productId: item.productId, quantity: item.quantity, priceAtPurchase: priceAtPurchase }, { transaction: t });
            await product.decrement('stockQuantity', { by: item.quantity, transaction: t });
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        }

        // 6. Nếu đơn hàng được giao thành công ngay, tạo giao dịch doanh thu
        if (status === 'delivered') {
            await Transaction.create({ amount: totalAmount, type: 'income', description: `Doanh thu từ đơn hàng #${newOrder.id} (tạo bởi admin)`, date: new Date(), orderId: newOrder.id, userId: adminId }, { transaction: t });
        }

        await t.commit();
        return getOrderDetails(newOrder.id);

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Lỗi tại createOrderByAdmin service: ", error);
        throw new AppError(500, "Không thể tạo đơn hàng thủ công");
    }
};

/**
 * Lấy danh sách tất cả đơn hàng với bộ lọc và phân trang.
 * @param {object} queryParams - Các tham số truy vấn (page, limit, status, userId, etc.).
 * @returns {Promise<object>} Đối tượng chứa danh sách đơn hàng và thông tin phân trang.
 */
const getAllOrders = async (queryParams) => {
    try {
        const { page = 1, limit = 10, status, userId, startDate, endDate } = queryParams;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (userId) {
            whereClause.userId = userId;
        }
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'customer',
                attributes: ['id', 'fullName', 'email']
            }],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    } catch (error) {
        console.error("Error in getAllOrders service: ", error);
        throw new AppError(500, "Failed to retrieve orders");
    }
};

/**
 * Lấy chi tiết một đơn hàng, bao gồm thông tin khách hàng và các sản phẩm đã mua.
 * @param {number} orderId - ID của đơn hàng.
 * @returns {Promise<Order>} Đối tượng đơn hàng chi tiết.
 */
const getOrderDetails = async (orderId) => {
    try {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: User,
                    as: 'customer',
                    attributes: ['id', 'fullName', 'email', 'phone']
                },
                {
<<<<<<< HEAD
                    model: OrderDetail,
                    as: 'items',
                    attributes: ['id', 'quantity', 'priceAtPurchase', 'variantAttributes', 'sku'],
                    include: [
                        {
                            model: ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'name', 'sku', 'imageUrl', 'attributes'],
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['id', 'name']
                                }
                            ]
                        }
                    ]
=======
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'sku', 'imageUrl'],
                    // Lấy thông tin từ bảng trung gian (OrderDetail)
                    through: {
                        as: 'details',
                        attributes: ['quantity', 'priceAtPurchase']
                    }
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                }
            ]
        });

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        return order;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in getOrderDetails service: ", error);
        throw new AppError(500, "Failed to retrieve order details");
    }
};

/**
 * Cập nhật trạng thái của một đơn hàng.
 * Tự động hoàn kho nếu đơn hàng bị hủy.
 * Tự động tạo giao dịch doanh thu nếu đơn hàng được giao thành công.
 * @param {number} orderId - ID của đơn hàng.
 * @param {string} newStatus - Trạng thái mới.
 * @param {number} adminId - ID của nhân viên thực hiện thay đổi.
 * @returns {Promise<Order>} Đối tượng đơn hàng sau khi cập nhật.
 */
const updateOrderStatus = async (orderId, newStatus, adminId) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(orderId, {
<<<<<<< HEAD
            include: [{
                model: OrderDetail,
                as: 'items',
                include: [{ model: ProductVariant, as: 'variant' }]
            }],
=======
            include: 'products',
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            transaction: t
        });
        
        if (!order) {
            throw new AppError(404, "Order not found");
        }

        const oldStatus = order.status;
        if (oldStatus === newStatus) {
            return order; // Không có gì để thay đổi
        }

        // --- Logic xử lý nghiệp vụ phụ thuộc vào việc thay đổi trạng thái ---

        // 1. Nếu hủy đơn hàng, hoàn trả lại số lượng tồn kho
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
<<<<<<< HEAD
            for (const item of order.items) {
                await ProductVariant.increment('stockQuantity', {
                    by: item.quantity,
                    where: { id: item.productVariantId },
=======
            for (const product of order.products) {
                const quantityToReturn = product.details.quantity;
                await Product.increment('stockQuantity', {
                    by: quantityToReturn,
                    where: { id: product.id },
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                    transaction: t
                });
            }
        }
        
        // 2. Nếu giao hàng thành công, tạo một giao dịch doanh thu
        if (newStatus === 'delivered' && oldStatus !== 'delivered') {
             // Kiểm tra xem đã có giao dịch cho đơn hàng này chưa để tránh tạo trùng
            const existingTransaction = await Transaction.findOne({ where: { orderId }, transaction: t });
            if (!existingTransaction) {
                await Transaction.create({
                    amount: order.totalAmount,
                    type: 'income',
                    description: `Revenue from order #${order.id}`,
                    date: new Date(),
                    orderId: order.id,
                    userId: adminId, // Ghi nhận nhân viên xác nhận giao hàng
                }, { transaction: t });
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.status = newStatus;
        await order.save({ transaction: t });

        await t.commit();
        return order;

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Error in updateOrderStatus service: ", error);
        throw new AppError(500, "Failed to update order status");
    }
};

/**
 * Cập nhật chi tiết một đơn hàng (sản phẩm, thông tin người nhận, etc.).
 * Chỉ cho phép cập nhật đơn hàng ở một số trạng thái nhất định.
 * Tự động điều chỉnh lại tồn kho và tính toán lại tổng tiền.
 * @param {number} orderId - ID của đơn hàng.
 * @param {object} updateData - Dữ liệu cập nhật. Có thể chứa `items` và các trường khác của Order.
 * @returns {Promise<Order>} Đối tượng đơn hàng sau khi cập nhật.
 */
const updateOrderDetails = async (orderId, updateData) => {
    const t = await sequelize.transaction();
    try {
        // Tách `items` và các trường khác của Order
        const { items, ...otherOrderData } = updateData;

        const order = await Order.findByPk(orderId, {
            include: [{
<<<<<<< HEAD
                model: OrderDetail,
                as: 'items',
                attributes: ['id', 'productVariantId', 'quantity']
=======
                model: Product,
                as: 'products',
                // Lấy thông tin từ bảng trung gian
                through: { as: 'details', attributes: ['quantity'] }
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            }],
            transaction: t,
        });

        if (!order) {
            throw new AppError(404, "Không tìm thấy đơn hàng");
        }

        // Chỉ cho phép chỉnh sửa đơn hàng ở trạng thái 'pending', 'processing' hoặc 'awaiting_payment'
        if (!['pending', 'processing', 'awaiting_payment'].includes(order.status)) {
            throw new AppError(400, `Không thể chỉnh sửa đơn hàng với trạng thái '${order.status}'`);
        }

        // Chỉ xử lý sản phẩm và tồn kho nếu FE gửi lên mảng `items`
        if (items && Array.isArray(items)) {
            // --- 1. Điều chỉnh tồn kho ---
            const oldQuantities = new Map();
<<<<<<< HEAD
            order.items.forEach(i => oldQuantities.set(i.productVariantId, i.quantity));

            const newQuantities = new Map();
            items.forEach(item => newQuantities.set(item.productVariantId, (newQuantities.get(item.productVariantId) || 0) + item.quantity));

            const allVariantIds = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);

            for (const variantId of allVariantIds) {
                const oldQty = oldQuantities.get(variantId) || 0;
                const newQty = newQuantities.get(variantId) || 0;
                const change = oldQty - newQty; // > 0: trả về kho, < 0: lấy từ kho

                if (change !== 0) {
                    const variant = await ProductVariant.findByPk(variantId, { transaction: t, lock: t.LOCK.UPDATE });
                    if (!variant) throw new AppError(404, `Biến thể sản phẩm với ID ${variantId} không tồn tại.`);

                    // Nếu lấy thêm hàng, kiểm tra tồn kho
                    if (change < 0 && variant.stockQuantity < -change) {
                        throw new AppError(400, `Biến thể "${variant.name}" không đủ hàng. Cần: ${-change}, Tồn kho: ${variant.stockQuantity}`);
                    }
                    await variant.increment('stockQuantity', { by: change, transaction: t });
=======
            order.products.forEach(p => oldQuantities.set(p.id, p.details.quantity));

            const newQuantities = new Map();
            items.forEach(item => newQuantities.set(item.productId, (newQuantities.get(item.productId) || 0) + item.quantity));

            const allProductIds = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);

            for (const productId of allProductIds) {
                const oldQty = oldQuantities.get(productId) || 0;
                const newQty = newQuantities.get(productId) || 0;
                const change = oldQty - newQty; // > 0: trả về kho, < 0: lấy từ kho

                if (change !== 0) {
                    const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
                    if (!product) throw new AppError(404, `Sản phẩm với ID ${productId} không tồn tại.`);

                    // Nếu lấy thêm hàng, kiểm tra tồn kho
                    if (change < 0 && product.stockQuantity < -change) {
                        throw new AppError(400, `Sản phẩm "${product.name}" không đủ hàng. Cần: ${-change}, Tồn kho: ${product.stockQuantity}`);
                    }
                    await product.increment('stockQuantity', { by: change, transaction: t });
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                }
            }

            // --- 2. Cập nhật OrderDetail và tính lại Subtotal ---
            await OrderDetail.destroy({ where: { orderId }, transaction: t });

            let newSubtotal = 0;
            for (const item of items) {
<<<<<<< HEAD
                const variant = await ProductVariant.findByPk(item.productVariantId, { transaction: t });
                if (!variant) throw new AppError(404, `Biến thể sản phẩm với ID ${item.productVariantId} không tồn tại.`);
                const priceAtPurchase = item.priceAtPurchase !== undefined ? item.priceAtPurchase : variant.price;

                await OrderDetail.create({
                    orderId: order.id,
                    productVariantId: item.productVariantId,
=======
                const product = await Product.findByPk(item.productId, { transaction: t });
                const priceAtPurchase = item.priceAtPurchase !== undefined ? item.priceAtPurchase : product.price;

                await OrderDetail.create({
                    orderId: order.id,
                    productId: item.productId,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                    quantity: item.quantity,
                    priceAtPurchase: priceAtPurchase,
                }, { transaction: t });

                newSubtotal += priceAtPurchase * item.quantity;
            }
            console.log("newSubtotal: ", newSubtotal);
            
            order.subtotal = newSubtotal;
        }

        // --- 3. Cập nhật các trường khác và tính lại tổng tiền ---
        Object.assign(order, otherOrderData);

        let newDiscountAmount = 0;
        if (order.voucherCode) {
            const voucher = await Voucher.findOne({ where: { code: order.voucherCode }, transaction: t });
            if (voucher) {
                if (voucher.discountType === 'percentage') {
                    newDiscountAmount = order.subtotal * (voucher.discountValue / 100);
                } else { // fixed_amount
                    newDiscountAmount = voucher.discountValue;
                }
            }
        }
        order.discountAmount = newDiscountAmount;

        order.totalAmount = order.subtotal * 1 + (order.shippingFee *1) - order.discountAmount;
        
        await order.save({ transaction: t });

        await t.commit();
        return getOrderDetails(orderId);
    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("Lỗi tại updateOrderDetails service: ", error);
        throw new AppError(500, "Không thể cập nhật chi tiết đơn hàng");
    }
};

module.exports = {
    createOrderByAdmin,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrderDetails,
};