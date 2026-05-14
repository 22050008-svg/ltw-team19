import React, { useMemo } from 'react';
import { Layout, Typography, Tabs, Alert, Spin } from 'antd';
import { useAuth } from '../Context/AuthContext';
import { getVisibleTabs } from '../utils/permissionUtils'; // Đảm bảo import từ đúng đường dẫn
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  // Lấy thông tin người dùng và trạng thái loading từ AuthContext
  // Giả sử AuthContext cung cấp một biến 'loading' để biết khi nào thông tin user đang được tải
  const { user, loading: authLoading } = useAuth();

  // Sử dụng useMemo để tính toán lại danh sách các tab chỉ khi thông tin 'user' thay đổi.
  // Điều này giúp tối ưu hóa hiệu năng, tránh việc tính toán lại không cần thiết.
  const navigate = useNavigate();
  const { '*': activeTabKeyFromUrl } = useParams(); // Lấy key từ URL, ví dụ: 'user_management'
  const visibleTabs = useMemo(() => getVisibleTabs(user), [user]);
  // ---- Xử lý các trạng thái hiển thị ----

  // 1. Trạng thái Loading: Hiển thị spinner trong khi chờ thông tin người dùng được tải
  if (authLoading) {
    return (
      <Layout>
        <Content className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
        </Content>
      </Layout>
    );
  }

  // 2. Trạng thái không có quyền: Sau khi đã tải xong (authLoading = false)
  // mà người dùng không có tab nào để xem, hiển thị thông báo.
  if (!authLoading && visibleTabs.length === 0) {
    return (
      <Layout>
        <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
          <Title level={2}>Trang Quản Trị</Title>
          <Alert
            message="Không có quyền truy cập"
            description="Tài khoản của bạn không có quyền để xem bất kỳ chức năng quản trị nào."
            type="warning"
            showIcon
          />
        </Content>
      </Layout>
    );
  }
    // Xác định key tab sẽ active: ưu tiên key từ URL, nếu không có thì lấy tab đầu tiên
  const activeKey = activeTabKeyFromUrl || visibleTabs[0]?.key;

  // Hàm được gọi khi người dùng click chuyển tab
  const handleTabChange = (key) => {
    navigate(`/admin/${key}`); // Cập nhật lại URL
  };
  // 3. Trạng thái có quyền: Hiển thị giao diện chính với các tab được phép
  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
        <Title level={2}>Trang Quản Trị</Title>
        <Tabs 
          // Luôn active tab đầu tiên trong danh sách các tab người dùng được phép xem
        //   defaultActiveKey={visibleTabs[0]?.key} 
        //   items={visibleTabs} 
        //   type="line"
        // />
          activeKey={activeKey} 
          onChange={handleTabChange}
          items={visibleTabs} 
          type="line"
        />
      </Content>
    </Layout>
  );
};

export default AdminPage;