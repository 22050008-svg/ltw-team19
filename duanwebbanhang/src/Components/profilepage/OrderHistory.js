import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Spin, Alert, message, Space, Popconfirm } from 'antd';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import orderService from '../../Services/orderService';
import OrderDetailModal from './OrderDetailModal'; // Import component Modal

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State để quản lý Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderHistory();
        setOrders(response.data.data || []);
      } catch (err) {
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
        // Không cần hiển thị message.error ở đây vì đã có component Alert
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {

    fetchOrderHistory();
  }, []);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedOrderId(null);
  };

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      // Gọi API để hủy đơn hàng
      await orderService.cancelOrder(orderId);
      message.success('Đã hủy đơn hàng thành công!');
      // Tải lại danh sách đơn hàng để cập nhật trạng thái
      fetchOrderHistory();
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      awaiting_payment: { color: 'purple', text: 'Chờ thanh toán' },
      pending: { color: 'gold', text: 'Chờ xử lý' },
      processing: { color: 'processing', text: 'Đang xử lý' },
      shipped: { color: 'blue', text: 'Đang giao' },
      delivered: { color: 'success', text: 'Đã giao' },
      cancelled: { color: 'error', text: 'Đã hủy' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)}>
            Xem
          </Button>
          {/* Chỉ hiển thị nút Hủy khi trạng thái là 'pending' */}
          {record.status === 'pending' && (
            <Popconfirm
              title="Xác nhận hủy đơn hàng?"
              description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
              onConfirm={() => handleCancelOrder(record.id)}
              okText="Đồng ý"
              cancelText="Không"
            >
              <Button danger icon={<CloseCircleOutlined />}>Hủy đơn</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center p-8"><Spin /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <>
      <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 'max-content' }} />
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          visible={isModalVisible}
          onCancel={handleCancelModal}
          onOrderUpdate={fetchOrderHistory} // Truyền hàm cập nhật xuống modal
        />
      )}
    </>
  );
};

export default OrderHistory;