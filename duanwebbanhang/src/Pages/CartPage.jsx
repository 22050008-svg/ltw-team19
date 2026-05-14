import React, { useMemo } from 'react';
import { Card, Typography, Spin, Row, Col } from 'antd';
import { useCart } from '../Context/CartContext';
import CartItemList from '../Components/cartpage/CartItemList';
import CartSummary from '../Components/cartpage/CartSummary';
import EmptyCart from '../Components/cartpage/EmptyCart';

const { Title } = Typography;

const CartPage = () => {
  const { cartItems, loading } = useCart();
console.log(cartItems);

  // ★ THAY ĐỔI: item.price * item.CartItem.quantity → item.subtotal
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  }, [cartItems]);

  // Hiển thị spinner trong khi context đang tải giỏ hàng
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
  }

  // Nếu không loading và giỏ hàng trống, hiển thị component EmptyCart
  if (!loading && cartItems.length === 0) {
    return <EmptyCart />;
  }
  
  // Nếu có sản phẩm, hiển thị layout chính
  return (
    <Card title={<Title level={3}>Giỏ Hàng Của Bạn</Title>}>
      <Row gutter={[24, 24]}>
        {/* Cột danh sách sản phẩm */}
        <Col xs={24} lg={16}>
          <CartItemList items={cartItems} />
        </Col>
        
        {/* Cột tóm tắt đơn hàng */}
        <Col xs={24} lg={8}>
          <CartSummary total={totalPrice} />
        </Col>
      </Row>
    </Card>
  );
};

export default CartPage;