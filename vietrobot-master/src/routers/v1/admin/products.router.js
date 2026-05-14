// /routers/v1/admin/products.router.js
const express = require("express");
const adminProductController = require("../../../controllers/admin/products.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");
const { uploadProductImage } = require("../../../middlewares/multerConfig");

// Path: /api/v1/admin/products
const productRouter = express.Router();

// Get list
productRouter.get("/", checkPermission("product.read"), adminProductController.getAllProducts);

// ⭐ IMPORTANT: More specific routes MUST come BEFORE less specific routes!
// Otherwise Express will match /:id before /:id/images/:imageId

// Route để xóa ảnh sản phẩm (2 params - DELETE first!)
productRouter.delete(
    "/:id/images/:imageId",
    checkPermission("product.update"),
    adminProductController.deleteProductImage
);

// Route để cập nhật ảnh sản phẩm (2 params)
// Nó sẽ nhận một file từ form-data với field name là 'productImage'
productRouter.post(
    "/:id/image",
    checkPermission("product.update"),
    uploadProductImage.single("productImage"),
    adminProductController.updateProductImage
);

// Single resource routes (1 param - LAST)
productRouter.post("/", checkPermission("product.create"), adminProductController.createProduct);
productRouter.put("/:id", checkPermission("product.update"), adminProductController.updateProduct);
productRouter.delete("/:id", checkPermission("product.delete"), adminProductController.deleteProduct);

module.exports = productRouter;