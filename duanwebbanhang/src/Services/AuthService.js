// src/Services/authService.js

import api from "../api/axiosConfig";



// Cập nhật hàm register để gửi thêm trường 'address'
const register = (fullName, email, password, phone, address) => {
  return api.post(`/auth/register`, {
    fullName,
    email,
    password,
    phone,
    address, // Thêm địa chỉ vào request body
  });
};

const login = (email, password) => {
  return api.post(`auth/login`, {
    email,
    password,
  });
};

const getMe = () => {
  return api.get(`auth/me`);
};

const verifyEmail = (email, verificationCode) => {
  // Post dữ liệu lên server với định dạng { email, verificationCode }
  return api.post(`/auth/verify-email`, { email, verificationCode });
};

const forgotPassword = (email) => {
  // Gửi yêu cầu đặt lại mật khẩu
  return api.post('/auth/forgot-password', { email });
};

const resetPassword = (token, password) => {
  // Gửi token và mật khẩu mới để hoàn tất
  return api.post('/auth/reset-password', { token, password });
};

const authService = {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};

export default authService;