import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Button, Form, Select, Input, InputNumber, Space, message, Spin, Row, Col, Image } from 'antd';
import { format } from 'date-fns/format';
import { EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import orderAdminService from '../../../Services/adminservice/OrderAdminService';
import productService from '../../../Services/ProductService';
import voucherService from '../../../Services/VoucherService'; // Import VoucherService

const { Title, Text } = Typography;
const { Option } = Select;

// Mapping for status colors and text
const statusMap = {
  awaiting_payment: { color: 'purple', text: 'Chờ thanh toán' },
  pending: { color: 'gold', text: 'Chờ xác nhận' },
  processing: { color: 'blue', text: 'Đang xử lý' },
  shipped: { color: 'cyan', text: 'Đang giao' },
  delivered: { color: 'green', text: 'Đã giao' },
  cancelled: { color: 'red', text: 'Đã hủy' },
  failed: { color: 'magenta', text: 'Thất bại' },
};

// A small component to render each product item in the edit form
const EditableProductItem = ({ form, name, allProducts, remove }) => {
<<<<<<< HEAD
    // Watch for changes in productVariantId and quantity for the current item
    const productVariantId = Form.useWatch(['items', name, 'productVariantId'], form);
    const quantity = Form.useWatch(['items', name, 'quantity'], form) || 1;
    
    // Find the full product details from the allProducts list
    const selectedProduct = allProducts.find(p => p.id === productVariantId);
=======
    // Watch for changes in productId and quantity for the current item
    const productId = Form.useWatch(['items', name, 'productId'], form);
    const quantity = Form.useWatch(['items', name, 'quantity'], form) || 1;
    
    // Find the full product details from the allProducts list
    const selectedProduct = allProducts.find(p => p.id === productId);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    console.log(selectedProduct);
    
    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  
    return (
        <div style={{ border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
            <Row gutter={[16, 16]} align="middle">
                {/* Product Image */}
                <Col xs={24} sm={4}>
                    <Image
                        width={80}
                        height={80}
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${selectedProduct?.imageUrl}`}
                        alt={selectedProduct?.name}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                </Col>

                {/* Product Selection and Info */}
                <Col xs={24} sm={12}>
                    <Form.Item
<<<<<<< HEAD
                        name={[name, 'productVariantId']}
=======
                        name={[name, 'productId']}
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                        rules={[{ required: true, message: 'Vui lòng chọn một sản phẩm!' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select
                            showSearch
                            placeholder="Tìm và chọn sản phẩm"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            style={{ width: '100%' }}
                        >
                            {allProducts.map(p => (
                                <Option key={p.id} value={p.id} label={p.name}>
                                    <div>
                                        <Text strong>{p.name}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}> (Tồn kho: {p.stockQuantity})</Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {selectedProduct && (
                        <div style={{ marginTop: '8px' }}>
                            <Text strong>{selectedProduct.name}</Text><br/>
                            <Tag color="cyan">{selectedProduct.sku}</Tag>
                            <Text type="secondary">Đơn giá: {formatCurrency(selectedProduct.price)}</Text>
                        </div>
                    )}
                </Col>

                {/* Quantity and Subtotal */}
                <Col xs={24} sm={8}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Form.Item
                                name={[name, 'quantity']}
                                rules={[{ required: true, message: 'Nhập số lượng!' }]}
                                initialValue={1}
                                style={{ marginBottom: 0 }}
                            >
                                <InputNumber min={1} placeholder="Số lượng" />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {selectedProduct ? formatCurrency(selectedProduct.price * quantity) : '0 ₫'}
                            </Text>
                        </Col>
                    </Row>
                </Col>
            </Row>
            {/* Delete Button */}
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => remove(name)}
                style={{ position: 'absolute', top: 8, right: 8 }}
            />
        </div>
    );
};


const OrderDetailsModal = ({ open, onClose, order, onOrderUpdate }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [allVouchers, setAllVouchers] = useState([]); // State for vouchers
// console.log(order);

  useEffect(() => {
    if (order && open) {
      form.setFieldsValue({
        status: order.status,
        customerNote: order.customerNote,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        shippingAddress: order.shippingAddress,
        voucherCode: order.voucherCode, // Set initial voucher code
<<<<<<< HEAD
        items: (order.items || []).map(item => ({
          productVariantId: item.variant?.id,
          quantity: item.quantity,
          // Store original variant data for display in edit mode
          _product: item.variant
=======
        items: order.products.map(p => ({
          productId: p.id,
          quantity: p.details.quantity,
          // Store original product data for display in edit mode
          // This is useful if a product is removed from the main product list later
          _product: p 
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        }))
      });
    }
    if (!open) {
      setIsEditing(false); // Reset edit mode when modal is closed
    }
  }, [order, open, form]);

  const handleEdit = async () => {
    setIsEditing(true);
    setLoadingProducts(true);
    try {
      const [productsRes, vouchersRes] = await Promise.all([
        productService.getProducts({ limit: 1000, fields: 'id,name,sku,price,stockQuantity,images' }),
        voucherService.getAvailableVouchers()
      ]);
      setAllProducts(productsRes.data.data.data || []);
      setAllVouchers(vouchersRes.data.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm để chỉnh sửa.");
      setIsEditing(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Don't reset fields, just revert to read-only view
    // form.resetFields();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        status: values.status,
        customerNote: values.customerNote,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        shippingAddress: values.shippingAddress,
        voucherCode: values.voucherCode, // Include voucher code in payload
        items: values.items.map(item => ({
<<<<<<< HEAD
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })).filter(item => item.productVariantId) // Filter out any empty items
=======
          productId: item.productId,
          quantity: item.quantity,
        })).filter(item => item.productId) // Filter out any empty items
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
      };

      await orderAdminService.updateOrder(order.id, payload);
      message.success("Cập nhật đơn hàng thành công!");
      setIsEditing(false);
      if (onOrderUpdate) {
        onOrderUpdate();
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Cập nhật đơn hàng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // --- Calculation logic for Edit View ---
  const formItems = Form.useWatch('items', form) || [];
  const formVoucherCode = Form.useWatch('voucherCode', form);

  const { subTotal, finalTotal, discountAmount } = useMemo(() => {
    const currentSubTotal = formItems.reduce((sum, item) => {
      const product = allProducts.find(p => p.id === item.productId);
      if (product && item.quantity > 0) {
        return sum + (product.price * item.quantity);
      }
      return sum;
    }, 0);

    const selectedVoucher = allVouchers.find(v => v.code === formVoucherCode);
    
    const calculation = voucherService.calculateDiscount(currentSubTotal, selectedVoucher);

    return { subTotal: currentSubTotal, ...calculation };
  }, [formItems, formVoucherCode, allProducts, allVouchers]);

  const productColumns = [
<<<<<<< HEAD
    {
      title: 'Sản phẩm',
      key: 'name',
      render: (_, record) => record.variant?.product?.name || record.variant?.name || 'N/A'
    },
    {
      title: 'Biến thể',
      key: 'variant',
      render: (_, record) => record.variant?.name || record.sku || 'N/A'
    },
    { title: 'Số lượng', dataIndex: ['quantity'], key: 'quantity' },
    { 
      title: 'Giá tại thời điểm mua', 
      dataIndex: ['priceAtPurchase'], 
=======
    { title: 'Sản phẩm', dataIndex: ['name'], key: 'name' },
    { title: 'SKU', dataIndex: ['sku'], key: 'sku' },
    { title: 'Số lượng', dataIndex: ['details', 'quantity'], key: 'quantity' },
    { 
      title: 'Giá tại thời điểm mua', 
      dataIndex: ['details', 'priceAtPurchase'], 
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
      key: 'price', 
      render: (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
<<<<<<< HEAD
      render: (_, record) => new Intl.NumberFormat('vi-VN').format(record.priceAtPurchase * record.quantity) + ' đ'
=======
      render: (_, record) => new Intl.NumberFormat('vi-VN').format(record.details.priceAtPurchase * record.details.quantity) + ' đ'
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    }
  ];

  const footerButtons = isEditing
    ? [
        <Button key="cancel" onClick={handleCancelEdit} icon={<CloseOutlined />}>Hủy</Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading} icon={<SaveOutlined />}>Lưu thay đổi</Button>,
      ]
    : [
        <Button key="close" onClick={onClose}>Đóng</Button>,
        ['pending', 'awaiting_payment', 'processing'].includes(order?.status) && (
          <Button key="edit" type="primary" onClick={handleEdit} icon={<EditOutlined />}>Sửa đơn hàng</Button>
        )
      ].filter(Boolean);

  if (!order) return null;

  const renderReadOnlyView = () => (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Title level={5}>Thông tin khách hàng</Title>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Họ tên">{order.customer?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.customer?.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{order.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">{order.shippingAddress}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col xs={24} md={14}>
          <Title level={5}>Danh sách sản phẩm</Title>
          <Table 
            columns={productColumns} 
<<<<<<< HEAD
            dataSource={order.items || []} 
=======
            dataSource={order.products} 
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            rowKey="id" 
            pagination={false}
            bordered
            summary={pageData => {
<<<<<<< HEAD
                const total = pageData.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
=======
                const total = pageData.reduce((sum, item) => sum + (item.details.priceAtPurchase * item.details.quantity), 0);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4} index={0}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong type="danger">{new Intl.NumberFormat('vi-VN').format(total)} đ</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
            }}
          />
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24 }}>Chi tiết đơn hàng</Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Mã đơn hàng"><strong>#{order.code}</strong></Descriptions.Item>
        <Descriptions.Item label="Trạng thái"><Tag color={statusMap[order.status]?.color}>{statusMap[order.status]?.text?.toUpperCase()}</Tag></Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú của khách">{order.customerNote || <Text type="secondary">Không có</Text>}</Descriptions.Item>
        <Descriptions.Item label="Mã giảm giá">{order.voucherCode || <Text type="secondary">Không áp dụng</Text>}</Descriptions.Item>
        <Descriptions.Item label="Tạm tính">{new Intl.NumberFormat('vi-VN').format(order.subtotal)} đ</Descriptions.Item>
        {parseFloat(order.discountAmount) > 0 && <Descriptions.Item label="Giảm giá"><Text type="success">-{new Intl.NumberFormat('vi-VN').format(order.discountAmount)} đ</Text></Descriptions.Item>}
        <Descriptions.Item label="Tổng cộng"><Text strong style={{ fontSize: 16 }}>{new Intl.NumberFormat('vi-VN').format(order.totalAmount)} đ</Text></Descriptions.Item>
      </Descriptions>
    </>
  );

  const renderEditView = () => (
    <Spin spinning={loadingProducts} tip="Đang tải danh sách sản phẩm...">
      <Form form={form} layout="vertical" autoComplete="off">
        <Title level={5}>Thông tin chung</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select>
                {Object.keys(statusMap).map(s => <Option key={s} value={s}>{statusMap[s].text}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mã giảm giá" name="voucherCode">
              <Select placeholder="Chọn mã giảm giá" allowClear>
                {allVouchers.map(v => (
                  <Option key={v.id} value={v.code} disabled={subTotal < (v.minPurchase || 0)}>
                    {v.code} - {v.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>Thông tin giao hàng</Title>
        <Row gutter={16}>
          <Col span={12}><Form.Item label="Tên người nhận" name="recipientName"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Số điện thoại" name="recipientPhone"><Input /></Form.Item></Col>
        </Row>
        <Form.Item label="Địa chỉ giao hàng" name="shippingAddress"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item label="Ghi chú của khách" name="customerNote"><Input.TextArea rows={2} /></Form.Item>

        <Title level={5} style={{ marginTop: 16 }}>Danh sách sản phẩm</Title>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '10px' }}>
              {fields.map(({ key, name }) => (
                <EditableProductItem 
                  key={key}
                  form={form}
                  name={name}
                  allProducts={allProducts}
                  remove={remove}
                />
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ quantity: 1 })} block icon={<PlusOutlined />}>
                  Thêm sản phẩm
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>

        <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Row justify="end">
                <Col span={8}>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Tạm tính">{new Intl.NumberFormat('vi-VN').format(subTotal)} đ</Descriptions.Item>
                        {discountAmount > 0 && (
                            <Descriptions.Item label="Giảm giá">
                                <Text type="success">-{new Intl.NumberFormat('vi-VN').format(discountAmount)} đ</Text>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Tổng cộng"><Text strong style={{ fontSize: 18 }}>{new Intl.NumberFormat('vi-VN').format(finalTotal)} đ</Text></Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </div>
      </Form>
    </Spin>
  );

  return (
    <Modal
      open={open}
      title={`Chi tiết đơn hàng #${order.code}`}
      onCancel={onClose}
      footer={footerButtons}
      width={900} // Increased width for better layout
    >
      {isEditing ? renderEditView() : renderReadOnlyView()}
    </Modal>
  );
};

export default OrderDetailsModal;