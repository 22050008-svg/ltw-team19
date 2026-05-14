import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, Row, Col } from 'antd';
import provinceApiService from '../../Services/provinceApiService';

const { Option } = Select;

const AddressModal = ({ visible, onCancel, onOk, initialData, loading }) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
<<<<<<< HEAD
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
=======
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  const [loadingWards, setLoadingWards] = useState(false);

  // Effect để lấy danh sách tỉnh/thành khi modal mở ra
  useEffect(() => {
    if (visible) {
      const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
          const response = await provinceApiService.getProvinces();
          setProvinces(response.data);
        } finally {
          setLoadingProvinces(false);
        }
      };
      fetchProvinces();
    }
  }, [visible]);

  // Effect để điền dữ liệu vào form khi ở chế độ "Sửa"
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      // Nếu có dữ liệu ban đầu, có thể cần tải lại quận/huyện và phường/xã tương ứng
      // Tuy nhiên, để đơn giản, ta yêu cầu người dùng chọn lại khi sửa
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleProvinceChange = async (province) => {
<<<<<<< HEAD
    form.setFieldsValue({ ward: null });
    setWards([]);
    if (province) {
      setLoadingWards(true);
      try {
        const response = await provinceApiService.getWardsByProvince(province.value);
        setWards(response.data.wards || []);
      } finally {
        setLoadingWards(false);
      }
=======
    form.setFieldsValue({ district: null, ward: null });
    if (province) {
      setLoadingDistricts(true);
      const response = await provinceApiService.getDistricts(province.value);
      setDistricts(response.data.districts);
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (district) => {
    form.setFieldsValue({ ward: null });
    if (district) {
      setLoadingWards(true);
      const response = await provinceApiService.getWards(district.value);
      setWards(response.data.wards);
      setLoadingWards(false);
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
    }
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const fullAddressData = {
          ...values,
          provinceName: values.province.label,
          provinceCode: values.province.value,
<<<<<<< HEAD
=======
          districtName: values.district.label,
          districtCode: values.district.value,
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
          wardName: values.ward.label,
          wardCode: values.ward.value,
        };
        // Xóa các trường thừa
        delete fullAddressData.province;
<<<<<<< HEAD
=======
        delete fullAddressData.district;
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        delete fullAddressData.ward;
        
        // Nếu đang ở chế độ sửa, thêm ID của địa chỉ vào dữ liệu gửi đi
        if (initialData && initialData.id) {
          fullAddressData.id = initialData.id;
        }

        onOk(fullAddressData);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={initialData ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="recipientName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
          <Input />
        </Form.Item>
        <Row gutter={16}>
<<<<<<< HEAD
          <Col span={12}><Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true }]}><Select showSearch labelInValue loading={loadingProvinces} onChange={handleProvinceChange} placeholder="Chọn tỉnh/thành">{Array.isArray(provinces) && provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}><Select showSearch labelInValue loading={loadingWards} disabled={wards.length === 0} placeholder="Chọn phường/xã">{Array.isArray(wards) && wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item></Col>
=======
          <Col span={8}><Form.Item name="province" label="Tỉnh/Thành" rules={[{ required: true }]}><Select showSearch labelInValue loading={loadingProvinces} onChange={handleProvinceChange}>{Array.isArray(provinces) && provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}</Select></Form.Item></Col>
          <Col span={8}><Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}><Select showSearch labelInValue loading={loadingDistricts} onChange={handleDistrictChange}>{Array.isArray(districts) && districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}</Select></Form.Item></Col>
          <Col span={8}><Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}><Select showSearch labelInValue loading={loadingWards}>{Array.isArray(wards) && wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}</Select></Form.Item></Col>
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        </Row>
        <Form.Item name="street" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddressModal;