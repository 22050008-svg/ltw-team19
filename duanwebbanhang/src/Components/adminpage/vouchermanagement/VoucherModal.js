import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, message, Card, Row, Col, Divider, Spin, Tag, Alert, Button, Space } from 'antd';
import moment from 'moment';
import productService from '../../../Services/ProductService';
import productAttributeService from '../../../Services/ProductAttributeService';

const { Option } = Select;
const { TextArea } = Input;

const VoucherModal = ({ open, onCancel, onFinish, loading, editingVoucher }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brandValues, setBrandValues] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [voucherType, setVoucherType] = React.useState('discount');
  const discountType = Form.useWatch('discountType', form);

  // Fetch categories and brand values
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catResponse = await productService.getCategories();
        setCategories(catResponse.data.data || []);
        
        // Fetch brand attribute values
        fetchBrandAttributeValues();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const fetchBrandAttributeValues = async () => {
    try {
      setLoadingBrands(true);
      // Lấy tất cả attributes để tìm brand attribute
      const attrResponse = await productAttributeService.getAttributes();
      const attributes = attrResponse.data.data || [];
      
      // Tìm attribute có tên chứa "Thương hiệu", "Brand", "Hãng"
      const brandAttribute = attributes.find(attr =>
        ['Thương Hiệu', 'Hãng', 'Brand', 'Brands', 'Thương hiệu'].includes(attr.name)
      );
      
      if (brandAttribute) {
        // Lấy tất cả values của brand attribute
        const valuesResponse = await productAttributeService.getAttributeValues(brandAttribute.id);
        const values = valuesResponse.data.data || [];
        setBrandValues(values);
      } else {
        console.warn('Brand attribute not found');
        setBrandValues([]);
      }
    } catch (error) {
      console.error('Failed to fetch brand values:', error);
      setBrandValues([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingVoucher) {
        const vType = editingVoucher.voucherType || 'discount';
        setVoucherType(vType);
        form.setFieldsValue({
          code: editingVoucher.code,
          voucherType: vType,
          description: editingVoucher.description,
          discountType: editingVoucher.discountType,
          discountValue: editingVoucher.discountValue,
          minOrderValue: editingVoucher.minOrderValue,
          shippingDiscount: editingVoucher.shippingDiscount,
          brandId: editingVoucher.brandAttributeValueId || editingVoucher.brandId, // Use brandAttributeValueId if available
          categoryId: editingVoucher.categoryId,
          paymentMethod: editingVoucher.paymentMethod,
          usageLimit: editingVoucher.usageLimit,
          expiryDate: editingVoucher.expiryDate ? moment(editingVoucher.expiryDate) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          voucherType: 'discount',
          discountType: 'fixed_amount',
          paymentMethod: 'VNPAY'
        });
        setVoucherType('discount');
      }
    }
  }, [open, editingVoucher, form]);

  const handleVoucherTypeChange = (value) => {
    setVoucherType(value);
    // Reset related fields when type changes
    form.setFieldsValue({
      minOrderValue: undefined,
      shippingDiscount: undefined,
      brandId: undefined,
      categoryId: undefined,
      paymentMethod: 'VNPAY',
      discountValue: undefined,
      discountType: 'fixed_amount'
    });
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        // Xây dựng payload cẩn thận
        const payload = {
          code: values.code,
          voucherType: values.voucherType,
          description: values.description,
          usageLimit: values.usageLimit,
          expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        };

        // Thêm fields theo loại voucher
        if (values.voucherType === 'discount') {
          payload.discountType = values.discountType;
          payload.discountValue = values.discountValue;
        } else if (values.voucherType === 'freeship') {
          payload.minOrderValue = values.minOrderValue;
          payload.shippingDiscount = values.shippingDiscount;
        } else if (values.voucherType === 'brand') {
          payload.brandAttributeValueId = values.brandId;
          payload.discountType = values.discountType;
          payload.discountValue = values.discountValue;
        } else if (values.voucherType === 'category') {
          payload.categoryId = values.categoryId;
          payload.discountType = values.discountType;
          payload.discountValue = values.discountValue;
        } else if (values.voucherType === 'payment_method') {
          payload.paymentMethod = values.paymentMethod;
          payload.discountType = values.discountType;
          payload.discountValue = values.discountValue;
        }

        onFinish(payload);
      })
      .catch(() => {
        message.error('Vui lòng điền đầy đủ thông tin');
      });
  };

  return (
    <Modal
      title={editingVoucher ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical">
        {/* Basic Info */}
        <Card title="🎟️ Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Mã giảm giá"
                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
              >
                <Input disabled={editingVoucher} placeholder="Ví dụ: SALE50K" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="voucherType"
                label="Loại mã giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <Select onChange={handleVoucherTypeChange} disabled={editingVoucher}>
                  <Option value="discount">💰 Giảm giá trực tiếp</Option>
                  <Option value="freeship">🚚 Freeship</Option>
                  <Option value="brand">🏷️ Từ thương hiệu</Option>
                  <Option value="category">📦 Từ loại hàng</Option>
                  <Option value="payment_method">💳 Thanh toán qua ví</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả (tùy chọn)"
          >
            <TextArea rows={2} placeholder="Mô tả chi tiết về voucher..." />
          </Form.Item>
        </Card>

        {/* Discount Values */}
        {(voucherType === 'discount' || voucherType === 'brand' || voucherType === 'category' || voucherType === 'payment_method') && (
          <Card title="💵 Giá trị giảm giá" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="discountType"
                  label="Loại trị"
                  rules={[{ required: true }]}
                >
                  <Select disabled={editingVoucher}>
                    <Option value="fixed_amount">Số tiền cố định (VND)</Option>
                    <Option value="percentage">Phần trăm (%)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="discountValue"
                  label="Giá trị giảm"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (discountType === 'percentage' && (value < 1 || value > 100)) {
                          return Promise.reject(new Error('Phần trăm phải từ 1-100'));
                        }
                        if (discountType === 'fixed_amount' && value <= 0) {
                          return Promise.reject(new Error('Giá trị phải > 0'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    addonAfter={discountType === 'percentage' ? '%' : 'VND'}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/,/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        {/* Freeship Specific */}
        {voucherType === 'freeship' && (
          <Card title="🚚 Chi tiết Freeship" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="minOrderValue"
                  label="Giá trị đơn hàng tối thiểu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập' },
                    { type: 'number', min: 0, message: 'Phải >= 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    addonAfter="VND"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/,/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="shippingDiscount"
                  label="Mức freeship"
                  rules={[{ required: true, message: 'Vui lòng nhập' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    addonAfter="VND"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/,/g, '')}
                    placeholder="Ví dụ: 50000"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        {/* Brand Specific */}
        {voucherType === 'brand' && (
          <Card title="🏷️ Chọn thương hiệu" size="small" style={{ marginBottom: 16 }}>
            <Spin spinning={loadingBrands} tip="Đang tải danh sách thương hiệu...">
              <Form.Item
                name="brandId"
                label="Thương hiệu"
                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
              >
                <div style={{ display: 'none' }}>
                  <Input />
                </div>
              </Form.Item>
              
              {/* Grid display for brand values */}
              <div style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  {brandValues.map(brand => (
                    <Col xs={24} sm={12} md={6} key={brand.id}>
                      <Button
                        block
                        size="large"
                        onClick={() => form.setFieldValue('brandId', brand.id)}
                        type={form.getFieldValue('brandId') === brand.id ? 'primary' : 'default'}
                        style={{
                          padding: '12px',
                          height: 'auto',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          minHeight: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {brand.value}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            </Spin>
            {brandValues.length === 0 && !loadingBrands && (
              <Alert 
                message="Không có thương hiệu" 
                description="Vui lòng tạo thuộc tính thương hiệu với các giá trị trước tiên"
                type="warning" 
                showIcon 
              />
            )}
          </Card>
        )}

        {/* Category Specific */}
        {voucherType === 'category' && (
          <Card title="📦 Chọn loại sản phẩm" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="categoryId"
              label="Loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
            >
              <Select placeholder="Chọn loại sản phẩm">
                {Array.isArray(categories) && categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Card>
        )}

        {/* Payment Method Specific */}
        {voucherType === 'payment_method' && (
          <Card title="💳 Phương thức thanh toán" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="paymentMethod"
              label="Chọn phương thức"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
            >
              <Select>
                <Option value="VNPAY">💳 VNPAY</Option>
                <Option value="QR">📱 Mã QR</Option>
                <Option value="BANK_TRANSFER">🏦 Chuyển khoản</Option>
                <Option value="COD">📦 Thanh toán khi nhận</Option>
              </Select>
            </Form.Item>
          </Card>
        )}

        <Divider />

        {/* Usage Limits */}
        <Card title="⏰ Thời gian và giới hạn" size="small">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="usageLimit"
                label="Giới hạn lượt sử dụng"
                rules={[
                  { required: true, message: 'Vui lòng nhập' },
                  { type: 'number', min: 1, message: 'Phải > 0' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 100" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày' },
                  {
                    validator: (_, value) =>
                      value && value.isAfter(moment(), 'day')
                        ? Promise.resolve()
                        : Promise.reject(new Error('Phải là ngày trong tương lai')),
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default VoucherModal;
