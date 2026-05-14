import React from 'react';
import { List, Card, Typography, Image, Divider } from 'antd';

const { Title, Text } = Typography;
const OrderSummary = ({ items = [], subTotal, finalTotal, discountAmount }) => {
  return (
    // Bỏ Card và title vì đã có ở CheckoutPage
    <>
      <List
        dataSource={Array.isArray(items) ? items : []}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Image width={120} src={`${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${item.variant?.imageUrl}` || 'https://dummyimage.com/120x120/cccccc/969696?text=No+Image'} />}
              title={item.variant?.name || item.product?.name}
              description={`Số lượng: ${item.quantity}`}
            />
            <Text>{new Intl.NumberFormat('vi-VN').format(item.subtotal || 0)} đ</Text>
          </List.Item>
        )}
      />
      <Divider />
      <div className="flex justify-between mb-2">
        <Text>Tạm tính</Text>
        <Text>{new Intl.NumberFormat('vi-VN').format(subTotal)} đ</Text>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between mb-2">
          <Text className="text-green-600">Giảm giá</Text>
          <Text className="text-green-600">-{new Intl.NumberFormat('vi-VN').format(discountAmount)} đ</Text>
        </div>
      )}
      <Divider style={{ margin: '12px 0' }}/>
      <div className="flex justify-between">
        <Title level={5}>Tổng cộng</Title>
        <Title level={5}>{new Intl.NumberFormat('vi-VN').format(finalTotal)} đ</Title>
      </div>
    </>
  );
};

export default OrderSummary;