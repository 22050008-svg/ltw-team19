// /routers/v1/products.router.js
const express = require("express");
const productController = require("../../controllers/product.controller");

// Path: /api/v1/products
const productRouter = express.Router();

productRouter.get("/", productController.getPublicProducts);
productRouter.get("/:id", productController.getPublicProductDetails);

module.exports = productRouter;