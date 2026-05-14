// /routers/v1/admin/index.js
const express = require("express");
const authorization = require("../../../middlewares/authorization");

// Admin Routers
const userRouter = require("./users.router");
const roleRouter = require("./roles.router");
const productRouter = require("./products.router");
const inventoryRouter = require("./inventory.router");
const orderRouter = require("./orders.router");
const voucherRouter = require("./vouchers.router");
const financeRouter = require("./finances.router");
const mailRouter = require("./mail.router");
const postersRouter = require("./posters.router");
<<<<<<< HEAD
const dashboardRouter = require("./dashboard.router");
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9

// Path: /api/v1/admin
const adminRouter = express.Router();

// Áp dụng middleware xác thực cho tất cả các route admin
adminRouter.use(authorization);

// Gắn các router con
adminRouter.use("/users", userRouter);
adminRouter.use(roleRouter); // Gồm /roles và /permissions
adminRouter.use("/products", productRouter);
adminRouter.use("/inventory", inventoryRouter);
adminRouter.use("/orders", orderRouter);
adminRouter.use("/vouchers", voucherRouter);
adminRouter.use("/finances", financeRouter);
adminRouter.use("/mail", mailRouter);
adminRouter.use("/posters", postersRouter);
<<<<<<< HEAD
adminRouter.use("/dashboard", dashboardRouter);
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9

module.exports = adminRouter;