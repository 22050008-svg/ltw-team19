const productReviewService = require("../services/product-review.service");
const { response } = require("../helpers/response");
const { AppError } = require("../helpers/error");

/**
 * [PUBLIC] Lấy danh sách đánh giá của sản phẩm
 * GET /products/:productId/reviews
 */
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page, limit, sortBy, rating } = req.query;

        const result = await productReviewService.getReviewsByProduct(productId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy: sortBy || 'recent',
            status: 'approved', // Chỉ hiển thị reviews đã duyệt
            rating: rating || 'all' // Filter by star rating if provided
        });

        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

/**
 * [PUBLIC] Lấy thống kê đánh giá sản phẩm
 * GET /products/:productId/review-stats
 */
const getReviewStats = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const stats = await productReviewService.getReviewStats(productId);
        res.status(200).json(response(stats));
    } catch (error) {
        next(error);
    }
};

/**
 * [AUTHENTICATED] Lấy đánh giá của user hiện tại cho sản phẩm
 * GET /reviews/product/:productId/my-review
 */
const getUserReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const review = await productReviewService.getUserReviewForProduct(productId, userId);
        
        if (!review) {
            return res.status(404).json(response({ error: "Bạn chưa đánh giá sản phẩm này" }, false));
        }

        res.status(200).json(response(review));
    } catch (error) {
        next(error);
    }
};

/**
 * [AUTHENTICATED] Tạo đánh giá mới
 * POST /reviews
 * Body: { productId, rating, title, comment }
 */
const createReview = async (req, res, next) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const userId = req.user.id;

        console.log('[createReview] Controller received:', {
            productId,
            userId,
            rating,
            titleLength: title?.length || 0,
            commentLength: comment?.length || 0
        });

        // Validate input
        if (!productId) {
            console.warn('[createReview] Missing productId');
            return res.status(400).json(response({ error: "productId là bắt buộc" }, false));
        }

        const review = await productReviewService.createReview(productId, userId, {
            rating,
            title,
            comment
        });

        console.log('[createReview] Review created successfully:', { reviewId: review.id });
        res.status(201).json(response(review));
    } catch (error) {
        console.error('[createReview] Error:', error.message);
        next(error);
    }
};

/**
 * [AUTHENTICATED] Cập nhật đánh giá của người dùng
 * PUT /reviews/:reviewId
 * Body: { rating, title, comment }
 */
const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const { rating, title, comment } = req.body;

        const review = await productReviewService.updateReview(reviewId, userId, {
            rating,
            title,
            comment
        });

        res.status(200).json(response(review));
    } catch (error) {
        next(error);
    }
};

/**
 * [ADMIN/STAFF] Xóa đánh giá
 * DELETE /reviews/:reviewId
 */
const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        console.log('[deleteReview] Controller called:', { reviewId, userId });

        // Verify review exists
        const review = await productReviewService.getReviewById(reviewId);
        if (!review) {
            console.error('[deleteReview] Review not found:', reviewId);
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        // Check if user is owner OR has review.delete permission
        const isOwner = review.userId === userId;
        const hasDeletePermission = req.user.roles && req.user.roles.some(role => 
            role.permissions && role.permissions.some(p => p.name === 'review.delete')
        );

        console.log('[deleteReview] Permission check:', { isOwner, hasDeletePermission, reviewUserId: review.userId, userId });

        if (!isOwner && !hasDeletePermission) {
            console.error('[deleteReview] Unauthorized attempt:', { reviewUserId: review.userId, userId, hasDeletePermission });
            throw new AppError(403, "Bạn không có quyền xóa đánh giá này");
        }

        await productReviewService.deleteReview(reviewId);
        console.log('[deleteReview] Review deleted successfully:', reviewId);

        res.status(200).json(response({ success: true, message: "Xóa đánh giá thành công" }));
    } catch (error) {
        next(error);
    }
};

/**
 * [AUTHENTICATED] Đánh dấu review là hữu ích
 * POST /reviews/:reviewId/helpful
 */
const markHelpful = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await productReviewService.markHelpful(reviewId);
        res.status(200).json(response(review));
    } catch (error) {
        next(error);
    }
};

/**
 * [ADMIN] Lấy danh sách tất cả đánh giá (có lọc theo trạng thái)
 * GET /admin/reviews
 */
const getAllReviews = async (req, res, next) => {
    try {
        const { page, limit, status, productId } = req.query;

        // Note: Cần update service để hỗ trợ admin query
        const result = await productReviewService.getReviewsByProduct(productId || null, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            status: status || 'all'
        });

        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

/**
 * [ADMIN] Duyệt/từ chối đánh giá
 * PATCH /admin/reviews/:reviewId/approve
 * Body: { status: 'approved' | 'rejected' | 'pending' }
 */
const approveReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { status } = req.body;

        const review = await productReviewService.approveReview(reviewId, status);
        res.status(200).json(response(review));
    } catch (error) {
        next(error);
    }
};

/**
 * [PUBLIC] Lấy danh sách ảnh của sản phẩm (để chọn làm ảnh review)
 * GET /products/:productId/images-for-review
 */
const getProductImagesForReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const images = await productReviewService.getProductImages(productId);
        res.status(200).json(response(images));
    } catch (error) {
        next(error);
    }
};

/**
 * [AUTHENTICATED] Thêm ảnh vào đánh giá từ sản phẩm hoặc upload
 * POST /reviews/:reviewId/images-from-product
 * Body: { productImageIds: [1, 2], newImageUrls: ["url1", "url2"] }
 */
const addReviewImagesFromProduct = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { productImageIds, newImageUrls } = req.body;
        const userId = req.user.id;

        console.log('[addReviewImagesFromProduct] Controller received:', {
            reviewId,
            productImageIds: productImageIds?.length || 0,
            newImageUrlsCount: newImageUrls?.length || 0,
            hasBase64: newImageUrls?.some(url => url?.startsWith('data:image'))
        });

        // Verify review exists and belongs to user
        const review = await productReviewService.getReviewById(reviewId);
        if (!review) {
            console.error('[addReviewImagesFromProduct] Review not found:', reviewId);
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        if (review.userId !== userId) {
            console.error('[addReviewImagesFromProduct] Unauthorized:', { reviewUserId: review.userId, userId });
            throw new AppError(403, "Bạn không có quyền thêm ảnh vào đánh giá này");
        }

        // Validate input
        const validProductImageIds = productImageIds && Array.isArray(productImageIds) ? productImageIds : [];
        const validNewImageUrls = newImageUrls && Array.isArray(newImageUrls) ? newImageUrls : [];

        if (validProductImageIds.length === 0 && validNewImageUrls.length === 0) {
            console.log('[addReviewImagesFromProduct] No images provided, returning empty array');
            return res.status(200).json(response([]));
        }

        const images = await productReviewService.createReviewImagesFromProduct(reviewId, {
            productImageIds: validProductImageIds,
            newImageUrls: validNewImageUrls
        });

        console.log('[addReviewImagesFromProduct] Images created successfully:', {
            count: images.length,
            images: images.map(img => ({ id: img.id, url: img.imageUrl?.substring(0, 50) }))
        });
        res.status(201).json(response(images));
    } catch (error) {
        console.error('[addReviewImagesFromProduct] ERROR - Full details:', {
            message: error.message,
            code: error.code,
            status: error.statusCode,
            stack: error.stack?.split('\n').slice(0, 5).join('\n')
        });
        next(error);
    }
};

const deleteReviewImages = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        console.log('[deleteReviewImages] Controller called:', { reviewId, userId });

        // Verify review exists and belongs to user
        const review = await productReviewService.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ 
                error: "Đánh giá không tồn tại" 
            });
        }

        if (review.userId !== userId) {
            return res.status(403).json({ 
                error: "Bạn không có quyền xóa ảnh của đánh giá này" 
            });
        }

        // Delete all images for this review
        const deletedCount = await productReviewService.deleteReviewImages(reviewId);

        console.log('[deleteReviewImages] Images deleted successfully:', deletedCount);
        res.status(200).json(response({ deletedCount }));
    } catch (error) {
        console.error('[deleteReviewImages] Error:', error);
        next(error);
    }
};

module.exports = {
    getProductReviews,
    getReviewStats,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getAllReviews,
    approveReview,
    getProductImagesForReview,
    addReviewImagesFromProduct,
    deleteReviewImages
};
