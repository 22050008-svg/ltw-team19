import api from '../../api/axiosConfig';

/**
 * Tạo một đơn hàng mới (Admin).
 * @param {object} orderData - Dữ liệu của đơn hàng mới.
 */
const createOrder = (orderData) => {
  return api.post('/admin/orders', orderData);
};

/**
 * Lấy danh sách tất cả đơn hàng với bộ lọc và phân trang (Admin).
 * @param {object} params - Các query params như { search, status, page, limit }
 */
const getAllOrders = (params = {}) => {
  return api.get('/admin/orders', { params });
};

/**
 * Lấy chi tiết một đơn hàng bất kỳ (Admin).
 * @param {string|number} orderId - ID của đơn hàng.
 */
const getOrderDetails = (orderId) => {
  return api.get(`/admin/orders/${orderId}`);
};

/**
 * Cập nhật trạng thái của một đơn hàng (Admin).
 * @param {string|number} orderId - ID của đơn hàng.
 * @param {string} status - Trạng thái mới.
 */
const updateOrderStatus = (orderId, status) => {
  return api.put(`/admin/orders/${orderId}/status`, { status });
};

/**
 * Cập nhật chi tiết một đơn hàng (Admin).
 * @param {string|number} orderId - ID của đơn hàng.
 * @param {object} data - Dữ liệu cập nhật (gồm thông tin người nhận, sản phẩm, etc.)
 */
const updateOrder = (orderId, data) => {
  return api.put(`/admin/orders/${orderId}`, data);
};

const orderAdminService = {
  createOrder,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  updateOrder,
};

export default orderAdminService;