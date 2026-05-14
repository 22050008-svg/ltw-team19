import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Spin, message } from 'antd';
import { hasAdminPermission } from '../../utils/permissionUtils';

const AdminRoute = ({ children }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = React.useState(true);

  // Thêm một hiệu ứng để kiểm tra quyền sau khi thông tin user được tải
  React.useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);
  
  if (loading) {
    // Hiển thị spinner trong khi chờ thông tin user
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  // Kiểm tra xem người dùng có tồn tại và có quyền admin (từ RBAC system)
  // Admin có thể là:
  // 1. Super Admin (role: 'super-admin')
  // 2. Bất kỳ user nào có ít nhất một quyền admin
  const isAdmin = hasAdminPermission(user);
  
  if (!token || !isAdmin) {
    // Nếu không phải admin, thông báo và điều hướng về trang chủ
    message.error("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  // Nếu là admin (có quyền), cho phép truy cập
  return children;
};

export default AdminRoute;