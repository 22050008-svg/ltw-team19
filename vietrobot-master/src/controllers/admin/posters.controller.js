// controllers/admin/posters.controller.js
const posterService = require("../../services/poster.service");
const { successResponse, errorResponse } = require("../../helpers/response");

/**
 * GET /admin/posters/category/:categoryId
 * Lấy danh sách poster của danh mục
 */
const getPostersByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const result = await posterService.getPostersByCategory(categoryId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, 200, "Lấy danh sách poster thành công", result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * GET /admin/posters/location/:location
 * Lấy danh sách poster theo vị trí (homepage hoặc category)
 */
const getPostersByLocation = async (req, res) => {
    try {
        const { location } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        if (!['homepage', 'category'].includes(location)) {
            return errorResponse(res, { statusCode: 400, message: "Location không hợp lệ (homepage hoặc category)" });
        }

        const result = await posterService.getPostersByLocation(location, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, 200, `Lấy danh sách poster ${location} thành công`, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * GET /admin/posters/:posterId
 * Lấy chi tiết một poster
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

/**
 * POST /admin/posters
 * Tạo mới poster
 */
const createPoster = async (req, res) => {
    try {
        const { categoryId, title, description, displayOrder, imageUrl, location = 'category', redirectUrl } = req.body;
        const userId = req.user?.id;

        if (!imageUrl) {
            return errorResponse(res, { statusCode: 400, message: "imageUrl bắt buộc" });
        }

        // Kiểm tra location hợp lệ
        if (!['homepage', 'category'].includes(location)) {
            return errorResponse(res, { statusCode: 400, message: "location phải là 'homepage' hoặc 'category'" });
        }

        // Nếu location là category, categoryId bắt buộc
        if (location === 'category' && !categoryId) {
            return errorResponse(res, { statusCode: 400, message: "categoryId bắt buộc khi location là 'category'" });
        }

        const poster = await posterService.createPoster({
            categoryId: location === 'homepage' ? null : categoryId,
            imageUrl,
            title,
            description,
            displayOrder,
            location,
            redirectUrl: redirectUrl || null
        }, userId);

        return successResponse(res, 201, "Tạo poster thành công", poster);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * POST /admin/posters/upload
 * Upload hình ảnh poster
 */
const uploadPosterImage = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, { statusCode: 400, message: "Vui lòng chọn tệp hình ảnh" });
        }

        const imageUrl = await posterService.handlePosterImageUpload(req.file);

        return successResponse(res, 200, "Tải lên hình ảnh thành công", { imageUrl });
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * PUT /admin/posters/:posterId
 * Cập nhật poster
 */
const updatePoster = async (req, res) => {
    try {
        const { posterId } = req.params;
        const { title, description, displayOrder, isActive, imageUrl, location, categoryId, redirectUrl } = req.body;
        const userId = req.user?.id;

        const poster = await posterService.updatePoster(posterId, {
            title,
            description,
            displayOrder,
            isActive,
            imageUrl,
            location,
            categoryId: location === 'homepage' ? null : categoryId,
            redirectUrl: redirectUrl || null
        }, userId);

        return successResponse(res, 200, "Cập nhật poster thành công", poster);
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * DELETE /admin/posters/:posterId
 * Xóa poster
 */
const deletePoster = async (req, res) => {
    try {
        const { posterId } = req.params;
        console.log(`[POSTER DELETE] 🗑️  Starting delete - Poster ID: ${posterId}, User: ${req.user?.id || 'unknown'}`);
        
        const result = await posterService.deletePoster(posterId);
        console.log(`[POSTER DELETE] ✅ Success - Poster ${posterId} deleted`);

        return successResponse(res, 200, result.message);
    } catch (error) {
        console.error(`[POSTER DELETE] ❌ Error:`, {
            posterId: req.params?.posterId,
            userId: req.user?.id,
            error: error.message,
            statusCode: error.statusCode
        });
        return errorResponse(res, error);
    }
};

/**
 * PUT /admin/posters/category/:categoryId/reorder
 * Sắp xếp lại thứ tự poster
 */
const reorderPosters = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { posterOrder } = req.body;

        if (!Array.isArray(posterOrder)) {
            return errorResponse(res, { statusCode: 400, message: "posterOrder phải là một mảng" });
        }

        const result = await posterService.reorderPosters(categoryId, posterOrder);

        return successResponse(res, 200, result.message);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getPostersByCategory,
    getPostersByLocation,
    getPosterById,
    createPoster,
    uploadPosterImage,
    updatePoster,
    deletePoster,
    reorderPosters
};
