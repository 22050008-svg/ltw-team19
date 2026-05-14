import React, { useMemo } from 'react';
import { Card, Typography, Spin, Row, Col, Affix } from 'antd';
import { useCart } from '../../Context/CartContext';
import CartItemList from '../cartpage/CartItemList';
import CartSummary from '../cartpage/CartSummary';
import EmptyCart from '../cartpage/EmptyCart';

const { Title } = Typography;

const SideCart = () => {
  const { cartItems, loading } = useCart();

  // ★ THAY ĐỔI: item.CartItem.quantity → item.quantity, item.price → item.subtotal
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      // Safe check để tránh undefined error
      if (!item) return total;
      return total + (item.subtotal || 0);
    }, 0);
  }, [cartItems]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!loading && cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Affix offsetTop={24}>
      <Card title={<Title level={4}>Giỏ Hàng</Title>} variant="borderless" style={{ maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
        <CartItemList items={cartItems} />
        <div style={{ marginTop: '16px' }}>
          <CartSummary total={totalPrice} />
        </div>
      </Card>
    </Affix>
  );
};

export default SideCart;