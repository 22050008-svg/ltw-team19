import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Spin } from 'antd';

/**
 * ProtectedRoute Component
 * Kiểm tra xem user có đăng nhập không
 * - Nếu đã đăng nhập: hiển thị component
 * - Nếu chưa đăng nhập: chuyển hướng tới trang login
 * - Nếu đang loading: hiển thị spinner
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Nếu đang kiểm tra token, hiển thị loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  // Nếu user chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị component
  return children;
};

export default ProtectedRoute;
