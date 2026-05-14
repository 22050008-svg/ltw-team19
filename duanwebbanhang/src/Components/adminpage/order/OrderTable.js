import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Select, Tag, message, Pagination, Space, Tooltip } from 'antd';
import { EyeOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons';
import orderAdminService from '../../../Services/adminservice/OrderAdminService';
import OrderDetailsModal from './OrderDetailsModal';
import CreateOrderModal from './CreateOrderModal'; // 1. Import modal tạo đơn hàng
import { format } from 'date-fns/format';

const { Search } = Input;
const { Option } = Select;

const statusMap = {
  awaiting_payment: { color: 'purple', text: 'Chờ thanh toán' },
  pending: { color: 'gold', text: 'Chờ xác nhận' },
  processing: { color: 'blue', text: 'Đang xử lý' },
  shipped: { color: 'cyan', text: 'Đang giao' },
  delivered: { color: 'green', text: 'Đã giao' },
  cancelled: { color: 'red', text: 'Đã hủy' },
  failed: { color: 'magenta', text: 'Thất bại' },
};

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });
  const [filters, setFilters] = useState({ search: '', status: null });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // 2. State cho modal tạo đơn hàng

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        search: filters.search,
        status: filters.status,
        page: pagination.currentPage, 
        limit: pagination.itemsPerPage 
      };
      const response = await orderAdminService.getAllOrders(params);
      
      // Xử lý cấu trúc response
      const responseData = response.data.data;
      if (responseData) {
        const ordersData = Array.isArray(responseData) ? responseData : (responseData.data || []);
        const totalItems = responseData.pagination?.total || responseData.pagination?.totalItems || 0;
        setOrders(ordersData);
        setPagination(prev => ({ ...prev, totalItems }));
      } else {
        setOrders([]);
      }
      
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setPagination(p => ({ ...p, currentPage: 1 }));
    setFilters(f => ({ ...f, [key]: value }));
  };

  const showDetailsModal = async (orderId) => {
    try {
      const response = await orderAdminService.getOrderDetails(orderId);
      // Giả sử API chi tiết cũng trả về cấu trúc tương tự
      setSelectedOrder(response.data.data); 
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không thể tải chi tiết đơn hàng.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAdminService.updateOrderStatus(orderId, newStatus);
      message.success("Cập nhật trạng thái thành công!");
      fetchOrders();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại.");
    }
  };


  const columns = [
    { title: 'Mã đơn hàng', dataIndex: 'code', key: 'code', render: code => <strong>#{code}</strong> },
    { title: 'Khách hàng', dataIndex: ['customer', 'fullName'], key: 'customer' },
    { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: date => format(new Date(date), 'dd/MM/yyyy') },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: status => statusMap[status] ? <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag> : <Tag>{status}</Tag>,
    },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => showDetailsModal(record.id)} />
          </Tooltip>
          <Select
            defaultValue={record.status}
            style={{ width: 140 }}
            onChange={(value) => handleUpdateStatus(record.id, value)}
            disabled={['delivered', 'cancelled', 'failed'].includes(record.status)}
          >
            {Object.keys(statusMap).map(s => <Option key={s} value={s}>{statusMap[s].text}</Option>)}
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm theo mã ĐH, tên, email"
          onSearch={(value) => handleFilterChange('search', value)}
          onChange={(e) => { if (!e.target.value) handleFilterChange('search', '') }}
          style={{ width: 300 }}
          allowClear
          enterButton
        />
        <Select
          placeholder="Lọc theo trạng thái"
          onChange={(value) => handleFilterChange('status', value)}
          style={{ width: 200 }}
          allowClear
        >
          {Object.keys(statusMap).map(s => <Option key={s} value={s}>{statusMap[s].text}</Option>)}
        </Select>
        <Tooltip title="Làm mới">
            <Button icon={<SyncOutlined />} onClick={fetchOrders} />
        </Tooltip>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
          Tạo đơn hàng mới
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        bordered
        pagination={false}
      />
      <Pagination
        current={pagination.currentPage}
        pageSize={pagination.itemsPerPage}
        total={pagination.totalItems}
        onChange={(page, pageSize) => setPagination(p => ({...p, currentPage: page, itemsPerPage: pageSize}))}
        style={{ marginTop: 16, textAlign: 'right' }}
        showSizeChanger
        pageSizeOptions={['10', '20', '50']}
      />
      {selectedOrder && (
        <OrderDetailsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onOrderUpdate={fetchOrders}
        />
      )}
      {/* 3. Render modal tạo đơn hàng */}
      <CreateOrderModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
};

export default OrderTable;