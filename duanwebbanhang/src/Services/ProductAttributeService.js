import api from "../api/axiosConfig";

/**
 * Lấy tất cả thuộc tính sản phẩm
 * @returns {Promise} - Promise trả về danh sách tất cả thuộc tính
 */
const getAttributes = () => {
  return api.get(`/admin/attributes`);
};

/**
 * Lấy danh sách thuộc tính của sản phẩm theo danh mục
 * @param {number} categoryId - ID của danh mục
 * @returns {Promise} - Promise trả về danh sách thuộc tính
 */
const getAttributesByCategory = (categoryId) => {
  if (!categoryId) {
    return Promise.reject(new Error('Category ID is required.'));
  }
  return api.get(`/admin/attributes`, { params: { categoryId } });
};

/**
 * Lấy chi tiết một thuộc tính cụ thể
 * @param {number} attributeId - ID của thuộc tính
 * @returns {Promise} - Promise trả về chi tiết thuộc tính
 */
const getAttributeById = (attributeId) => {
  if (!attributeId) {
    return Promise.reject(new Error('Attribute ID is required.'));
  }
  return api.get(`/admin/attributes/${attributeId}`);
};

/**
 * Lấy tất cả giá trị của một thuộc tính
 * @param {number} attributeId - ID của thuộc tính
 * @returns {Promise} - Promise trả về danh sách giá trị
 */
const getAttributeValues = (attributeId) => {
  if (!attributeId) {
    return Promise.reject(new Error('Attribute ID is required.'));
  }
  return api.get(`/admin/attributes/${attributeId}/values`);
};

export default {
  getAttributes,
  getAttributesByCategory,
  getAttributeById,
  getAttributeValues,
};
