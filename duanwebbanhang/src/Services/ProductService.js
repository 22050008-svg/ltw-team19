import api from "../api/axiosConfig";
// Thay thế bằng URL API thực tế của bạn, ví dụ: 'http://localhost:8080/api/v1'
// Đảm bảo URL này nhất quán với authService của bạn


/**
 * Lấy danh sách sản phẩm với các tùy chọn lọc và phân trang.
 * @param {object} params - Các query params để lọc và sắp xếp.
 * @param {number} [params.page] - Số trang hiện tại.
 * @param {number} [params.limit] - Số lượng sản phẩm trên mỗi trang.
 * @param {string} [params.search] - Từ khóa tìm kiếm (theo tên, sku...).
 * @param {number} [params.categoryId] - ID của danh mục để lọc.
 * @param {number} [params.brandId] - ID của nhãn hàng để lọc.
 * @param {string} [params.priceMin] - Giá tối thiểu.
 * @param {string} [params.priceMax] - Giá tối đa.
 * @param {string} [params.attributes] - Attributes filter JSON (e.g., '{"Thương Hiệu":"LG","Công Suất":"2HP"}')
 * @param {string} [params.sortBy] - Tiêu chí sắp xếp (ví dụ: 'price', '-price', 'name').
 * @returns {Promise} - Promise trả về dữ liệu từ API.
 */
const getProducts = (params = {}) => {
  // Axios sẽ tự động chuyển object `params` thành query string
  // Ví dụ: { page: 1, limit: 10 } -> "?page=1&limit=10"
  return api.get(`/products`, { params });
};

/**
 * Lấy thông tin chi tiết của một sản phẩm dựa vào ID.
 * @param {number|string} id - ID của sản phẩm cần lấy.
 * @returns {Promise} - Promise trả về dữ liệu của sản phẩm.
 */
const getProductById = (id) => {
  if (!id) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.get(`/products/${id}`);
};

/**
 * Lấy danh sách tất cả các danh mục sản phẩm.
 * @returns {Promise} - Promise trả về một mảng các danh mục.
 */
const getCategories = () => {
  return api.get(`/categories`);
};

/**
 * Lấy danh sách sản phẩm thuộc một danh mục cụ thể.
 * @param {number|string} categoryId - ID của danh mục.
 * @param {object} params - Các query params để phân trang.
 * @param {number} [params.page] - Số trang hiện tại.
 * @param {number} [params.limit] - Số lượng sản phẩm trên mỗi trang.
 * @returns {Promise} - Promise trả về dữ liệu từ API.
 */
const getProductsByCategory = (categoryId, params = {}) => {
  if (!categoryId) {
    return Promise.reject(new Error('Category ID is required.'));
  }
  return api.get(`/categories/${categoryId}/products`, { params });
};

/**
 * ★ NEW: Cập nhật thông tin sản phẩm (Admin)
 * @param {number|string} id - ID của sản phẩm cần cập nhật
 * @param {object} data - Dữ liệu cập nhật
 * @param {string} [data.name] - Tên sản phẩm
 * @param {string} [data.description] - Mô tả ngắn
 * @param {string} [data.htmlDescription] - Mô tả HTML chi tiết
 * @param {array} [data.specifications] - Thông số kỹ thuật (JSON)
 * @param {string} [data.usageGuide] - Hướng dẫn sử dụng HTML
 * @returns {Promise} - Promise trả về dữ liệu sản phẩm đã cập nhật
 */
const updateProduct = (id, data) => {
  if (!id) {
    return Promise.reject(new Error('Product ID is required.'));
  }
  return api.put(`/admin/products/${id}`, data);
};

// Gom tất cả các hàm vào một object để export
const productService = {
  getProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  updateProduct, // ★ NEW
};

export default productService