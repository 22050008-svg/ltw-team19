// src/Services/PosterService.js
import api from '../api/axiosConfig';

class PosterService {
    // ========== GET ENDPOINTS (PUBLIC) ==========
    
    /**
     * Lấy danh sách poster của một danh mục
     * PUBLIC endpoint - not require authentication
     */
    getPostersByCategory(categoryId, params = {}) {
        return api.get(`/posters/category/${categoryId}`, { params });
    }

    /**
     * Lấy danh sách poster của trang chủ
     * PUBLIC endpoint - not require authentication
     */
    getHomepagePosters(params = {}) {
        return api.get(`/posters/location/homepage`, { params });
    }

    /**
     * Lấy chi tiết một poster
     * PUBLIC endpoint - not require authentication
     */
    getPosterById(posterId) {
        return api.get(`/posters/${posterId}`);
    }

    // ========== CREATE ENDPOINTS (ADMIN ONLY) ==========
    
    /**
     * Upload hình ảnh poster
     * ADMIN endpoint - requires authentication
     */
    uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/admin/posters/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Tạo mới poster
     * ADMIN endpoint - requires authentication
     */
    createPoster(posterData) {
        return api.post('/admin/posters', posterData);
    }

    // ========== UPDATE ENDPOINTS (ADMIN ONLY) ==========
    
    /**
     * Cập nhật poster
     * ADMIN endpoint - requires authentication
     */
    updatePoster(posterId, posterData) {
        return api.put(`/admin/posters/${posterId}`, posterData);
    }

    /**
     * Sắp xếp lại thứ tự poster
     * ADMIN endpoint - requires authentication
     */
    reorderPosters(categoryId, posterOrder) {
        return api.put(`/admin/posters/category/${categoryId}/reorder`, {
            posterOrder
        });
    }

    // ========== DELETE ENDPOINTS (ADMIN ONLY) ==========
    
    /**
     * Xóa poster
     * ADMIN endpoint - requires authentication
     */
    deletePoster(posterId) {
        const url = `/admin/posters/${posterId}`;
        console.log('[PosterService.deletePoster] 🗑️ Making DELETE request to:', url);
        console.log('[PosterService.deletePoster] Full URL:', `${api.defaults.baseURL}${url}`);
        
        return api.delete(url)
            .then(response => {
                console.log('[PosterService.deletePoster] ✅ Success response:', response);
                return response;
            })
            .catch(error => {
                console.error('[PosterService.deletePoster] ❌ Error response:', {
                    url: url,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    message: error.response?.data?.message,
                    error: error.response?.data?.error,
                    config: error.config
                });
                throw error; // Re-throw to handle in component
            });
    }
}

export default new PosterService();
