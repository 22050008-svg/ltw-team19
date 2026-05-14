// controllers/admin/orders.controller.js
const adminOrderService = require("../../services/orders.service");
const { response } = require("../../helpers/response");

const createOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        const { id: adminId } = req.user; // Lấy ID của admin đang thực hiện

        const newOrder = await adminOrderService.createOrderByAdmin(orderData, adminId);
        res.status(201).json(response(newOrder));
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const filters = req.query; // { status, userId, startDate, etc. }
        const orders = await adminOrderService.getAllOrders(filters);
        res.status(200).json(response(orders));
    } catch (error) {
        next(error);
    }
};

const getOrderDetails = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const orderDetails = await adminOrderService.getOrderDetails(orderId);
        res.status(200).json(response(orderDetails));
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const { status } = req.body;
        const { id: adminId } = req.user; // Ghi nhận nhân viên nào đã cập nhật

        const updatedOrder = await adminOrderService.updateOrderStatus(orderId, status, adminId);
        res.status(200).json(response(updatedOrder));
    } catch (error) {
        next(error);
    }
};

const updateOrderDetails = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const updateData = req.body; // { items: [...], recipientName, shippingAddress, ... }

        const updatedOrder = await adminOrderService.updateOrderDetails(orderId, updateData);
        res.status(200).json(response(updatedOrder));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrderDetails,
};
