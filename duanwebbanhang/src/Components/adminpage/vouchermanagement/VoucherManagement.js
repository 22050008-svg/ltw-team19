import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import voucherService from '../../../Services/adminservice/VoucherService';
import productAttributeService from '../../../Services/ProductAttributeService';
import { format } from 'date-fns';
import VoucherModal from '../../../Components/adminpage/vouchermanagement/VoucherModal';

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [brandAttributeValues, setBrandAttributeValues] = useState({});

  const fetchBrandAttributeValues = async () => {
    try {
      // Lấy tất cả attributes
      const attrResponse = await productAttributeService.getAttributes();
      const attributes = attrResponse.data.data || [];
      
      // Tìm brand attribute
      const brandAttribute = attributes.find(attr =>
        ['Thương Hiệu', 'Hãng', 'Brand', 'Brands', 'Thương hiệu'].includes(attr.name)
      );
      
      if (brandAttribute) {
        // Lấy tất cả values của brand attribute
        const valuesResponse = await productAttributeService.getAttributeValues(brandAttribute.id);
        const values = valuesResponse.data.data || [];
        
        // Tạo map từ ID sang value
        const brandMap = {};
        values.forEach(v => {
          brandMap[v.id] = v.value;
        });
        setBrandAttributeValues(brandMap);
      }
    } catch (error) {
      console.error('Failed to fetch brand attribute values:', error);
    }
  };

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await voucherService.getVouchers();
      const vouchersData = response.data.data || [];
      setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
      
      // Fetch brand attribute values for display
      await fetchBrandAttributeValues();
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá')
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleDelete = async (id) => {
    try {
      await voucherService.deleteVoucher(id);
      message.success('Xóa mã giảm giá thành công');
      fetchVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xóa mã giảm giá thất bại');
    }
  };

  const handleOpenModal = (voucher = null) => {
    setEditingVoucher(voucher);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
  };

  const handleFinishModal = async (values) => {
    setSubmitLoading(true);
    try {
      if (editingVoucher) {
        await voucherService.updateVoucher(editingVoucher.id, values);
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await voucherService.createVoucher(values);
        message.success('Tạo mã giảm giá thành công');
      }
      handleCancelModal();
      fetchVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getVoucherTypeLabel = (type) => {
    const labels = {
      discount: { label: '💰 Giảm giá trực tiếp', color: 'blue' },
      freeship: { label: '🚚 Freeship', color: 'green' },
      brand: { label: '🏷️ Thương hiệu', color: 'orange' },
      category: { label: '📦 Loại hàng', color: 'purple' },
      payment_method: { label: '💳 Phương thức', color: 'cyan' },
    };
    return labels[type] || { label: type, color: 'default' };
  };

  const getVoucherTypeDetails = (record) => {
    const { voucherType, brandId, brandAttributeValueId, categoryId, paymentMethod, minOrderValue, shippingDiscount } = record;
    const brandValueId = brandAttributeValueId || brandId;

    switch (voucherType) {
      case 'freeship':
        return `Tối thiểu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minOrderValue || 0)}`;
      case 'brand':
        // Hiển thị tên brand thay vì ID
        const brandName = brandAttributeValues[brandValueId] || `ID: ${brandValueId}`;
        return `🏷️ ${brandName}`;
      case 'category':
        return `📦 Loại ID: ${categoryId || 'N/A'}`;
      case 'payment_method':
        return `💳 ${paymentMethod || 'N/A'}`;
      default:
        return '—';
    }
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Loại mã',
      dataIndex: 'voucherType',
      key: 'voucherType',
      width: 130,
      render: (type) => {
        const info = getVoucherTypeLabel(type || 'discount');
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      key: 'details',
      width: 180,
      render: (_, record) => (
        <span style={{ fontSize: 12 }}>
          {getVoucherTypeDetails(record)}
        </span>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 130,
      render: (type) => (type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định'),
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 120,
      render: (value, record) => {
        if (record.voucherType === 'freeship') {
          return `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.shippingDiscount || 0)}`;
        }
        return record.discountType === 'percentage'
          ? `${value}%`
          : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
      },
    },
    {
      title: 'Lượt sử dụng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 120,
      render: (_, record) => `${record.usageCount || 0} / ${record.usageLimit || 0}`,
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (date) => format(new Date(date), 'dd/MM/yyyy'),
    },
    {
<<<<<<< HEAD
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_, record) => {
        const expired = new Date(record.expiryDate) < new Date();
        const exhausted = record.usageCount >= record.usageLimit;
        if (expired) return <Tag color="red">Hết hạn</Tag>;
        if (exhausted) return <Tag color="orange">Hết lượt</Tag>;
        return <Tag color="green">Đang dùng</Tag>;
      },
    },
    {
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
      title: 'Hành động',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa mã giảm giá?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm mã giảm giá
        </Button>
        <Tooltip title="Tải lại">
          <Button icon={<SyncOutlined />} onClick={fetchVouchers} loading={loading} />
        </Tooltip>
      </Space>
      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="id"
        loading={loading}
        bordered
<<<<<<< HEAD
        scroll={{ x: 1300 }}
        rowClassName={(record) =>
          new Date(record.expiryDate) < new Date() ? 'opacity-50' : ''
        }
=======
        scroll={{ x: 1200 }}
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
      />
      <VoucherModal
        open={isModalVisible}
        onCancel={handleCancelModal}
        onFinish={handleFinishModal}
        loading={submitLoading}
        editingVoucher={editingVoucher}
      />
    </div>
  );
};

export default VoucherManagement;
