// /routers/v1/index.js
const express = require("express");

// Router
const productRouter = require("./products.router");
const categoryRouter = require("./categories.router");
const cartRouter = require("./cart.router");
const orderRouter = require("./orders.router");
const profileRouter = require("./profile.router");
const adminRouter = require("./admin"); // Import router admin chính
const authRouter = require("./auth.router");
const paymentRouter = require("./payment.router");

// ★ NEW ROUTERS
const productAttributeRouter = require("./productAttribute.router");
const productVariantRouter = require("./productVariant.router");
const productReviewRouter = require("./productReview.router");
const reviewReplyRouter = require("./reviewReply.router");
const postersRouter = require("./posters.router"); // ★ PUBLIC POSTERS ROUTER

// Base URL: /api/v1
const v1 = express.Router();

// --- API CHO KHÁCH HÀNG & CÔNG KHAI ---
v1.use("/auth", authRouter);
v1.use("/products", productRouter);
v1.use("/categories", categoryRouter);
v1.use("/cart", cartRouter);
v1.use("/orders", orderRouter);
v1.use("/profile", profileRouter);

// ★ ADD NEW ROUTERS
v1.use("/", productVariantRouter);  // Endpoints: /variants, /products/:id/variants
v1.use("/", productAttributeRouter); // Endpoints: /attributes
v1.use("/reviews", productReviewRouter); // Endpoints: /reviews, /reviews/:id
v1.use("/", reviewReplyRouter); // Endpoints: /reviews/:reviewId/replies
v1.use("/posters", postersRouter); // ★ PUBLIC POSTERS - Endpoints: /posters/location/:location, /posters/category/:categoryId

// --- API QUẢN TRỊ ---
// Gắn tất cả các router trong thư mục admin vào path /admin
v1.use("/admin", adminRouter);

v1.use("/payments", paymentRouter);

module.exports = v1;