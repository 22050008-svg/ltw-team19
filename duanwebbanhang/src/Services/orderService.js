import api from '../api/axiosConfig';

const createOrder = (orderData) => {
  // Endpoint này dành cho việc tạo đơn hàng thanh toán sau (COD, QR Code, Bank Transfer)
  return api.post('/orders', orderData);
};

/**
 * Bắt đầu quá trình thanh toán online (Sebay) và nhận URL thanh toán.
 * @param {object} orderData - Dữ liệu đơn hàng.
 */
const checkout = (orderData) => {
  // Endpoint này dành cho việc khởi tạo thanh toán online và chuyển hướng
<<<<<<< HEAD
  console.log('📤 [OrderService] Sending checkout request with orderData:', JSON.stringify(orderData, null, 2));
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  return api.post('/orders/checkout', orderData);
}

const getOrderHistory = () => {
  return api.get('/orders');
};

const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};
const getStatus = (id) => {
  return api.get(`/${id}/payment-status`);
};
const cancelOrder = (id) => {
    // Thay đổi từ DELETE /orders/:id thành PUT /orders/:id/cancel để khớp với BE
    return api.put(`/orders/${id}/cancel`);
}

const orderService = {
  createOrder,
  checkout,
  getOrderHistory,
  getOrderById,
  cancelOrder,
  getStatus
};

export default orderService;