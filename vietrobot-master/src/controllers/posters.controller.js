// src/controllers/posters.controller.js
/**
 * PUBLIC POSTER CONTROLLER
 * Handles public poster endpoints
 * Used for displaying posters on frontend (homepage, category pages)
 * No authentication required for these endpoints
 */

const posterService = require("../services/poster.service");
const { successResponse, errorResponse } = require("../helpers/response");

/**
 * GET /api/v1/posters/category/:categoryId
 * Lấy danh sách poster của một danh mục
 * Public endpoint
 */
const getPostersByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 100, offset = 0, isActive = true } = req.query;

        const result = await posterService.getPostersByCategory(categoryId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            isActive: isActive !== 'false'  // Convert string to boolean
        });

        return successResponse(res, 200, "Lấy danh sách poster thành công", result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * GET /api/v1/posters/location/:location
 * Lấy danh sách poster theo vị trí (homepage hoặc category)
 * Public endpoint
 */
const getPostersByLocation = async (req, res) => {
    try {
        const { location } = req.params;
        const { limit = 100, offset = 0, isActive = true } = req.query;

        if (!['homepage', 'category'].includes(location)) {
            return errorResponse(res, { 
                statusCode: 400, 
                message: "Location không hợp lệ (homepage hoặc category)" 
            });
        }

        const result = await posterService.getPostersByLocation(location, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            isActive: isActive !== 'false'  // Convert string to boolean
        });

        return successResponse(res, 200, `Lấy danh sách poster ${location} thành công`, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * GET /api/v1/posters/:posterId
 * Lấy chi tiết một poster
 * Public endpoint
 */
const getPosterById = async (req, res) => {
    try {
        const { posterId } = req.params;
        const poster = await posterService.getPosterById(posterId);

        return successResponse(res, 200, "Lấy chi tiết poster thành công", poster);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getPostersByCategory,
    getPostersByLocation,
    getPosterById
};
