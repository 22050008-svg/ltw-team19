/**
 * ReviewReply Service
 * Handles CRUD operations for review replies (seller/staff responses to product reviews)
 * Permission Requirements:
 * - Create reply: Requires "review.reply" permission or admin role
 * - Update/Delete own reply: Owner or admin
 */

const { ReviewReply, ProductReview, User, Product } = require("../models");
const AppError = require("../helpers/error").AppError || require("../helpers/error");
class AppErrorHelper extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}
const ErrorClass = (typeof AppError === 'function' && AppError.prototype instanceof Error) ? AppError : AppErrorHelper;

// ★ CREATE REPLY - Add seller/staff response to a review
const createReply = async (reviewId, userId, { comment, isOfficial = true }) => {
  try {
    // Validate review exists
    const review = await ProductReview.findByPk(reviewId);
    if (!review) {
      throw new ErrorClass(404, "Đánh giá không tồn tại");
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      throw new AppError("Nội dung trả lời không được để trống", 400);
    }

    if (comment.trim().length > 1000) {
      throw new AppError("Nội dung trả lời không được vượt quá 1000 ký tự", 400);
    }

    // Check if staff already replied to this review
    const existingReply = await ReviewReply.findOne({
      where: { reviewId, userId }
    });
    if (existingReply) {
      throw new ErrorClass(400, "Bạn đã trả lời đánh giá này rồi. Hãy chỉnh sửa trả lời hiện tại");
    }

    // Create reply
    const reply = await ReviewReply.create({
      reviewId,
      userId,
      comment: comment.trim(),
      isOfficial
    });

    // Return with staff info
    return await ReviewReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        }
      ]
    });
  } catch (error) {
    throw error;
  }
};

// ★ GET REPLIES BY REVIEW - Fetch all replies for a specific review
const getRepliesByReview = async (reviewId, includeStaff = true) => {
  try {
    // Verify review exists
    const review = await ProductReview.findByPk(reviewId);
    if (!review) {
      throw new ErrorClass(404, "Đánh giá không tồn tại");
    }

    const options = {
      where: { reviewId },
      order: [['createdAt', 'ASC']]
    };

    if (includeStaff) {
      options.include = [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        }
      ];
    }

    const replies = await ReviewReply.findAll(options);
    return replies;
  } catch (error) {
    throw error;
  }
};

// ★ GET ALL REPLIES - Admin function to get all replies with filtering
const getAllReplies = async (filters = {}, pagination = {}) => {
  try {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (filters.reviewId) where.reviewId = filters.reviewId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.isOfficial !== undefined) where.isOfficial = filters.isOfficial;

    const { count, rows } = await ReviewReply.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        },
        {
          model: ProductReview,
          as: 'review',
          attributes: ['id', 'productId', 'rating', 'title', 'comment'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// ★ UPDATE REPLY - Edit existing reply (owner or admin only)
const updateReply = async (replyId, userId, userRole, { comment }) => {
  try {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) {
      throw new AppError("Trả lời không tồn tại", 404);
    }

    // Check authorization - only owner or admin can update
    if (reply.userId !== userId && userRole !== 'admin') {
      throw new ErrorClass(403, "Bạn không có quyền chỉnh sửa trả lời này");
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      throw new ErrorClass(400, "Nội dung trả lời không được để trống");
    }

    if (comment.trim().length > 1000) {
      throw new ErrorClass(400, "Nội dung trả lời không được vượt quá 1000 ký tự");
    }

    // Update reply
    await reply.update({ comment: comment.trim() });

    // Return updated reply with staff info
    return await ReviewReply.findByPk(replyId, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        }
      ]
    });
  } catch (error) {
    throw error;
  }
};

// ★ DELETE REPLY - Remove reply (owner or admin only)
const deleteReply = async (replyId, userId, userRole) => {
  try {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) {
      throw new ErrorClass(404, "Trả lời không tồn tại");
    }

    // Check authorization - only owner or admin can delete
    if (reply.userId !== userId && userRole !== 'admin') {
      throw new ErrorClass(403, "Bạn không có quyền xóa trả lời này");
    }

    const reviewId = reply.reviewId;
    await reply.destroy();

    return {
      message: "Trả lời đã được xóa thành công",
      reviewId
    };
  } catch (error) {
    throw error;
  }
};

// ★ GET REPLY BY ID - Fetch specific reply with staff info
const getReplyById = async (replyId) => {
  try {
    const reply = await ReviewReply.findByPk(replyId, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        },
        {
          model: ProductReview,
          as: 'review',
          attributes: ['id', 'productId', 'rating', 'title', 'comment']
        }
      ]
    });

    if (!reply) {
      throw new AppError("Trả lời không tồn tại", 404);
    }

    return reply;
  } catch (error) {
    throw error;
  }
};

// ★ COUNT REPLIES - Get number of replies for a review
const countRepliesByReview = async (reviewId) => {
  try {
    const count = await ReviewReply.count({ where: { reviewId } });
    return count;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReply,
  getRepliesByReview,
  getAllReplies,
  updateReply,
  deleteReply,
  getReplyById,
  countRepliesByReview
};
