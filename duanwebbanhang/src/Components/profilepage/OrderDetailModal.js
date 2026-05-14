import React, { useState, useEffect } from 'react';
import { Modal, Spin, Alert, Descriptions, List, Typography, Image, Divider, Button, Popconfirm, message } from 'antd';
import orderService from '../../Services/orderService';

const { Text } = Typography;

const OrderDetailModal = ({ orderId, visible, onCancel, onOrderUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);


  useEffect(() => {
    if (visible && orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);
        setOrder(null);
        try {
          const response = await orderService.getOrderById(orderId);
          setOrder(response.data.data);
        } catch (err) {
          setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [orderId, visible]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      message.success('Đã hủy đơn hàng thành công!');
      onCancel(); // Đóng modal
      if (onOrderUpdate) {
        onOrderUpdate(); // Cập nhật lại danh sách đơn hàng ở component cha
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy đơn hàng thất bại.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Modal
      title={`Chi tiết đơn hàng #${orderId}`}
      visible={visible}
      onCancel={onCancel}
      footer={[
        // Chỉ hiển thị nút Hủy khi đơn hàng ở trạng thái 'pending'
        order && order.status === 'pending' && (
          <Popconfirm
            key="cancel"
            title="Xác nhận hủy đơn hàng?"
            description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
            onConfirm={handleCancelOrder}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Button danger loading={cancelling}>Hủy đơn hàng</Button>
          </Popconfirm>
        ),
        <Button key="back" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {loading && <div className="text-center p-8"><Spin /></div>}
      {error && <Alert message="Lỗi" description={error} type="error" showIcon />}
      {order && (
        <>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Người nhận">{order.recipientName}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{order.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">{order.shippingAddress}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{order.customerNote || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="Mã giảm giá">{order.voucherCode || 'Không áp dụng'}</Descriptions.Item>
            <Descriptions.Item label="Tạm tính">{formatPrice(order.subtotal)}</Descriptions.Item>
            {parseFloat(order.discountAmount) > 0 && (
              <Descriptions.Item label="Giảm giá">
                <Text type="success">-{formatPrice(order.discountAmount)}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng cộng"><Text strong>{formatPrice(order.totalAmount)}</Text></Descriptions.Item>
          </Descriptions>
          <Divider>Sản phẩm trong đơn hàng</Divider>
          <List
<<<<<<< HEAD
            dataSource={Array.isArray(order.items) ? order.items : []}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Image width={60} src={`${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${item.variant?.imageUrl}` || 'https://dummyimage.com/60x60/cccccc/969696?text=No+Image'} />}
                  title={item.variant?.product?.name || item.variant?.name || 'Sản phẩm không xác định'}
                  description={`Biến thể: ${item.variant?.name || item.sku || 'N/A'} — Giá lúc mua: ${formatPrice(item.priceAtPurchase)}`}
                />
                <div className="text-right">
                  <div>Số lượng: {item.quantity}</div>
                  <Text strong>Thành tiền: {formatPrice(item.priceAtPurchase * item.quantity)}</Text>
=======
            dataSource={Array.isArray(order.products) ? order.products : []}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Image width={60} src={`${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${item.imageUrl}` || 'https://dummyimage.com/60x60/cccccc/969696?text=No+Image'} />}
                  title={item.name}
                  description={`Giá lúc mua: ${formatPrice(item.details.priceAtPurchase)}`}
                />
                <div className="text-right">
                  <div>Số lượng: {item.details.quantity}</div>
                  <Text strong>Thành tiền: {formatPrice(item.details.priceAtPurchase * item.details.quantity)}</Text>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
};

export default OrderDetailModal;