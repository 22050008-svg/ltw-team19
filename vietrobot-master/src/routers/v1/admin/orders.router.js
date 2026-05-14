// /routers/v1/admin/orders.router.js
const express = require("express");
const adminOrderController = require("../../../controllers/admin/orders.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/orders
const orderRouter = express.Router();

orderRouter.post("/", checkPermission("order.create"), adminOrderController.createOrder);
orderRouter.get("/", checkPermission("order.read"), adminOrderController.getAllOrders);
orderRouter.get("/:id", checkPermission("order.read"), adminOrderController.getOrderDetails);
orderRouter.put("/:id/status", checkPermission("order.update"), adminOrderController.updateOrderStatus);
orderRouter.put("/:id", checkPermission("order.update"), adminOrderController.updateOrderDetails);

module.exports = orderRouter;