// controllers/order.controller.js
const orderService = require("../services/order.service");
const paymentService = require("../services/payment.service");
const { response } = require("../helpers/response");

/**
 * ★ CƠCTL Giữ nguyên, logic thay đổi ở service
 */
const placeOrder = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const orderData = req.body;
        const newOrder = await orderService.createOrder(userId, orderData);
        res.status(201).json(response(newOrder));
    } catch (error) {
        next(error);
    }
};

const checkout = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const orderData = req.body;
<<<<<<< HEAD
        console.log('🎯 [OrderController] Received checkout request');
        console.log('🎯 [OrderController] req.body:', JSON.stringify(req.body, null, 2));
        console.log('🎯 [OrderController] req.body.paymentMethod:', req.body.paymentMethod);
        console.log('🎯 [OrderController] Passing to paymentService:', JSON.stringify(orderData, null, 2));
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        const result = await paymentService.initiateOnlinePayment(userId, orderData);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const checkPaymentStatus = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: orderId } = req.params;
        const status = await orderService.getPaymentStatus(userId, orderId);
        res.status(200).json(response(status));
    } catch (error) {
        next(error);
    }
};

const getOrderHistory = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const orders = await orderService.getOrdersByUserId(userId);
        res.status(200).json(response(orders));
    } catch (error) {
        next(error);
    }
};

const getOrderDetails = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: orderId } = req.params;
        const order = await orderService.getOrderDetails(userId, orderId);
        res.status(200).json(response(order));
    } catch (error) {
        next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: orderId } = req.params;
        const updatedOrder = await orderService.cancelOrder(userId, orderId);
        res.status(200).json(response(updatedOrder));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    placeOrder,
    checkout,
    getOrderHistory,
    getOrderDetails,
    cancelOrder,
    checkPaymentStatus,
};