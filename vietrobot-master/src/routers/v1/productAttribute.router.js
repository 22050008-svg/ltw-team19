// routers/v1/productAttribute.router.js
const express = require("express");
const router = express.Router();
const productAttributeController = require("../../controllers/productAttribute.controller");
const authorization = require("../../middlewares/authorization");

/**
 * GET /api/v1/admin/attributes
 * Lấy tất cả thuộc tính (tùy chọn lọc theo category)
 * PUBLIC: Admin can view
 */
router.get("/admin/attributes", productAttributeController.getAttributes);

/**
 * GET /api/v1/admin/attributes/:id
 * Lấy chi tiết một thuộc tính + giá trị
 * PUBLIC: Admin can view
 */
router.get("/admin/attributes/:id", productAttributeController.getAttributeById);

/**
 * POST /api/v1/admin/attributes
 * Tạo thuộc tính mới
 * ADMIN ONLY
 */
router.post("/admin/attributes", authorization, productAttributeController.createAttribute);

/**
 * PUT /api/v1/admin/attributes/:id
 * Cập nhật thuộc tính
 * ADMIN ONLY
 */
router.put("/admin/attributes/:id", authorization, productAttributeController.updateAttribute);

/**
 * DELETE /api/v1/admin/attributes/:id
 * Xóa thuộc tính
 * ADMIN ONLY
 */
router.delete("/admin/attributes/:id", authorization, productAttributeController.deleteAttribute);

/**
 * POST /api/v1/admin/attributes/:id/values
 * Tạo giá trị thuộc tính mới
 * ADMIN ONLY
 */
router.post("/admin/attributes/:id/values", authorization, productAttributeController.createAttributeValue);

/**
 * GET /api/v1/admin/attributes/:id/values
 * Lấy tất cả giá trị của một thuộc tính
 * PUBLIC: Admin can view
 */
router.get("/admin/attributes/:id/values", productAttributeController.getAttributeValues);

/**
 * PUT /api/v1/admin/attributes/:id/values/:valueId
 * Cập nhật một giá trị thuộc tính
 * ADMIN ONLY
 */
router.put("/admin/attributes/:id/values/:valueId", authorization, productAttributeController.updateAttributeValue);

/**
 * DELETE /api/v1/admin/attributes/:id/values/:valueId
 * Xóa một giá trị thuộc tính
 * ADMIN ONLY
 */
router.delete("/admin/attributes/:id/values/:valueId", authorization, productAttributeController.deleteAttributeValue);

module.exports = router;
