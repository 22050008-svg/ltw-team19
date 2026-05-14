import api from "../api/axiosConfig";

/**
 * Lấy danh sách đánh giá của sản phẩm
 * @param {number} productId - ID sản phẩm
 * @param {object} params - Query params { page, limit, sortBy }
 * @returns {Promise}
 */
const getProductReviews = (productId, params = {}) => {
  if (!productId) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.get(`/reviews/product/${productId}`, { params });
};

/**
 * Lấy đánh giá của user hiện tại cho sản phẩm này
 * @param {number} productId - ID sản phẩm
 * @returns {Promise}
 */
const getUserReviewForProduct = (productId) => {
  if (!productId) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.get(`/reviews/product/${productId}/my-review`);
};

/**
 * Lấy thống kê đánh giá sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise}
 */
const getReviewStats = (productId) => {
  if (!productId) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.get(`/reviews/product/${productId}/stats`);
};

/**
 * Tạo đánh giá mới
 * @param {object} data - { productId, rating, title, comment }
 * @returns {Promise}
 */
const createReview = (data) => {
  console.log('[ReviewService] Creating review with data:', data);
  return api.post('/reviews', data);
};

/**
 * Cập nhật đánh giá
 * @param {number} reviewId - ID đánh giá
 * @param {object} data - { rating, title, comment }
 * @returns {Promise}
 */
const updateReview = (reviewId, data) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  return api.put(`/reviews/${reviewId}`, data);
};

/**
 * Xóa đánh giá
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise}
 */
const deleteReview = (reviewId) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  return api.delete(`/reviews/${reviewId}`);
};

/**
 * Đánh dấu review là hữu ích
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise}
 */
const markHelpful = (reviewId) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  return api.post(`/reviews/${reviewId}/helpful`);
};

/**
 * Lấy danh sách trả lời cho một đánh giá
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise}
 */
const getRepliesByReview = (reviewId) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  return api.get(`/reviews/${reviewId}/replies`);
};

/**
 * Tạo trả lời cho đánh giá
 * @param {number} reviewId - ID đánh giá
 * @param {object} data - { comment, isOfficial }
 * @returns {Promise}
 */
const createReply = (reviewId, data) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  return api.post(`/reviews/${reviewId}/replies`, data);
};

/**
 * Cập nhật trả lời
 * @param {number} reviewId - ID đánh giá
 * @param {number} replyId - ID trả lời
 * @param {object} data - { comment }
 * @returns {Promise}
 */
const updateReply = (reviewId, replyId, data) => {
  if (!reviewId || !replyId) {
    return Promise.reject(new Error('Review ID and Reply ID are required.'));
  }
  return api.put(`/reviews/${reviewId}/replies/${replyId}`, data);
};

/**
 * Xóa trả lời
 * @param {number} reviewId - ID đánh giá
 * @param {number} replyId - ID trả lời
 * @returns {Promise}
 */
const deleteReply = (reviewId, replyId) => {
  if (!reviewId || !replyId) {
    return Promise.reject(new Error('Review ID and Reply ID are required.'));
  }
  return api.delete(`/reviews/${reviewId}/replies/${replyId}`);
};

/**
 * Lấy danh sách ảnh sản phẩm để chọn làm ảnh review
 * @param {number} productId - ID sản phẩm
 * @returns {Promise}
 */
const getProductImagesForReview = (productId) => {
  if (!productId) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.get(`/reviews/product/${productId}/images-for-review`);
};

/**
 * Thêm ảnh vào đánh giá từ ảnh sản phẩm hoặc ảnh upload
 * @param {number} reviewId - ID đánh giá
 * @param {object} imageData - { productImageIds: [], newImageUrls: [] }
 * @returns {Promise}
 */
const addReviewImagesFromProduct = (reviewId, imageData) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  
  // Ensure imageData has the correct structure
  const validatedData = {
    productImageIds: imageData?.productImageIds || [],
    newImageUrls: imageData?.newImageUrls || []
  };
  
  console.log('[ReviewService] Adding images to review:', {
    reviewId,
    productImageIds: validatedData.productImageIds,
    newImageUrlsCount: validatedData.newImageUrls.length
  });
  
  return api.post(`/reviews/${reviewId}/images-from-product`, validatedData);
};

/**
 * Xóa tất cả ảnh của một đánh giá
 * @param {number} reviewId - ID đánh giá
 * @returns {Promise}
 */
const deleteReviewImages = (reviewId) => {
  if (!reviewId) {
    return Promise.reject(new Error('Review ID is required.'));
  }
  
  console.log('[ReviewService] Deleting all images from review:', reviewId);
  
  return api.delete(`/reviews/${reviewId}/images`);
};

const reviewService = {
  getProductReviews,
  getUserReviewForProduct,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getRepliesByReview,
  createReply,
  updateReply,
  deleteReply,
  getProductImagesForReview,
  addReviewImagesFromProduct,
  deleteReviewImages,
};

export default reviewService;
