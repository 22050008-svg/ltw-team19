// controllers/product.controller.js
const productService = require("../services/product.service");
const { response } = require("../helpers/response");

const getPublicProducts = async (req, res, next) => {
    try {
        const queryParams = req.query; // { page, limit, search, categoryId, sortBy }
        const result = await productService.getPublicProducts(queryParams);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const getPublicProductDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.getPublicProductById(id);
        res.status(200).json(response(product));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPublicProducts,
    getPublicProductDetails,
};