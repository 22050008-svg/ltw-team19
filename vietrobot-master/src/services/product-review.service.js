const { ProductReview, Product, User, ProductImage, ReviewImage, ReviewReply, sequelize } = require("../models");
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize");
const { saveBase64Image, deleteImage, isBase64Image } = require("../helpers/imageHandler");

/**
 * Tạo đánh giá sản phẩm mới
 * @param {number} productId - ID sản phẩm
 * @param {number} userId - ID người dùng
 * @param {object} reviewData - Dữ liệu đánh giá { rating, title, comment }
 * @returns {Promise<object>} - Đánh giá vừa tạo
 */
const createReview = async (productId, userId, reviewData) => {
    try {
        const { rating, title, comment } = reviewData;

        console.log('[createReview Service] Input:', { productId, userId, rating, titleLength: title?.length || 0, commentLength: comment?.length || 0 });

        // Validate product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            console.warn('[createReview Service] Product not found:', productId);
            throw new AppError(404, "Sản phẩm không tồn tại");
        }

        // Validate user exists
        const user = await User.findByPk(userId);
        if (!user) {
            console.warn('[createReview Service] User not found:', userId);
            throw new AppError(404, "Người dùng không tồn tại");
        }

        // Check if user already reviewed this product
        const existingReview = await ProductReview.findOne({
            where: { productId, userId }
        });
        if (existingReview) {
            console.warn('[createReview Service] User already reviewed:', { productId, userId });
            throw new AppError(400, "Bạn đã đánh giá sản phẩm này rồi");
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            console.warn('[createReview Service] Invalid rating:', rating);
            throw new AppError(400, "Đánh giá phải từ 1 đến 5 sao");
        }

        console.log('[createReview Service] Creating review...');
        // Create review
        const review = await ProductReview.create({
            productId,
            userId,
            rating,
            title: title || null,
            comment: comment || null,
            status: 'approved' // Auto-approve reviews for better UX
        });

        console.log('[createReview Service] Review created:', { reviewId: review.id });
        
        // Fetch with relationships
        const fullReview = await getReviewById(review.id);
        console.log('[createReview Service] Review with relationships loaded:', { reviewId: fullReview.id });
        return fullReview;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("[createReview Service] ERROR - Full Details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            sql: error.sql || 'N/A',
            code: error.code || 'N/A'
        });
        throw new AppError(500, `Lỗi tạo đánh giá: ${error.message}`);
    }
};

/**
 * Lấy danh sách đánh giá theo sản phẩm
 * @param {number} productId - ID sản phẩm
 * @param {object} params - Query params { page, limit, sortBy, status, rating }
 * @returns {Promise<object>} - Danh sách reviews + phân trang
 */
const getReviewsByProduct = async (productId, params = {}) => {
    try {
        const { page = 1, limit = 10, sortBy = 'recent', status = 'approved', rating } = params;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = { productId };
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        // Filter by rating if provided
        if (rating && rating !== 'all') {
            whereClause.rating = parseInt(rating);
        }

        // Build order clause
        let orderClause = [['createdAt', 'DESC']];
        if (sortBy === 'highest-rating') {
            orderClause = [['rating', 'DESC']];
        } else if (sortBy === 'lowest-rating') {
            orderClause = [['rating', 'ASC']];
        } else if (sortBy === 'most-helpful') {
            orderClause = [['helpful_count', 'DESC']];
        }

        const { count, rows } = await ProductReview.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'fullName', 'email'] },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description'],
                    include: [
                        {
                            model: ProductImage,
                            as: 'productImages',
                            attributes: ['id', 'imageUrl', 'isPrimary'],
                            where: { productVariantId: null },
                            required: false,
                            separate: true,
                            limit: 1,
                            order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'displayOrder'],
                    required: false,
                    separate: true,
                    order: [['displayOrder', 'ASC']]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            distinct: true
        });

        return {
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit)
            }
        };
    } catch (error) {
        console.error("getReviewsByProduct service error:", error);
        throw new AppError(500, "Không thể lấy danh sách đánh giá");
    }
};

/**
 * Lấy chi tiết một đánh giá
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise<object>} - Chi tiết đánh giá
 */
const getReviewById = async (reviewId) => {
    try {
        const review = await ProductReview.findByPk(reviewId, {
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'fullName', 'email'] },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description'],
                    include: [
                        {
                            model: ProductImage,
                            as: 'productImages',
                            attributes: ['id', 'imageUrl', 'isPrimary'],
                            where: { productVariantId: null },
                            required: false,
                            separate: true,
                            limit: 3,
                            order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'displayOrder'],
                    required: false,
                    separate: true,
                    order: [['displayOrder', 'ASC']]
                }
            ]
        });

        if (!review) {
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        return review;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getReviewById service error:", error);
        throw new AppError(500, "Không thể lấy thông tin đánh giá");
    }
};

/**
 * Cập nhật đánh giá
 * @param {number} reviewId - ID đánh giá
 * @param {number} userId - ID người dùng (phải là chủ review)
 * @param {object} updateData - Dữ liệu cập nhật { rating, title, comment }
 * @returns {Promise<object>} - Đánh giá sau cập nhật
 */
const updateReview = async (reviewId, userId, updateData) => {
    try {
        const review = await ProductReview.findByPk(reviewId);
        if (!review) {
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        // Verify user owns the review
        if (review.userId !== userId) {
            throw new AppError(403, "Bạn không có quyền chỉnh sửa đánh giá này");
        }

        // ★ NEW: Check if user has already edited once (max 1 edit allowed)
        if (review.edit_count >= 1) {
            throw new AppError(400, "Bạn đã chỉnh sửa đánh giá này rồi. Chỉ được phép chỉnh sửa 1 lần.");
        }

        // Update fields
        const { rating, title, comment } = updateData;
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                throw new AppError(400, "Đánh giá phải từ 1 đến 5 sao");
            }
            review.rating = rating;
        }
        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;
        
        // ★ UPDATED: Auto-approve after edit (no pending status)
        review.status = 'approved';
        review.edit_count += 1; // ★ NEW: Increment edit count

        await review.save();
        return await getReviewById(reviewId);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("updateReview service error:", error);
        throw new AppError(500, "Không thể cập nhật đánh giá");
    }
};

/**
 * Xóa đánh giá (Admin hoặc Staff only)
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
const deleteReview = async (reviewId) => {
    try {
        console.log('[deleteReview Service] Deleting review:', reviewId);
        
        const review = await ProductReview.findByPk(reviewId);
        if (!review) {
            console.warn('[deleteReview Service] Review not found:', reviewId);
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        // ★ Delete associated replies first (FK constraint requires this)
        console.log('[deleteReview Service] Deleting review replies...');
        try {
            const deletedReplies = await ReviewReply.destroy({
                where: { reviewId }
            });
            console.log(`[deleteReview Service] Deleted ${deletedReplies} replies`);
        } catch (replyError) {
            console.warn('[deleteReview Service] Warning deleting review replies:', replyError.message);
        }

        // Delete associated images
        console.log('[deleteReview Service] Deleting review images...');
        try {
            await deleteReviewImages(reviewId);
            console.log('[deleteReview Service] Review images deleted');
        } catch (imgError) {
            console.warn('[deleteReview Service] Warning deleting review images:', imgError.message);
            // Continue anyway, cascade delete will handle it
        }

        // Delete the review (all dependencies should be cleaned up)
        await review.destroy();
        console.log('[deleteReview Service] Review deleted successfully');
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("[deleteReview Service] ERROR:", error.message, error.stack);
        throw new AppError(500, "Không thể xóa đánh giá: " + error.message);
    }
};

/**
 * Duyệt/từ chối đánh giá (Admin only)
 * @param {number} reviewId - ID đánh giá
 * @param {string} status - Trạng thái: 'approved' hoặc 'rejected'
 * @returns {Promise<object>} - Đánh giá sau cập nhật
 */
const approveReview = async (reviewId, status) => {
    try {
        const review = await ProductReview.findByPk(reviewId);
        if (!review) {
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            throw new AppError(400, "Trạng thái không hợp lệ");
        }

        review.status = status;
        await review.save();
        return await getReviewById(reviewId);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("approveReview service error:", error);
        throw new AppError(500, "Không thể cập nhật trạng thái đánh giá");
    }
};

/**
 * Lấy thống kê đánh giá sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<object>} - Thống kê { avgRating, totalReviews, ratingDistribution }
 */
const getReviewStats = async (productId) => {
    try {
        const reviews = await ProductReview.findAll({
            where: { productId, status: 'approved' }
        });

        if (reviews.length === 0) {
            return {
                avgRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;

        reviews.forEach(review => {
            totalRating += review.rating;
            ratingDistribution[review.rating]++;
        });

        return {
            avgRating: (totalRating / reviews.length).toFixed(1),
            totalReviews: reviews.length,
            ratingDistribution
        };
    } catch (error) {
        console.error("getReviewStats service error:", error);
        throw new AppError(500, "Không thể lấy thống kê đánh giá");
    }
};

/**
 * Đánh dấu review là hữu ích (like/helpful)
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise<object>} - Đánh giá sau cập nhật
 */
const markHelpful = async (reviewId) => {
    try {
        const review = await ProductReview.findByPk(reviewId);
        if (!review) {
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        review.increment('helpful_count');
        return await getReviewById(reviewId);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("markHelpful service error:", error);
        throw new AppError(500, "Không thể cập nhật đánh giá");
    }
};

/**
 * Lấy đánh giá của user cho một sản phẩm cụ thể
 * @param {number} productId - ID sản phẩm
 * @param {number} userId - ID người dùng
 * @returns {Promise<object>} - Đánh giá của user hoặc null
 */
const getUserReviewForProduct = async (productId, userId) => {
    try {
        const review = await ProductReview.findOne({
            where: { productId, userId },
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'fullName', 'email'] },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description'],
                    include: [
                        {
                            model: ProductImage,
                            as: 'productImages',
                            attributes: ['id', 'imageUrl', 'isPrimary'],
                            where: { productVariantId: null },
                            required: false,
                            separate: true,
                            limit: 3,
                            order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'displayOrder'],
                    required: false,
                    separate: true,
                    order: [['displayOrder', 'ASC']]
                }
            ]
        });

        return review;
    } catch (error) {
        console.error("getUserReviewForProduct service error:", error);
        throw new AppError(500, "Không thể lấy đánh giá của bạn");
    }
};

/**
 * Thêm ảnh cho đánh giá
 * @param {number} reviewId - ID đánh giá
 * @param {array} imageUrls - Danh sách URL ảnh
 * @returns {Promise<array>} - Danh sách ảnh vừa tạo
 */
const addReviewImages = async (reviewId, imageUrls) => {
    try {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return [];
        }

        const images = await Promise.all(
            imageUrls.map((url, index) =>
                ReviewImage.create({
                    reviewId,
                    imageUrl: url,
                    displayOrder: index
                })
            )
        );
        return images;
    } catch (error) {
        console.error("addReviewImages service error:", error);
        throw new AppError(500, "Không thể thêm ảnh cho đánh giá");
    }
};

/**
 * Xóa ảnh đánh giá
 * @param {number} imageId - ID ảnh
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
const deleteReviewImage = async (imageId) => {
    try {
        const image = await ReviewImage.findByPk(imageId);
        if (!image) {
            throw new AppError(404, "Ảnh đánh giá không tồn tại");
        }
        await image.destroy();
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("deleteReviewImage service error:", error);
        throw new AppError(500, "Không thể xóa ảnh đánh giá");
    }
};

/**
 * Xóa tất cả ảnh của một đánh giá (cả file trên disk và record trong DB)
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise<number>} - Số ảnh đã xóa
 */
const deleteReviewImages = async (reviewId) => {
    try {
        console.log('[deleteReviewImages] Getting images for review:', reviewId);
        
        // Get all images first to delete files
        const images = await ReviewImage.findAll({
            where: { reviewId }
        });

        console.log(`[deleteReviewImages] Found ${images.length} images to delete`);

        // Delete files from disk
        for (const image of images) {
            try {
                if (image.imageUrl && !image.imageUrl.startsWith('http')) {
                    console.log(`[deleteReviewImages] Deleting file: ${image.imageUrl}`);
                    deleteImage(image.imageUrl);
                }
            } catch (fileError) {
                console.warn(`[deleteReviewImages] Warning deleting file ${image.imageUrl}:`, fileError.message);
                // Continue deleting other files
            }
        }

        // Delete records from DB
        const deletedCount = await ReviewImage.destroy({
            where: { reviewId }
        });

        console.log(`[deleteReviewImages] Deleted ${deletedCount} image records for review ${reviewId}`);
        return deletedCount;
    } catch (error) {
        console.error("[deleteReviewImages] service error:", error.message, error.stack);
        throw new AppError(500, "Không thể xóa ảnh đánh giá: " + error.message);
    }
};

/**
 * Lấy danh sách ảnh của sản phẩm (để chọn làm ảnh review)
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<array>} - Danh sách ảnh sản phẩm
 */
const getProductImages = async (productId) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError(404, "Sản phẩm không tồn tại");
        }

        const images = await ProductImage.findAll({
            where: { productId, productVariantId: null },
            attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
            order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
        });

        return images;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getProductImages service error:", error);
        throw new AppError(500, "Không thể lấy ảnh sản phẩm");
    }
};

/**
 * Thêm ảnh từ sản phẩm hoặc upload mới vào đánh giá
 * @param {number} reviewId - ID đánh giá
 * @param {object} imageData - { productImageIds: [], newImageUrls: [] }
 * @returns {Promise<array>} - Danh sách ảnh vừa thêm
 */
const createReviewImagesFromProduct = async (reviewId, imageData) => {
    try {
        const review = await ProductReview.findByPk(reviewId);
        if (!review) {
            throw new AppError(404, "Đánh giá không tồn tại");
        }

        const images = [];
        let displayOrder = 0;

        // 1. Thêm ảnh từ sản phẩm (copy ảnh sản phẩm)
        if (imageData.productImageIds && imageData.productImageIds.length > 0) {
            const productImages = await ProductImage.findAll({
                where: { id: imageData.productImageIds }
            });

            for (const prodImage of productImages) {
                const reviewImage = await ReviewImage.create({
                    reviewId,
                    imageUrl: prodImage.imageUrl,
                    displayOrder: displayOrder++
                });
                images.push(reviewImage);
            }
        }

        // 2. Thêm ảnh upload mới
        if (imageData.newImageUrls && imageData.newImageUrls.length > 0) {
            console.log('[createReviewImagesFromProduct] Processing', imageData.newImageUrls.length, 'new images');
            for (let i = 0; i < imageData.newImageUrls.length; i++) {
                const url = imageData.newImageUrls[i];
                try {
                    if (!url || typeof url !== 'string') {
                        console.warn(`[createReviewImagesFromProduct] Image ${i}: Invalid URL, skipping`);
                        continue;
                    }

                    let imageUrl = url;

                    // If base64, convert to file and get file path
                    if (isBase64Image(url)) {
                        console.log(`[createReviewImagesFromProduct] Image ${i}: Converting base64 to file...`);
                        try {
                            imageUrl = saveBase64Image(url, `review-${reviewId}`);
                            console.log(`[createReviewImagesFromProduct] Image ${i}: Saved to ${imageUrl}`);
                        } catch (saveError) {
                            console.error(`[createReviewImagesFromProduct] Image ${i}: Save failed:`, {
                                message: saveError.message,
                                statusCode: saveError.statusCode
                            });
                            throw saveError; // Re-throw so outer catch handles it
                        }
                    } else if (!url.startsWith('http') && !url.startsWith('/')) {
                        console.warn(`[createReviewImagesFromProduct] Image ${i}: Invalid URL format, skipping`);
                        continue;
                    }

                    // Create record with file path
                    const reviewImage = await ReviewImage.create({
                        reviewId,
                        imageUrl,
                        displayOrder: displayOrder++
                    });
                    console.log(`[createReviewImagesFromProduct] Image ${i}: Created record with ID ${reviewImage.id}`);
                    images.push(reviewImage);
                } catch (imageError) {
                    console.error(`[createReviewImagesFromProduct] Image ${i}: Error:`, {
                        message: imageError.message,
                        statusCode: imageError.statusCode,
                        code: imageError.code
                    });
                    // If it's an AppError (validation/size/etc), throw it
                    if (imageError instanceof AppError) {
                        throw imageError;
                    }
                    // Otherwise continue with other images
                }
            }
        }

        return images;
    } catch (error) {
        console.error("createReviewImagesFromProduct service error:", {
            message: error.message,
            code: error.code
        });
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Không thể thêm ảnh vào đánh giá");
    }
};

module.exports = {
    createReview,
    getReviewsByProduct,
    getReviewById,
    getUserReviewForProduct,
    updateReview,
    deleteReview,
    approveReview,
    getReviewStats,
    markHelpful,
    addReviewImages,
    deleteReviewImage,
    deleteReviewImages,
    getProductImages,
    createReviewImagesFromProduct
};
