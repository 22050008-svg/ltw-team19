import React from 'react';
import { Card, Typography, Statistic, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CartSummary = ({ total }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <Title level={4}>Tóm tắt đơn hàng</Title>
      <Statistic
        title="Tổng cộng"
        value={total}
        formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`}
      />
      {/* Sử dụng onClick để đảm bảo toàn bộ nút có thể click được */}
      <Button type="primary" size="large" block style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>
        Tiến hành thanh toán
      </Button>
    </Card>
  );
};

export default CartSummary;