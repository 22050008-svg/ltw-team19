// /routers/v1/admin/vouchers.router.js
const express = require("express");
const voucherController = require("../../../controllers/admin/vouchers.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/vouchers
const voucherRouter = express.Router();

voucherRouter.get("/", voucherController.getVouchers);
voucherRouter.post("/", checkPermission("promotion.create"), voucherController.createVoucher);
voucherRouter.put("/:id", checkPermission("promotion.update"), voucherController.updateVoucher);
voucherRouter.delete("/:id", checkPermission("promotion.delete"), voucherController.deleteVoucher);

module.exports = voucherRouter;