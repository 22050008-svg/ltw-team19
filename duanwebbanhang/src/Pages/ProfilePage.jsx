import React from 'react';
import { Layout, Typography, Tabs } from 'antd';
import { useLocation } from 'react-router-dom';
import { UserOutlined, BookOutlined, LockOutlined, HistoryOutlined } from '@ant-design/icons';
import ProfileInfo from '../Components/profilepage/ProfileInfo';
import AddressBook from '../Components/profilepage/AddressBook';
import ChangePassword from '../Components/profilepage/ChangePassword';
import OrderHistory from '../Components/profilepage/OrderHistory'; // Import component mới

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = () => {
  const location = useLocation();

  // Lấy key của tab mặc định từ state được truyền qua navigate,
  // nếu không có thì mặc định là tab '1' (Thông tin cá nhân).
  const defaultTabKey = location.state?.defaultTab || '1';

  const items = [
    {
      label: (<span><UserOutlined /> Thông tin cá nhân</span>),
      key: '1',
      children: <ProfileInfo />,
    },
    {
      label: (<span><BookOutlined /> Sổ địa chỉ</span>),
      key: '2',
      children: <AddressBook />,
    },
    {
      label: (<span><LockOutlined /> Đổi mật khẩu</span>),
      key: '3',
      children: <ChangePassword />,
    },
    {
      label: (<span><HistoryOutlined /> Lịch sử đơn hàng</span>),
      key: '4',
      children: <OrderHistory />,
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#fff' }}>
        <Title level={2}>Tài Khoản Của Tôi</Title>
        <Tabs defaultActiveKey={defaultTabKey} items={items} />
      </Content>
    </Layout>
  );
};

export default ProfilePage;