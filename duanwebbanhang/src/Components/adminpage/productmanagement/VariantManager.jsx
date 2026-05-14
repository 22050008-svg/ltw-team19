import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Card,
  Space,
  Popconfirm,
  Drawer,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import './VariantManager.css';

const { TextArea } = Input;

/**
 * VariantManager Component
 * Quản lý các variant (biến thể) của sản phẩm với các thuộc tính gắn liền
 */
const VariantManager = ({ 
  productId, 
  selectedAttributes = {}, 
  price, 
  costPrice, 
  sku,
  existingVariants = [],
  onVariantsChange,
  isEditing = false,
}) => {
  const [form] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [variants, setVariants] = useState(existingVariants || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVariantForView, setSelectedVariantForView] = useState(null);

  // Khi selectedAttributes thay đổi, tạo variant mặc định
  useEffect(() => {
    if (!isEditing && Object.keys(selectedAttributes).length > 0 && variants.length === 0) {
      // Auto-create first variant with selected attributes
      const defaultVariant = {
        id: Date.now(),
        sku: sku || `SKU-${Date.now()}`,
        price: price || 0,
        costPrice: costPrice || 0,
        stockQuantity: 0,
        attributes: { ...selectedAttributes },
      };
      setVariants([defaultVariant]);
      onVariantsChange([defaultVariant]);
    }
  }, [selectedAttributes, isEditing]);

  // Gọi callback khi variants thay đổi
  const updateVariants = (newVariants) => {
    setVariants(newVariants);
    if (onVariantsChange) {
      onVariantsChange(newVariants);
    }
  };

  // Mở modal thêm/sửa variant
  const handleAddVariant = () => {
    setEditingVariantIndex(null);
    variantForm.resetFields();
    // Gán giá trị mặc định
    variantForm.setFieldsValue({
      price: price || 0,
      costPrice: costPrice || 0,
      stockQuantity: 0,
      sku: sku || '',
      attributes: Object.entries(selectedAttributes)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', '),
    });
    setIsModalVisible(true);
  };

  // Mở modal sửa variant
  const handleEditVariant = (index) => {
    const variant = variants[index];
    setEditingVariantIndex(index);
    variantForm.setFieldsValue({
      sku: variant.sku,
      price: variant.price,
      costPrice: variant.costPrice,
      stockQuantity: variant.stockQuantity,
      attributes: Object.entries(variant.attributes || {})
        .map(([key, val]) => `${key}: ${val}`)
        .join(', '),
    });
    setIsModalVisible(true);
  };

  // Lưu variant (thêm mới hoặc cập nhật)
  const handleSaveVariant = async (values) => {
    try {
      // Validation: costPrice không được lớn hơn price
      if (values.costPrice && values.price && values.costPrice > values.price) {
        message.error('Giá vốn không thể lớn hơn giá bán');
        return;
      }

      const newVariant = {
        id: editingVariantIndex !== null ? variants[editingVariantIndex].id : Date.now(),
        sku: values.sku,
        price: values.price,
        costPrice: values.costPrice,
        stockQuantity: values.stockQuantity,
        attributes: { ...selectedAttributes },
      };

      let newVariants;
      if (editingVariantIndex !== null) {
        // Cập nhật
        newVariants = [...variants];
        newVariants[editingVariantIndex] = newVariant;
        message.success('Cập nhật variant thành công');
      } else {
        // Thêm mới
        newVariants = [...variants, newVariant];
        message.success('Thêm variant thành công');
      }

      updateVariants(newVariants);
      setIsModalVisible(false);
      variantForm.resetFields();
    } catch (error) {
      console.error('Error saving variant:', error);
      message.error('Não thể lưu variant');
    }
  };

  // Xóa variant
  const handleDeleteVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    updateVariants(newVariants);
    message.success('Đã xóa variant');
  };

  // Xem chi tiết variant
  const handleViewVariant = (variant) => {
    setSelectedVariantForView(variant);
    setDrawerVisible(true);
  };

  // Columns cho bảng variants
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (text) => <span className="sku-text">{text}</span>,
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes) => (
        <div className="attributes-display">
          {Object.entries(attributes || {})
            .map(([key, val]) => {
              // Handle case where val might be an object instead of string
              const displayValue = typeof val === 'string' ? val : (val?.value || JSON.stringify(val));
              return (
                <span key={key} className="attr-badge">
                  {key}: {displayValue}
                </span>
              );
            })}
        </div>
      ),
    },
    {
      title: 'Giá Bán (VND)',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price) => {
        const formatted = price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return <span className="price-text">{formatted}</span>;
      },
    },
    {
      title: 'Giá Vốn (VND)',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 130,
      render: (costPrice) => {
        if (!costPrice) return '-';
        const formatted = costPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return <span>{formatted}</span>;
      },
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 90,
      render: (stock) => <span className="stock-text">{stock}</span>,
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 120,
      render: (_, record, index) => (
        <Space size="middle">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewVariant(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditVariant(index)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa variant"
            description="Bạn có chắc muốn xóa variant này?"
            onConfirm={() => handleDeleteVariant(index)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!productId && variants.length === 0 && Object.keys(selectedAttributes).length === 0) {
    return (
      <Card
        title="Quản Lý Biến Thể (Variants)"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVariant}
            disabled={Object.keys(selectedAttributes).length === 0}
          >
            Thêm Variant
          </Button>
        }
        style={{ marginTop: '16px' }}
      >
        <Empty description="Chọn thuộc tính sản phẩm ở trên để tạo variants" />
      </Card>
    );
  }

  return (
    <Card
      title="Quản Lý Biến Thể (Variants)"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVariant}
          disabled={Object.keys(selectedAttributes).length === 0}
        >
          Thêm Variant
        </Button>
      }
      style={{ marginTop: '16px' }}
      className="variant-manager-card"
    >
      {variants.length > 0 ? (
        <Table
          columns={columns}
          dataSource={variants.map((v, i) => ({ ...v, key: v.id }))}
          pagination={false}
          size="small"
          scroll={{ x: 1000 }}
        />
      ) : (
        <Empty description="Chưa có variant nào. Nhấn Thêm Variant để bắt đầu" />
      )}

      {/* Modal Thêm/Chỉnh sửa Variant */}
      <Modal
        title={editingVariantIndex !== null ? 'Chỉnh sửa Variant' : 'Thêm Variant'}
        open={isModalVisible}
        onOk={() => variantForm.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVariantIndex(null);
          variantForm.resetFields();
        }}
        width={700}
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleSaveVariant}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="Mã SKU"
                rules={[
                  { required: true, message: 'Vui lòng nhập SKU' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      // Check unique SKU
                      const isDuplicate = variants.some(
                        (v, i) => v.sku === value && i !== editingVariantIndex
                      );
                      if (isDuplicate) {
                        return Promise.reject(new Error('SKU này đã tồn tại'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="VD: RF-SAM-300L-SILVER" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá Bán (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="costPrice"
                label="Giá Vốn (VND)"
                help="Để trống nếu không cần"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stockQuantity"
                label="Số Lượng Tồn Kho"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="attributes"
            label="Thuộc Tính"
            help="Hiển thị ở chế độ chỉ xem (dựa trên danh mục)"
          >
            <TextArea rows={3} disabled placeholder="Thuộc tính được xác định bởi danh mục" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Variant */}
      <Drawer
        title="Chi Tiết Variant"
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedVariantForView(null);
        }}
        open={drawerVisible}
      >
        {selectedVariantForView && (
          <div className="variant-detail">
            <div className="detail-item">
              <strong>SKU:</strong>
              <span>{selectedVariantForView.sku}</span>
            </div>
            <div className="detail-item">
              <strong>Giá Bán:</strong>
              <span>
                {selectedVariantForView.price
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
              </span>
            </div>
            <div className="detail-item">
              <strong>Giá Vốn:</strong>
              <span>
                {selectedVariantForView.costPrice
                  ? `${selectedVariantForView.costPrice
                      ?.toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND`
                  : '-'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Tồn Kho:</strong>
              <span>{selectedVariantForView.stockQuantity}</span>
            </div>
            <div className="detail-item">
              <strong>Thuộc Tính:</strong>
              <div className="attributes-detail">
                {Object.entries(selectedVariantForView.attributes || {}).map(
                  ([key, value]) => {
                    // Handle case where value might be an object instead of string
                    const displayValue = typeof value === 'string' ? value : (value?.value || JSON.stringify(value));
                    return (
                      <div key={key} className="attr-detail">
                        <span className="attr-name">{key}:</span>
                        <span className="attr-value">{displayValue}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default VariantManager;
