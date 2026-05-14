import React, { useState, useEffect } from 'react';
import { Form, Input, Card, Select, Checkbox, Row, Col, Radio, Space, Button ,Tag} from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import provinceApiService from '../../Services/provinceApiService';

const { Option } = Select;

const CheckoutForm = ({ form, savedAddresses, onSelectAddress, initialValues }) => {
  const [provinces, setProvinces] = useState([]);
<<<<<<< HEAD
  const [wards, setWards] = useState([]);
=======
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  const [loadingWards, setLoadingWards] = useState(false);
  
  // State để quyết định hiển thị form nhập địa chỉ chi tiết
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    // Tự động chọn địa chỉ mặc định khi có
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      // Tự động điền form với địa chỉ mặc định
      form.setFieldsValue({
        customerName: defaultAddress.recipientName,
        phone: defaultAddress.phone,
        // Giả sử email của user được truyền qua initialValues
        email: initialValues?.email,
        street: defaultAddress.street,
        // Điền tên, không phải object
        ward: defaultAddress.wardName,
<<<<<<< HEAD
=======
        district: defaultAddress.districtName,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        city: defaultAddress.provinceName,
      });
    } else {
        // Nếu không có địa chỉ mặc định, hiển thị form nhập mới
        setShowNewAddressForm(true);
        form.setFieldsValue(initialValues);
    }
  }, [savedAddresses, onSelectAddress, form, initialValues]);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      const response = await provinceApiService.getProvinces();
      setProvinces(response.data);
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceValue) => {
<<<<<<< HEAD
    form.setFieldsValue({ ward: null });
    setWards([]);
    if (provinceValue) {
      setLoadingWards(true);
      try {
        const response = await provinceApiService.getWardsByProvince(provinceValue.value);
        setWards(response.data.wards || []);
      } finally {
        setLoadingWards(false);
      }
=======
    form.setFieldsValue({ district: null, ward: null });
    setDistricts([]);
    setWards([]);
    if (provinceValue) {
      setLoadingDistricts(true);
      const response = await provinceApiService.getDistricts(provinceValue.value);
      setDistricts(response.data.districts);
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtValue) => {
    form.setFieldsValue({ ward: null });
    setWards([]);
    if (districtValue) {
      setLoadingWards(true);
      const response = await provinceApiService.getWards(districtValue.value);
      setWards(response.data.wards);
      setLoadingWards(false);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    }
  };
  
  // Xử lý khi người dùng chọn một địa chỉ khác
  const handleAddressRadioChange = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      setShowNewAddressForm(true);
      // Khi chọn địa chỉ mới, điền thông tin ban đầu của user
      form.setFieldsValue(initialValues);
    } else {
      setShowNewAddressForm(false);
      const selected = savedAddresses.find(addr => addr.id === addressId);
      if (selected) {
        // Khi chọn địa chỉ đã lưu, điền trực tiếp vào form
        form.setFieldsValue({
          customerName: selected.recipientName,
          phone: selected.phone,
          email: initialValues?.email,
          street: selected.street,
          ward: selected.wardName,
<<<<<<< HEAD
=======
          district: selected.districtName,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
          city: selected.provinceName,
        });
      }
    }
  };

  return (
    <Card title="Thông tin giao hàng">
      <Form form={form} layout="vertical" name="checkout_form">
        {/* Phần chọn địa chỉ */}
        {savedAddresses.length > 0 && (
          <Radio.Group onChange={handleAddressRadioChange} value={selectedAddressId} className="w-full mb-4">
            <Space direction="vertical" className="w-full">
              {savedAddresses.map(addr => (
                <Radio key={addr.id} value={addr.id} className="border p-3 rounded-md w-full">
                  <div className="font-bold">{addr.recipientName} - {addr.phone}</div>
<<<<<<< HEAD
                  <div>{`${addr.street}, ${addr.wardName}, ${addr.provinceName}`}</div>
=======
                  <div>{`${addr.street}, ${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`}</div>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                  {addr.isDefault && <Tag color="green" className="mt-1">Mặc định</Tag>}
                </Radio>
              ))}
              <Radio value="new" className="border p-3 rounded-md w-full">Sử dụng địa chỉ mới</Radio>
            </Space>
          </Radio.Group>
        )}

        {/* Các trường nhập liệu luôn được render nhưng có thể bị ẩn */}
        <div style={{ display: (showNewAddressForm || savedAddresses.length === 0) ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="customerName" label="Họ tên" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
            </Row>
            <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item>
        </div>

        {/* Form nhập địa chỉ chi tiết, chỉ hiện khi cần */}
        <div style={{ display: (showNewAddressForm || savedAddresses.length === 0) ? 'block' : 'none' }}>
          <Row gutter={16}>
<<<<<<< HEAD
            <Col span={12}>
              <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true }]}><Select placeholder="Chọn tỉnh/thành" onChange={handleProvinceChange} showSearch labelInValue>{Array.isArray(provinces) && provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}><Select placeholder="Chọn phường/xã" loading={loadingWards} disabled={wards.length === 0} showSearch labelInValue>{Array.isArray(wards) && wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item>
=======
            <Col span={8}>
              <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true }]}><Select placeholder="Chọn" onChange={handleProvinceChange} showSearch labelInValue>{Array.isArray(provinces) && provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}><Select placeholder="Chọn" onChange={handleDistrictChange} loading={loadingDistricts} disabled={!form.getFieldValue('city')} showSearch labelInValue>{Array.isArray(districts) && districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}</Select></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}><Select placeholder="Chọn" loading={loadingWards} disabled={!form.getFieldValue('district')} showSearch labelInValue>{Array.isArray(wards) && wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
            </Col>
          </Row>
          <Form.Item name="street" label="Số nhà, tên đường" rules={[{ required: true }]}><Input /></Form.Item>
          
        </div>
      </Form>
    </Card>
  );
};

export default CheckoutForm;