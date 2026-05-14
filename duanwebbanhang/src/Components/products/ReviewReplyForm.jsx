import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import reviewService from '../../Services/ReviewService';
import { useAuth } from '../../Context/AuthContext';

// ★ Helper function to check if user has a specific permission
const hasPermission = (user, permissionName) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
        return false;
    }
    
    return user.roles.some(role => 
        role.permissions && 
        Array.isArray(role.permissions) && 
        role.permissions.some(perm => perm.name === permissionName)
    );
};

const ReviewReplyForm = ({ reviewId, onReplyPosted, onCancel }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ★ Check if user has review.reply permission
  const hasReplyPermission = hasPermission(user, 'review.reply');
  
  // ★ DEBUG: Log permission check results
  console.log('[ReviewReplyForm] User roles:', user?.roles);
  console.log('[ReviewReplyForm] Has review.reply permission:', hasReplyPermission);

  if (!hasReplyPermission) {
    console.log('[ReviewReplyForm] User does not have permission, form hidden');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[ReviewReplyForm] Submitting reply for review:', reviewId);
      const response = await reviewService.createReply(reviewId, {
        comment: comment.trim(),
        isOfficial: true
      });

      console.log('[ReviewReplyForm] Reply created successfully:', response.data);
      setComment('');
      onReplyPosted();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Không thể gửi trả lời';
      console.error('[ReviewReplyForm] Error creating reply:', {
        status: err.response?.status,
        data: err.response?.data,
        error: err.message
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-reply-form-container">
      <form className="review-reply-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h4>Trả lời đánh giá</h4>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-close">
              <X size={18} />
            </button>
          )}
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập trả lời của cửa hàng..."
          rows="3"
          maxLength={1000}
          className="reply-textarea"
          disabled={loading}
        />

        <div className="form-footer">
          <span className="char-count">{comment.length}/1000</span>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !comment.trim()}
          >
            <Send size={16} />
            {loading ? 'Đang gửi...' : 'Gửi trả lời'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewReplyForm;
