import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Trash2, Edit2, MessageSquare } from 'lucide-react';
import reviewService from '../../Services/ReviewService';
import ReviewReplyForm from './ReviewReplyForm';
import ReviewImageSelector from './ReviewImageSelector';
import { useAuth } from '../../Context/AuthContext';
import '../styles/ProductReviews.css';

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

const ProductReviews = ({ productId, isAuthenticated, userId }) => {
    console.log('[ProductReviews] Props received:', { productId, isAuthenticated, userId });
    
    const { user: currentUser } = useAuth(); // Get current user from context
    
    // ★ DEBUG: Log current user and permission check
    console.log('[ProductReviews] Current user:', currentUser);
    console.log('[ProductReviews] User roles:', currentUser?.roles);
    console.log('[ProductReviews] Has review.reply permission:', hasPermission(currentUser, 'review.reply'));
    
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [userReview, setUserReview] = useState(null); // Store user's own review
    const [userReviewLoading, setUserReviewLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [rating, setRating] = useState('all'); // Filter by star rating
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [errorMessage, setErrorMessage] = useState(null);
    const [repliesByReview, setRepliesByReview] = useState({}); // Store replies for each review
    const [showReplyForm, setShowReplyForm] = useState(null); // Control which review's reply form is shown
    const [loadingReplies, setLoadingReplies] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [selectedImages, setSelectedImages] = useState(null); // Store selected images for new review
    const [submittingImages, setSubmittingImages] = useState(false); // Track image submission state
    const [originalReviewImages, setOriginalReviewImages] = useState(null); // Store original images when editing

    // Fetch reviews
    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [productId, page, sortBy, rating]);

    // Fetch user's own review if authenticated
    useEffect(() => {
        if (isAuthenticated && userId && productId) {
            fetchUserReview();
        }
    }, [isAuthenticated, userId, productId]);

    // Fetch replies for all reviews
    useEffect(() => {
        if (reviews.length > 0) {
            reviews.forEach(review => {
                fetchRepliesForReview(review.id);
            });
        }
    }, [reviews]);

    const fetchUserReview = async () => {
        try {
            setUserReviewLoading(true);
            const response = await reviewService.getUserReviewForProduct(productId);
            console.log('[ProductReviews] User review fetched:', response.data.data);
            setUserReview(response.data.data);
        } catch (error) {
            // No review yet, that's fine
            console.log('[ProductReviews] User has no review yet');
            setUserReview(null);
        } finally {
            setUserReviewLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.getProductReviews(productId, {
                page,
                limit: 5,
                sortBy,
                rating
            });
            console.log('[ProductReviews] Reviews fetched:', {
                count: response.data.data.data.length,
                firstReview: response.data.data.data[0],
                firstReviewImages: response.data.data.data[0]?.images
            });
            setReviews(response.data.data.data);
            setTotalPages(response.data.data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await reviewService.getReviewStats(productId);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch review stats:', error);
        }
    };

    const fetchRepliesForReview = async (reviewId) => {
        try {
            setLoadingReplies(prev => ({ ...prev, [reviewId]: true }));
            const response = await reviewService.getRepliesByReview(reviewId);
            setRepliesByReview(prev => ({
                ...prev,
                [reviewId]: response.data.data || []
            }));
        } catch (error) {
            console.error(`Failed to fetch replies for review ${reviewId}:`, error);
            setRepliesByReview(prev => ({
                ...prev,
                [reviewId]: []
            }));
        } finally {
            setLoadingReplies(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        console.log('[ProductReviews] Submitting review:', { 
            isAuthenticated, 
            userId, 
            formData,
            editingId,
            selectedImages
        });

        if (!isAuthenticated || !userId) {
            setErrorMessage('Vui lòng đăng nhập để gửi đánh giá');
            return;
        }

        // Validate form data
        if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
            setErrorMessage('Vui lòng chọn số sao từ 1 đến 5');
            return;
        }

        if (!formData.title || formData.title.trim().length === 0) {
            setErrorMessage('Vui lòng nhập tiêu đề đánh giá');
            return;
        }

        if (!formData.comment || formData.comment.trim().length === 0) {
            setErrorMessage('Vui lòng nhập nhận xét/bình luận');
            return;
        }

        try {
            setErrorMessage(null);
            let createdReviewId = null;

            if (editingId) {
                // Update existing review
                await reviewService.updateReview(editingId, {
                    rating: formData.rating,
                    title: formData.title.trim(),
                    comment: formData.comment.trim()
                });
                console.log('[ProductReviews] Review updated successfully');
                createdReviewId = editingId;
            } else {
                // Create new review
                const response = await reviewService.createReview({
                    productId,
                    rating: formData.rating,
                    title: formData.title.trim(),
                    comment: formData.comment.trim()
                });
                console.log('[ProductReviews] Review created successfully:', response.data);
                createdReviewId = response.data.data.id;
            }

            // Submit images if any selected or any new ones uploaded
            if (selectedImages && createdReviewId) {
                try {
                    setSubmittingImages(true);
                    
                    const productImageIds = selectedImages.productImageIds || [];
                    const newImageUrls = selectedImages.newImageUrls || [];
                    
                    console.log('[ProductReviews] Processing images:', {
                        reviewId: createdReviewId,
                        productImageIds: productImageIds.length,
                        newImageUrls: newImageUrls.length,
                        isEdit: !!editingId
                    });
                    
                    // If editing: always delete old images first
                    if (editingId) {
                        console.log('[ProductReviews] Deleting old review images for edit');
                        try {
                            await reviewService.deleteReviewImages(editingId);
                            console.log('[ProductReviews] Old images deleted');
                        } catch (deleteError) {
                            console.warn('[ProductReviews] Failed to delete old images:', deleteError.message);
                        }
                    }
                    
                    // Add new images if any exist
                    if (productImageIds.length > 0 || newImageUrls.length > 0) {
                        console.log('[ProductReviews] Adding new images to review');
                        await reviewService.addReviewImagesFromProduct(createdReviewId, {
                            productImageIds,
                            newImageUrls
                        });
                        console.log('[ProductReviews] Images added successfully');
                    } else {
                        console.log('[ProductReviews] No images to add');
                    }
                } catch (imageError) {
                    const imageErrorMsg = imageError.response?.data?.error 
                        || imageError.response?.data?.message 
                        || imageError.message 
                        || 'Lỗi khi cập nhật hình ảnh';
                    console.error('[ProductReviews] Error handling review images:', {
                        message: imageErrorMsg,
                        status: imageError.response?.status,
                        fullError: imageError
                    });
                    // Don't fail the whole operation if images fail, just log it
                    setErrorMessage(`Đánh giá đã được cập nhật nhưng có lỗi khi cập nhật hình ảnh: ${imageErrorMsg}`);
                }
            }

            // Reset form and refresh
            setFormData({ rating: 5, title: '', comment: '' });
            setSelectedImages(null);
            setOriginalReviewImages(null);
            setEditingId(null);
            setShowForm(false);
            setSubmittingImages(false);
            fetchReviews();
            fetchStats();
            fetchUserReview(); // Refresh user's review
        } catch (error) {
            console.error('[ProductReviews] Error submitting review:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            
            // Handle "already reviewed" error
            if (errorMsg && errorMsg.includes('đã đánh giá')) {
                setErrorMessage('Bạn đã đánh giá sản phẩm này rồi. Hãy chỉnh sửa đánh giá của bạn ở dưới.');
                // Try to load their existing review
                fetchUserReview();
            } else {
                setErrorMessage(errorMsg || 'Không thể gửi đánh giá. Vui lòng thử lại.');
            }
            setSubmittingImages(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        console.log('[ProductReviews] Delete button clicked:', { reviewId, userId, isAuthenticated });
        
        if (!isAuthenticated || !userId) {
            alert('Vui lòng đăng nhập để xóa đánh giá');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

        try {
            await reviewService.deleteReview(reviewId);
            console.log('[ProductReviews] Review deleted successfully');
            setUserReview(null);  // Clear user review from state
            fetchReviews();       // Refresh the reviews list
            fetchStats();         // Refresh stats
            fetchUserReview();    // Make sure user review is cleared
            setErrorMessage(null);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể xóa đánh giá';
            console.error('[ProductReviews] Error deleting review:', { errorMsg, fullError: error });
            setErrorMessage(`Lỗi xóa đánh giá: ${errorMsg}`);
        }
    };

    const handleEditReview = (review) => {
        console.log('[ProductReviews] Edit button clicked:', { reviewId: review.id, userId, isAuthenticated, reviewImages: review.images, editCount: review.edit_count });
        
        if (!isAuthenticated || !userId) {
            alert('Vui lòng đăng nhập để chỉnh sửa đánh giá');
            return;
        }

        // ★ NEW: Check if review has already been edited once (max 1 edit)
        if (review.edit_count >= 1) {
            setErrorMessage('Bạn đã chỉnh sửa đánh giá này rồi. Chỉ được phép chỉnh sửa 1 lần.');
            return;
        }

        setEditingId(review.id);
        setFormData({
            rating: review.rating,
            title: review.title || '',
            comment: review.comment || ''
        });
        
        // Load existing images from review
        if (review.images && review.images.length > 0) {
            console.log('[ProductReviews] Loading existing review images:', review.images);
            const existingImageUrls = review.images.map(img => img.imageUrl);
            setOriginalReviewImages(review.images); // Store original images for later comparison
            setSelectedImages({
                productImageIds: [],
                newImageUrls: existingImageUrls,
                existingImageIds: review.images.map(img => img.id)
            });
        } else {
            setOriginalReviewImages(null);
            setSelectedImages(null);
        }
        
        setShowForm(true);
    };

    const handleMarkHelpful = async (reviewId) => {
        console.log('[ProductReviews] Mark helpful clicked:', { reviewId, isAuthenticated });
        
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để đánh dấu hữu ích');
            return;
        }

        try {
            await reviewService.markHelpful(reviewId);
            console.log('[ProductReviews] Marked as helpful');
            fetchReviews();
        } catch (error) {
            console.error('Failed to mark helpful:', error);
        }
    };

    const handleReplyPosted = (reviewId) => {
        // Refresh replies for this review
        fetchRepliesForReview(reviewId);
        setShowReplyForm(null);
    };

    // Xây dựng full URL cho ảnh
    const getFullImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/150?text=No+Image';
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        return `${baseUrl}/${url}`;
    };

    const renderStars = (rating, size = 'md', interactive = false) => {
        return (
            <div className={`stars stars-${size} ${interactive ? 'interactive' : ''}`}>
                {[1, 2, 3, 4, 5].map(i => {
                    const isFilled = i <= rating;
                    return (
                        <Star
                            key={i}
                            size={size === 'lg' ? 32 : (size === 'md' ? 20 : 16)}
                            className={`star-icon ${isFilled ? 'filled' : 'empty'}`}
                            fill={isFilled ? '#ff7733' : 'none'}
                            stroke={isFilled ? '#ff7733' : '#d0d0d0'}
                            strokeWidth={2}
                            onClick={interactive ? () => setFormData({ ...formData, rating: i }) : undefined}
                            style={interactive ? { cursor: 'pointer', pointerEvents: 'auto' } : {}}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="product-reviews-section">
            <h2 className="reviews-title">Đánh giá sản phẩm</h2>

            {/* Rating Stats */}
            {stats && (
                <div className="reviews-stats">
                    <div className="avg-rating">
                        <div className="rating-number">{stats.avgRating}</div>
                        <div className="rating-stars">
                            {renderStars(Math.round(stats.avgRating), 'sm')}
                        </div>
                        <div className="total-reviews">({stats.totalReviews} đánh giá)</div>
                    </div>

                    <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map(starNum => (
                            <div key={starNum} className="distribution-row">
                                <span className="star-label">{starNum} sao</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${stats.totalReviews > 0 
                                                ? (stats.ratingDistribution[starNum] / stats.totalReviews) * 100 
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="count">{stats.ratingDistribution[starNum]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <span>{errorMessage}</span>
                    <button className="close-error" onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            {/* Write Review Button - For users without a review */}
            {!userReview && !showForm && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            if (!isAuthenticated) {
                                alert('Vui lòng đăng nhập để viết đánh giá');
                                return;
                            }
                            setShowForm(true);
                        }}
                        style={{ padding: '10px 20px', fontSize: '16px' }}
                    >
                        Viết đánh giá của bạn
                    </button>
                </div>
            )}

            {/* User's Existing Review (if any) */}
            {userReview && !showForm && (
                <div className="user-review-section">
                    <h3>Đánh giá của bạn</h3>
                    <div className="review-item">
                        <div className="review-header">
                            <div>
                                <div className="reviewer-name">{userReview.reviewer?.fullName || 'Bạn'}</div>
                                <div className="review-date">
                                    {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="review-badge">{userReview.status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}</div>
                        </div>
                        <div className="review-rating">
                            {renderStars(userReview.rating, 'md', false)}
                        </div>
                        {userReview.title && <div className="review-title">{userReview.title}</div>}
                        {userReview.comment && <div className="review-comment">{userReview.comment}</div>}
                        
                        {/* Display User Review Images */}
                        {userReview.images && userReview.images.length > 0 && (
                            <div className="review-images-gallery">
                                <div className="gallery-label">Ảnh từ bạn:</div>
                                <div className="images-grid">
                                    {userReview.images.map((image, index) => (
                                        <div key={image.id || index} className="image-item">
                                            <img 
                                                src={getFullImageUrl(image.imageUrl)}
                                                alt={`Your review image ${index + 1}`}
                                                className="review-image"
                                                style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="review-actions">
                            {/* ★ NEW: Show edit disable message if already edited */}
                            {userReview.edit_count >= 1 ? (
                                <div className="edit-info" style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                    ✓ Đã chỉnh sửa 1 lần (không thể sửa thêm)
                                </div>
                            ) : null}
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => handleEditReview(userReview)}
                                disabled={userReview.edit_count >= 1}
                                style={{ opacity: userReview.edit_count >= 1 ? 0.5 : 1, cursor: userReview.edit_count >= 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Chỉnh sửa
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteReview(userReview.id)}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            {showForm && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                    <h3>{editingId ? 'Cập nhật đánh giá' : 'Thêm đánh giá của bạn'}</h3>

                    {/* Rating Input */}
                    <div className="form-group">
                        <label>Đánh giá sản phẩm:</label>
                        <div className="rating-input">
                            {renderStars(formData.rating, 'lg', true)}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="form-group">
                        <label>Tiêu đề:</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Tiêu đề đánh giá..."
                            maxLength={100}
                        />
                    </div>

                    {/* Comment Input */}
                    <div className="form-group">
                        <label>Nhận xét:</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            rows="4"
                        ></textarea>
                    </div>

                    {/* Image Selection */}
                    <div className="form-group">
                        <label>Thêm hình ảnh cho đánh giá (Tùy chọn):</label>
                        <ReviewImageSelector
                            onImagesSelected={setSelectedImages}
                            existingImages={selectedImages?.newImageUrls || []}
                        />
                    </div>

                    {/* Form Buttons */}
                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={submittingImages}
                        >
                            {submittingImages ? 'Đang gửi hình ảnh...' : (editingId ? 'Cập nhật' : 'Gửi đánh giá')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({ rating: 5, title: '', comment: '' });
                                setSelectedImages(null);
                            }}
                            disabled={submittingImages}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* Sort & Filter Options */}
            {reviews.length > 0 && !showForm && (
                <div className="review-controls">
                    <div className="sort-filter-row">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="sort-select"
                        >
                            <option value="recent">Mới nhất</option>
                            <option value="highest-rating">Đánh giá cao nhất</option>
                            <option value="lowest-rating">Đánh giá thấp nhất</option>
                            <option value="most-helpful">Hữu ích nhất</option>
                        </select>
                    </div>

                    {/* Star Rating Filter */}
                    <div className="rating-filter">
                        <span className="filter-label">Lọc theo sao:</span>
                        <button
                            className={`rating-btn ${rating === 'all' ? 'active' : ''}`}
                            onClick={() => {
                                setRating('all');
                                setPage(1);
                            }}
                        >
                            Tất cả
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                className={`rating-btn ${rating === String(star) ? 'active' : ''}`}
                                onClick={() => {
                                    setRating(String(star));
                                    setPage(1);
                                }}
                                title={`${star} sao`}
                            >
                                {[...Array(star)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className="star-icon"
                                        fill="#ff7733"
                                        stroke="#ff7733"
                                        strokeWidth={2}
                                        style={{ display: 'inline', marginRight: '2px' }}
                                    />
                                ))}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
                {loading ? (
                    <p className="loading">Đang tải đánh giá...</p>
                ) : reviews.length === 0 ? (
                    <p className="no-reviews">Chưa có đánh giá nào</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-item">
                            {/* Product Info with Image */}
                            {review.product && (
                                <div className="review-product-info">
                                    {review.product.images && review.product.images.length > 0 && (
                                        <a 
                                            href={`/products/${review.product.id}`}
                                            className="product-image-link"
                                            title={review.product.name}
                                        >
                                            <img 
                                                src={review.product.images[0].imageUrl}
                                                alt={review.product.name}
                                                className="product-image-thumbnail"
                                            />
                                        </a>
                                    )}
                                    <a 
                                        href={`/products/${review.product.id}`}
                                        className="product-name-link"
                                        title={review.product.name}
                                    >
                                        {review.product.name}
                                    </a>
                                </div>
                            )}

                            <div className="review-header">
                                <div>
                                    <div className="reviewer-name">{review.reviewer?.fullName || 'Người dùng ẩn danh'}</div>
                                    <div className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                {isAuthenticated && userId === review.userId && (
                                    <div className="review-actions">
                                        {/* ★ NEW: Disable edit button if review already edited once */}
                                        <button
                                            className="btn-icon edit"
                                            onClick={() => handleEditReview(review)}
                                            disabled={review.edit_count >= 1}
                                            title={review.edit_count >= 1 ? "Đã chỉnh sửa 1 lần, không thể sửa thêm" : "Chỉnh sửa"}
                                        >
                                            <Edit2 size={16} style={{ opacity: review.edit_count >= 1 ? 0.5 : 1 }} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDeleteReview(review.id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="review-rating">
                                {renderStars(review.rating, 'md', false)}
                            </div>

                            {review.title && (
                                <div className="review-title">{review.title}</div>
                            )}

                            {review.comment && (
                                <div className="review-comment">{review.comment}</div>
                            )}

                            {/* Display Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="review-images-gallery">
                                    <div className="gallery-label">Ảnh từ khách hàng:</div>
                                    <div className="images-grid">
                                        {review.images.map((image, index) => (
                                            <div key={image.id || index} className="image-item">
                                                <img 
                                                    src={getFullImageUrl(image.imageUrl)}
                                                    alt={`Review image ${index + 1}`}
                                                    className="review-image"
                                                    title="Click để xem phóng to"
                                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Error'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="review-footer">
                                <button
                                    className="btn-helpful"
                                    onClick={() => handleMarkHelpful(review.id)}
                                >
                                    <ThumbsUp size={14} />
                                    <span>{review.helpful_count || 0}</span>
                                </button>

                                {/* Show reply count */}
                                <span className="reply-count">
                                    <MessageSquare size={14} />
                                    {repliesByReview[review.id]?.length || 0} trả lời
                                </span>
                            </div>

                            {/* Display Replies */}
                            {repliesByReview[review.id] && repliesByReview[review.id].length > 0 && (
                                <div className="review-replies">
                                    <div className="replies-header">Trả lời từ cửa hàng</div>
                                    {repliesByReview[review.id].map(reply => (
                                        <div key={reply.id} className="reply-item">
                                            <div className="reply-header">
                                                <div className="reply-staff-info">
                                                    <span className="staff-name">{reply.staff?.fullName || 'Cửa hàng'}</span>
                                                    {reply.isOfficial && (
                                                        <span className="official-badge">✓ Trả lời chính thức</span>
                                                    )}
                                                </div>
                                                <span className="reply-date">
                                                    {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="reply-content">
                                                {reply.comment}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Show reply form for staff */}
                            {showReplyForm === review.id && currentUser && (
                                <ReviewReplyForm
                                    reviewId={review.id}
                                    onReplyPosted={() => handleReplyPosted(review.id)}
                                    onCancel={() => setShowReplyForm(null)}
                                />
                            )}

                            {/* Show reply button for staff with review.reply permission */}
                            {currentUser && hasPermission(currentUser, 'review.reply') && (
                                !showReplyForm && (
                                    <button
                                        className="btn-reply"
                                        onClick={() => setShowReplyForm(review.id)}
                                    >
                                        <MessageSquare size={14} />
                                        Trả lời
                                    </button>
                                )
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="btn btn-sm"
                    >
                        Trước
                    </button>
                    <span className="page-info">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="btn btn-sm"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
