import React from 'react';
import { Empty, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Empty description={<Title level={4}>Giỏ hàng của bạn đang trống</Title>}>
      {/* Sử dụng onClick để đảm bảo toàn bộ nút có thể click được */}
      <Button type="primary" onClick={() => navigate('/products')}>
        Tiếp tục mua sắm
      </Button>
    </Empty>
  );
};

export default EmptyCart;