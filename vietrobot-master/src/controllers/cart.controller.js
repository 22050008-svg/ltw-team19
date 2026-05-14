// controllers/cart.controller.js
const cartService = require("../services/cart.service");
const { response } = require("../helpers/response");

const viewCart = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const cart = await cartService.getCartByUserId(userId);
        res.status(200).json(response(cart));
    } catch (error) {
        next(error);
    }
};

/**
 * ★ THAY ĐỔI: productId -> productVariantId
 */
const addOrUpdateItem = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { productVariantId, quantity } = req.body;
        
        if (!productVariantId || !quantity) {
            return res.status(400).json(response({ 
                error: "productVariantId và quantity là bắt buộc" 
            }));
        }

        const updatedCart = await cartService.addOrUpdateItem(userId, productVariantId, quantity);
        res.status(200).json(response(updatedCart));
    } catch (error) {
        next(error);
    }
};

/**
 * ★ THAY ĐỔI: productId -> variantId (trong params)
 */
const removeItem = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { variantId } = req.params;
        const updatedCart = await cartService.removeItem(userId, variantId);
        res.status(200).json(response(updatedCart));
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        await cartService.clearCart(userId);
        res.status(204).send(); // No content
    } catch (error) {
        next(error);
    }
};

module.exports = {
    viewCart,
    addOrUpdateItem,
    removeItem,
    clearCart,
};