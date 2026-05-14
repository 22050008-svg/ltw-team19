/**
 * Review Reply Router
 * API Endpoints for seller/staff responses to product reviews
 * 
 * PUBLIC Routes:
 *   GET /reviews/:reviewId/replies - View all replies for a review
 *   GET /reviews/:reviewId/replies/:replyId - Get specific reply
 * 
 * AUTHENTICATED Routes:
 *   POST /reviews/:reviewId/replies - Create reply (requires review.reply permission or admin)
 *   PUT /reviews/:reviewId/replies/:replyId - Update own reply
 *   DELETE /reviews/:reviewId/replies/:replyId - Delete own reply
 * 
 * ADMIN Routes:
 *   GET /admin/reviews/replies - Get all replies with filters
 */

const express = require("express");
const reviewReplyRouter = express.Router();
const reviewReplyController = require("../../controllers/review-reply.controller");
const authorization = require("../../middlewares/authorization");
const checkPermission = require("../../middlewares/checkPermission");

// ★ PUBLIC ROUTES
// Get all replies for a review
reviewReplyRouter.get("/reviews/:reviewId/replies", reviewReplyController.getRepliesByReview);

// Get specific reply
reviewReplyRouter.get("/reviews/:reviewId/replies/:replyId", reviewReplyController.getReplyById);

// ★ AUTHENTICATED ROUTES
// Create reply (requires review.reply permission or admin)
reviewReplyRouter.post(
  "/reviews/:reviewId/replies",
  authorization,
  checkPermission("review.reply"),
  reviewReplyController.createReply
);

// Update reply (owner or admin)
reviewReplyRouter.put(
  "/reviews/:reviewId/replies/:replyId",
  authorization,
  reviewReplyController.updateReply
);

// Delete reply (owner or admin)
reviewReplyRouter.delete(
  "/reviews/:reviewId/replies/:replyId",
  authorization,
  reviewReplyController.deleteReply
);

// ★ ADMIN ROUTES
// Get all replies with filters and pagination
reviewReplyRouter.get(
  "/admin/reviews/replies",
  authorization,
  checkPermission("reply.view"),
  reviewReplyController.getAllReplies
);

module.exports = reviewReplyRouter;
