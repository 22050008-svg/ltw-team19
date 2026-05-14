// /routers/v1/admin/finances.router.js
const express = require("express");
const financeController = require("../../../controllers/admin/finances.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/finances
const financeRouter = express.Router();

financeRouter.get("/transactions", checkPermission("invoice.read"), financeController.getTransactions);
financeRouter.post("/transactions", checkPermission("invoice.manage"), financeController.addManualTransaction);

module.exports = financeRouter;