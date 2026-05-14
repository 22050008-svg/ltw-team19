import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, InputNumber, message, Spin, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../../Context/AuthContext'; // 1. Import useAuth
import orderAdminService from '../../../Services/adminservice/OrderAdminService';
import provinceApiService from '../../../Services/provinceApiService';
import productService from '../../../Services/ProductService';

const { Option } = Select;

const CreateOrderModal = ({ open, onClose, onOrderCreated }) => {
  const [form] = Form.useForm();
  const { user } = useAuth(); // 2. Lấy thông tin admin đang đăng nhập
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  // State cho việc chọn địa chỉ
  const [provinces, setProvinces] = useState([]);
<<<<<<< HEAD
  const [wards, setWards] = useState([]);
=======
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch products when the modal is opened
  useEffect(() => {
    if (open) {
      const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
          // Tải đồng thời sản phẩm và tỉnh/thành
          const [productsRes, provincesRes] = await Promise.all([
            productService.getProducts({ limit: 1000 }),
            provinceApiService.getProvinces()
          ]);
          setAllProducts(productsRes.data.data.data || []);
          setProvinces(provincesRes.data || []);
        } catch (error) {
          message.error("Lỗi khi tải dữ liệu sản phẩm hoặc tỉnh/thành.");
        } finally {
          setLoadingDependencies(false);
        }
      };
      fetchDependencies();
    }
  }, [open]);

  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Ghép các thành phần địa chỉ lại
<<<<<<< HEAD
      const { street, ward, province } = values;
      const fullAddress = `${street}, ${ward.label}, ${province.label}`;
=======
      const { street, ward, district, province } = values;
      const fullAddress = `${street}, ${ward.label}, ${district.label}, ${province.label}`;
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9

      // Lọc ra những item có productId
      const payload = {
        ...values,
        shippingAddress: fullAddress, // Gửi địa chỉ đã được ghép
        userId: user.id, // 4. Gán userId là ID của admin
        items: values.items.filter(item => item && item.productId),
        province: undefined, // Xóa các trường không cần thiết
        district: undefined,
        ward: undefined,
        street: undefined,
      };
      await orderAdminService.createOrder(payload);
      message.success("Tạo đơn hàng thành công!");
      onOrderCreated(); // Refresh the order list
      onClose(); // Close the modal
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Tạo đơn hàng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (province) => {
<<<<<<< HEAD
    form.setFieldsValue({ ward: null });
    setWards([]);
    if (province) {
      setLoadingWards(true);
      try {
        const response = await provinceApiService.getWardsByProvince(province.value);
=======
    // Reset các lựa chọn cũ
    form.setFieldsValue({ district: null, ward: null });
    setDistricts([]);
    setWards([]);
    if (province) {
      setLoadingDistricts(true);
      try {
        const response = await provinceApiService.getDistricts(province.value);
        setDistricts(response.data.districts || []);
      } finally {
        setLoadingDistricts(false);
      }
    }
  };

  const handleDistrictChange = async (district) => {
    form.setFieldsValue({ ward: null });
    setWards([]);
    if (district) {
      setLoadingWards(true);
      try {
        const response = await provinceApiService.getWards(district.value);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        setWards(response.data.wards || []);
      } finally {
        setLoadingWards(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      title="Tạo đơn hàng mới"
      onCancel={onClose}
      onOk={handleCreateOrder}
      confirmLoading={loading}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loadingDependencies} tip="Đang tải dữ liệu...">
        <Form form={form} layout="vertical" name="create_order_form">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="recipientName" label="Tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="recipientPhone" label="Số điện thoại người nhận" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                <Input />
              </Form.Item>
            </Col>
             <Col span={12}>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue="cod" rules={[{ required: true }]}>
                <Select>
                  <Option value="cod">COD (Thanh toán khi nhận hàng)</Option>
<<<<<<< HEAD
                  <Option value="sepay">Chuyển khoản (SePay)</Option>
=======
                  <Option value="sebay">Chuyển khoản (Sebay)</Option>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <p className="ant-form-item-label">Địa chỉ giao hàng</p>
          <Row gutter={16}>
<<<<<<< HEAD
            <Col span={12}><Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true, message: 'Vui lòng chọn!' }]}><Select showSearch labelInValue loading={loadingDependencies} onChange={handleProvinceChange} placeholder="Chọn Tỉnh/Thành">{provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng chọn!' }]}><Select showSearch labelInValue loading={loadingWards} disabled={wards.length === 0} placeholder="Chọn Phường/Xã">{wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item></Col>
=======
            <Col span={8}><Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true, message: 'Vui lòng chọn!' }]}><Select showSearch labelInValue loading={loadingDependencies} onChange={handleProvinceChange} placeholder="Chọn Tỉnh/Thành">{provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng chọn!' }]}><Select showSearch labelInValue loading={loadingDistricts} onChange={handleDistrictChange} placeholder="Chọn Quận/Huyện">{districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng chọn!' }]}><Select showSearch labelInValue loading={loadingWards} placeholder="Chọn Phường/Xã">{wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item></Col>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
          </Row>
          <Form.Item 
            name="street" 
            label="Số nhà, tên đường" 
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
          >
            <Input placeholder="Ví dụ: Số 123, Ngõ 45, Đường ABC" />
          </Form.Item>
          
          <p className="ant-form-item-label">Sản phẩm</p>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true, message: 'Chọn sản phẩm' }]} style={{ width: '400px' }}>
                      <Select showSearch placeholder="Chọn sản phẩm" optionFilterProp="children" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>
                        {Array.isArray(allProducts) && allProducts.map(p => <Option key={p.id} value={p.id} label={p.name}>{`${p.name} (Tồn: ${p.stockQuantity})`}</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập SL' }]} initialValue={1}>
                      <InputNumber min={1} placeholder="Số lượng" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'priceAtPurchase']} label="Giá ghi đè (tùy chọn)">
                      <InputNumber min={0} placeholder="Giá lúc mua" style={{ width: '150px' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm sản phẩm</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippingFee" label="Phí vận chuyển" initialValue={0}>
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="voucherCode" label="Mã giảm giá (tùy chọn)"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="customerNote" label="Ghi chú của khách (tùy chọn)"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateOrderModal;