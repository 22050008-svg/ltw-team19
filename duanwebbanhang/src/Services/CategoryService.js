import api from "../api/axiosConfig";

/**
 * Lấy tất cả danh mục
 */
const getAllCategories = () => {
  return api.get(`/categories`);
};

/**
 * Lấy danh mục kèm số lượng sản phẩm
 * @param {string} type - Filter by type (appliance, electronics, other)
 */
const getCategoriesWithCount = (type = null) => {
  const params = type ? { type } : {};
  return api.get(`/categories/with-count`, { params });
};

/**
 * Lấy danh mục theo type
 * @param {string} type - appliance, electronics, other
 */
const getCategoriesByType = (type) => {
  if (!type) {
    return Promise.reject(new Error('Type is required.'));
  }
  return api.get(`/categories/type/${type}`);
};

/**
 * Lấy chi tiết danh mục
 * @param {number} categoryId - ID của danh mục
 */
const getCategoryById = (categoryId) => {
  if (!categoryId) {
    return Promise.reject(new Error('Category ID is required.'));
  }
  return api.get(`/categories/${categoryId}`);
};

/**
 * Tạo danh mục mới (Admin only)
 */
const createCategory = (data) => {
  return api.post(`/admin/categories`, data);
};

/**
 * Cập nhật danh mục (Admin only)
 */
const updateCategory = (categoryId, data) => {
  if (!categoryId) {
    return Promise.reject(new Error('Category ID is required.'));
  }
  return api.put(`/admin/categories/${categoryId}`, data);
};

/**
 * Xóa danh mục (Admin only)
 */
const deleteCategory = (categoryId) => {
  if (!categoryId) {
    return Promise.reject(new Error('Category ID is required.'));
  }
  return api.delete(`/admin/categories/${categoryId}`);
};

export default {
  getAllCategories,
  getCategoriesWithCount,
  getCategoriesByType,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
