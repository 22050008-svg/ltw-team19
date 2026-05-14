// /routers/v1/orders.router.js
const express = require("express");
const orderController = require("../../controllers/order.controller");
const authorization = require("../../middlewares/authorization");

// Path: /api/v1/orders
const orderRouter = express.Router();

orderRouter.use(authorization);

orderRouter.post("/", orderController.placeOrder);
orderRouter.get("/", orderController.getOrderHistory);
orderRouter.get("/:id", orderController.getOrderDetails);
orderRouter.put("/:id/cancel", orderController.cancelOrder);
orderRouter.post("/checkout", orderController.checkout);
orderRouter.get("/:id/payment-status", orderController.checkPaymentStatus);

module.exports = orderRouter;