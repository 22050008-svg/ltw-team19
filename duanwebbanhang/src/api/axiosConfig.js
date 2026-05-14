// src/api/axiosConfig.js

import axios from 'axios';

// 1. Tạo một phiên bản Axios đã được cấu hình
const api = axios.create({
  // Cấu hình base URL mặc định cho tất cả các request
  // Backend của bạn đang chạy ở đây
  // baseURL: 'http://192.168.137.226:4000/api/v1', 
  baseURL: 'http://localhost:4321/api/v1', 
  
  headers: {
    'Content-Type': 'application/json',
     'ngrok-skip-browser-warning': 'true'
  },
});

// 2. Sử dụng Interceptors để tự động thêm token vào header
// Interceptor này sẽ chạy TRƯỚC KHI mỗi request được gửi đi
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Nếu token tồn tại, thêm nó vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ⚠️ QUAN TRỌNG: Khi gửi FormData, Axios sẽ tự động set Content-Type
    // Với boundary, nên ta phải xóa Content-Type header mặc định
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Rất quan trọng: phải return config, nếu không request sẽ bị treo
    return config;
  },
  (error) => {
    // Xử lý lỗi nếu có
    return Promise.reject(error);
  }
);

// (Tùy chọn) Xử lý lỗi tập trung với Response Interceptor
// Interceptor này sẽ chạy SAU KHI nhận được response từ server
api.interceptors.response.use(
  (response) => {
    // Bất kỳ mã trạng thái nào nằm trong phạm vi 2xx sẽ kích hoạt hàm này
    return response;
  },
  (error) => {
    // Bất kỳ mã trạng thái nào nằm ngoài phạm vi 2xx sẽ kích hoạt hàm này
    // Ví dụ: xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (error.response && error.response.status === 401) {
      // ★ FIX: Only redirect to login for PROTECTED endpoints
      // Public endpoints like /products and /categories should not require login
      const url = error.config?.url || '';
      const protectedEndpoints = ['/profile', '/cart', '/orders', '/admin'];
      
      const isProtectedRoute = protectedEndpoints.some(endpoint => 
        url.includes(endpoint)
      );
      
      if (isProtectedRoute) {
        // For protected routes, clear invalid token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        // For public routes/APIs, log warning but don't force redirect
        console.warn('[API] Received 401 on public endpoint, token may be invalid:', url);
      }
    }
    return Promise.reject(error);
  }
);


export default api;