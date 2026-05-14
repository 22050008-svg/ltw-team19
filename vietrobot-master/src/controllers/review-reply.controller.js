/**
 * ReviewReply Controller
 * Handles HTTP requests for review replies
 * Permission: Requires "review.reply" permission or admin role to create/update/delete
 */

const reviewReplyService = require("../services/review-reply.service");
const { response } = require("../helpers/response");

// ★ CREATE REPLY - POST /reviews/:reviewId/replies
const createReply = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment, isOfficial } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate reviewId
    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json(response(null, "ID đánh giá không hợp lệ", false));
    }

    // Validate request body
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json(response(null, "Nội dung trả lời không được để trống", false));
    }

    // Create reply
    const reply = await reviewReplyService.createReply(reviewId, userId, {
      comment,
      isOfficial: isOfficial !== false
    });

    return res.status(201).json(response(reply, "Trả lời đã được tạo thành công", true));
  } catch (error) {
    next(error);
  }
};

// ★ GET REPLIES BY REVIEW - GET /reviews/:reviewId/replies
const getRepliesByReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Validate reviewId
    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json(response(null, "ID đánh giá không hợp lệ", false));
    }

    const replies = await reviewReplyService.getRepliesByReview(reviewId, true);

    return res.status(200).json(response(replies, "Lấy danh sách trả lời thành công", true));
  } catch (error) {
    next(error);
  }
};

// ★ GET REPLY BY ID - GET /reviews/:reviewId/replies/:replyId
const getReplyById = async (req, res, next) => {
  try {
    const { replyId } = req.params;

    // Validate replyId
    if (!replyId || isNaN(replyId)) {
      return res.status(400).json(response(null, "ID trả lời không hợp lệ", false));
    }

    const reply = await reviewReplyService.getReplyById(replyId);

    return res.status(200).json(response(reply, "Lấy trả lời thành công", true));
  } catch (error) {
    next(error);
  }
};

// ★ UPDATE REPLY - PUT /reviews/:reviewId/replies/:replyId
const updateReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate replyId
    if (!replyId || isNaN(replyId)) {
      return res.status(400).json(response(null, "ID trả lời không hợp lệ", false));
    }

    // Validate request body
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json(response(null, "Nội dung trả lời không được để trống", false));
    }

    const updatedReply = await reviewReplyService.updateReply(replyId, userId, userRole, {
      comment
    });

    return res.status(200).json(response(updatedReply, "Trả lời đã được cập nhật thành công", true));
  } catch (error) {
    next(error);
  }
};

// ★ DELETE REPLY - DELETE /reviews/:reviewId/replies/:replyId
const deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate replyId
    if (!replyId || isNaN(replyId)) {
      return res.status(400).json(response(null, "ID trả lời không hợp lệ", false));
    }

    const result = await reviewReplyService.deleteReply(replyId, userId, userRole);

    return res.status(200).json(response(result, "Trả lời đã được xóa thành công", true));
  } catch (error) {
    next(error);
  }
};

// ★ GET ALL REPLIES (ADMIN) - GET /admin/reviews/replies
const getAllReplies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, reviewId, userId, isOfficial } = req.query;

    const filters = {};
    if (reviewId) filters.reviewId = reviewId;
    if (userId) filters.userId = userId;
    if (isOfficial !== undefined) filters.isOfficial = isOfficial === 'true';

    const result = await reviewReplyService.getAllReplies(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return res.status(200).json(response(result, "Lấy danh sách trả lời thành công", true));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReply,
  getRepliesByReview,
  getReplyById,
  updateReply,
  deleteReply,
  getAllReplies
};
