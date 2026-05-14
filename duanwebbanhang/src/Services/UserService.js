// src/Services/userService.js

import api from '../api/axiosConfig'; // Đảm bảo đường dẫn đến axiosConfig là đúng

/**
 * Lấy danh sách người dùng với các tùy chọn lọc (dành cho admin).
 * Endpoint: GET /api/v1/admin/users
 */
const getUsers = (params = {}) => {
  return api.get('/admin/users', { params });
};

/**
 * Tạo người dùng mới (dành cho admin).
 * Endpoint: POST /api/v1/admin/users
 */
const createUser = (userData) => {
  return api.post('/admin/users', userData);
};

/**
 * Xem chi tiết một người dùng (dành cho admin).
 * Endpoint: GET /api/v1/admin/users/:id
 */
const getUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

/**
 * Cập nhật thông tin người dùng (dành cho admin).
 * Endpoint: PUT /api/v1/admin/users/:id
 */
const updateUser = (id, updatedData) => {
  return api.put(`/admin/users/${id}`, updatedData);
};

/**
 * Cập nhật trạng thái hoạt động của người dùng (dành cho admin).
 * Endpoint: PUT /api/v1/admin/users/:id/status
 */
const updateUserStatus = (id, isActive) => {
  return api.put(`/admin/users/${id}/status`, { isActive });
};

// Gom tất cả các hàm vào một object để export
const userService = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
};

export default userService;