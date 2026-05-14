const express = require("express");
const productReviewController = require("../../controllers/product-review.controller");
const authorization = require("../../middlewares/authorization");
const { checkPermission } = require("../../middlewares/permission.middleware");

// Path: /api/v1/reviews
const productReviewRouter = express.Router();

// ★ PUBLIC ENDPOINTS (không cần auth)
// Lấy danh sách đánh giá của sản phẩm
productReviewRouter.get("/product/:productId", productReviewController.getProductReviews);

// Lấy thống kê đánh giá sản phẩm
productReviewRouter.get("/product/:productId/stats", productReviewController.getReviewStats);

// Lấy danh sách ảnh sản phẩm để chọn làm ảnh review
productReviewRouter.get("/product/:productId/images-for-review", productReviewController.getProductImagesForReview);

// ★ AUTHENTICATED ENDPOINTS (cần login)
// Lấy đánh giá của user hiện tại cho sản phẩm này
productReviewRouter.get("/product/:productId/my-review", authorization, productReviewController.getUserReview);

// Tạo đánh giá mới
productReviewRouter.post("/", authorization, productReviewController.createReview);

// Cập nhật đánh giá của người dùng
productReviewRouter.put("/:reviewId", authorization, productReviewController.updateReview);

// Thêm ảnh vào đánh giá từ ảnh sản phẩm hoặc upload
productReviewRouter.post("/:reviewId/images-from-product", authorization, productReviewController.addReviewImagesFromProduct);

// Xóa tất cả ảnh của đánh giá
productReviewRouter.delete("/:reviewId/images", authorization, productReviewController.deleteReviewImages);

// Xóa đánh giá (Users can delete own reviews, admins can delete any review)
productReviewRouter.delete("/:reviewId", authorization, productReviewController.deleteReview);

// Đánh dấu review là hữu ích
productReviewRouter.post("/:reviewId/helpful", authorization, productReviewController.markHelpful);

// ★ ADMIN ENDPOINTS
// Lấy danh sách tất cả đánh giá
productReviewRouter.get("/admin/all", authorization, checkPermission("review.view"), productReviewController.getAllReviews);

// Duyệt/từ chối đánh giá
productReviewRouter.patch("/admin/:reviewId/approve", authorization, checkPermission("review.approve"), productReviewController.approveReview);

module.exports = productReviewRouter;
