import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  AutoComplete,
  message,
  Popconfirm,
  Space,
  Card,
  Row,
  Col,
  Tag,
  Empty,
  Divider,
  Spin,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const API_BASE = 'http://localhost:4321/api/v1';

const AttributeManagement = () => {
  const { token } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isValuesModalVisible, setIsValuesModalVisible] = useState(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [isEditValueModalVisible, setIsEditValueModalVisible] = useState(false);
  const [attributeToCopy, setAttributeToCopy] = useState(null);
  const [selectedValueToEdit, setSelectedValueToEdit] = useState(null);
  const [form] = Form.useForm();
  const [valuesForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const [editValueForm] = Form.useForm();
  const [attributeValues, setAttributeValues] = useState([]);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [attributeNameSearch, setAttributeNameSearch] = useState('');
  const [attributeValueSearch, setAttributeValueSearch] = useState('');

  // Get authorization headers
  const getHeaders = () => {
    if (!token) {
      console.warn('⚠️ Token not available');
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/categories`);
        const data = response.data?.data?.data || response.data?.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch attributes
  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/attributes`);
      const data = response.data?.data?.data || response.data?.data || [];
      setAttributes(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi tải danh sách thuộc tính');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // Fetch attribute values
  const fetchAttributeValues = async (attributeId) => {
    setValuesLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/admin/attributes/${attributeId}/values`
      );
      const data = response.data?.data?.data || response.data?.data || [];
      setAttributeValues(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi tải giá trị thuộc tính');
      console.error('Error:', error);
    } finally {
      setValuesLoading(false);
    }
  };

  // Open create/edit modal
  const handleOpenModal = (attribute = null) => {
    if (attribute) {
      setSelectedAttribute(attribute);
      setAttributeNameSearch(attribute.name);
      form.setFieldsValue({
        name: attribute.name,
        categoryId: attribute.categoryId,
        displayOrder: attribute.displayOrder,
      });
    } else {
      setSelectedAttribute(null);
      setAttributeNameSearch('');
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Save attribute (create or update)
  const handleSaveAttribute = async (values) => {
    try {
      const payload = {
        name: values.name,
        categoryId: values.categoryId,
        displayOrder: values.displayOrder || 0,
      };

      if (selectedAttribute) {
        // Update
        await axios.put(
          `${API_BASE}/admin/attributes/${selectedAttribute.id}`,
          payload,
          { headers: getHeaders() }
        );
        message.success('Cập nhật thuộc tính thành công');
      } else {
        // Create
        try {
          await axios.post(`${API_BASE}/admin/attributes`, payload, {
            headers: getHeaders(),
          });
          message.success('Tạo thuộc tính thành công');
        } catch (createError) {
          // Kiểm tra nếu lỗi là "thuộc tính đã tồn tại"
          if (createError.response?.status === 400 && 
              createError.response?.data?.message?.includes('đã tồn tại')) {
            
            // Cho phép tạo với categoryId khác
            const existingAttr = attributes.find(a => a.name === payload.name);
            if (existingAttr && payload.categoryId !== existingAttr.categoryId) {
              // Thuộc tính đã tồn tại nhưng categoryId khác, thử lại
              message.info(`Thuộc tính "${payload.name}" đã tồn tại. Đang thêm cho danh mục này...`);
              await axios.post(`${API_BASE}/admin/attributes`, payload, {
                headers: getHeaders(),
              });
              message.success('Thêm thuộc tính cho danh mục thành công');
            } else {
              // Cùng categoryId, báo lỗi
              message.error(
                createError.response?.data?.message || 
                `Thuộc tính "${payload.name}" đã tồn tại cho danh mục này`
              );
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }

      setIsModalVisible(false);
      fetchAttributes();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi lưu thuộc tính';
      message.error(errorMsg);
      console.error('Error:', error);
    }
  };

  // Delete attribute
  const handleDeleteAttribute = async (id) => {
    try {
      await axios.delete(`${API_BASE}/admin/attributes/${id}`, {
        headers: getHeaders(),
      });
      message.success('Xóa thuộc tính thành công');
      fetchAttributes();
    } catch (error) {
      message.error('Lỗi xóa thuộc tính');
      console.error('Error:', error);
    }
  };

  // Get autocomplete suggestions for attribute names
  const getAttributeNameSuggestions = (searchValue) => {
    if (!searchValue.trim()) {
      return [];
    }
    
    const searchLower = searchValue.toLowerCase();
    
    // Lấy danh sách những tên thuộc tính đã tồn tại
    const existingAttributeNames = attributes.map(attr => attr.name);
    
    // Lọc những tên chứa ký tự đã nhập
    const filteredNames = existingAttributeNames.filter(name =>
      name.toLowerCase().includes(searchLower)
    );
    
    // Chuyển thành Array của AutoComplete
    return filteredNames
      .filter((name, index, self) => self.indexOf(name) === index) // Loại bỏ duplicate
      .map(name => ({
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{name}</span>
            <Tag color="blue">Có sẵn</Tag>
          </div>
        ),
        value: name,
      }))
      .slice(0, 5); // Chỉ hiển thị 5 gợi ý
  };

  // Get autocomplete suggestions for attribute values
  const getAttributeValueSuggestions = (searchValue) => {
    try {
      // Always return empty array if no search value or no selected attribute
      if (!searchValue.trim() || !selectedAttribute || !selectedAttribute.id) {
        return [];
      }
      
      const searchLower = searchValue.toLowerCase();
      
      // Lấy danh sách giá trị của thuộc tính hiện tại
      const currentValues = Array.isArray(attributeValues) 
        ? attributeValues
            .filter(v => v.attributeId === selectedAttribute.id)
            .map(v => v.value || '')
            .filter(v => v) // Loại bỏ các giá trị rỗng
        : [];
      
      // Lọc những giá trị chứa ký tự đã nhập
      const filteredValues = currentValues.filter(value =>
        value.toLowerCase().includes(searchLower)
      );
      
      // Chuyển thành Array của AutoComplete
      const suggestions = filteredValues
        .filter((value, index, self) => self.indexOf(value) === index) // Loại bỏ duplicate
        .map(value => ({
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{value}</span>
              <Tag color="green">Có sẵn</Tag>
            </div>
          ),
          value: value,
        }))
        .slice(0, 5); // Chỉ hiển thị 5 gợi ý
      
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('Error in getAttributeValueSuggestions:', error);
      return [];
    }
  };

  // Open values modal
  const handleOpenValuesModal = (attribute) => {
    setSelectedAttribute(attribute);
    setAttributeValueSearch('');
    fetchAttributeValues(attribute.id);
    setIsValuesModalVisible(true);
  };

  // Filter attributes based on selected category
  const filteredAttributes = selectedCategoryFilter === 'all'
    ? attributes
    : selectedCategoryFilter === 'common'
    ? attributes.filter(attr => !attr.categoryId)
    : attributes.filter(attr => attr.categoryId === selectedCategoryFilter);

  // Add new value
  const handleAddValue = async (values) => {
    try {
      await axios.post(
        `${API_BASE}/admin/attributes/${selectedAttribute.id}/values`,
        { value: values.value },
        { headers: getHeaders() }
      );
      message.success('Thêm giá trị thành công');
      valuesForm.resetFields();
      fetchAttributeValues(selectedAttribute.id);
    } catch (error) {
      message.error('Lỗi thêm giá trị');
      console.error('Error:', error);
    }
  };

  // Delete value
  const handleDeleteValue = async (valueId) => {
    try {
      if (!selectedAttribute || !selectedAttribute.id) {
        message.error('Thuộc tính không được chọn');
        return;
      }

      if (!valueId) {
        message.error('Giá trị không hợp lệ');
        return;
      }

      console.log('🗑️ Deleting value:', { attributeId: selectedAttribute.id, valueId });

      const response = await axios.delete(
        `${API_BASE}/admin/attributes/${selectedAttribute.id}/values/${valueId}`,
        { headers: getHeaders() }
      );

      console.log('✅ Delete response:', response);
      message.success('Xóa giá trị thành công');
      fetchAttributeValues(selectedAttribute.id);
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi xóa giá trị';
      message.error(errorMsg);
    }
  };

  // Open edit value modal
  const handleOpenEditValueModal = (value) => {
    setSelectedValueToEdit(value);
    editValueForm.setFieldsValue({
      value: value.value,
    });
    setIsEditValueModalVisible(true);
  };

  // Save edited value
  const handleSaveEditValue = async (values) => {
    try {
      if (!selectedAttribute || !selectedAttribute.id) {
        message.error('Thuộc tính không được chọn');
        return;
      }

      if (!selectedValueToEdit || !selectedValueToEdit.id) {
        message.error('Giá trị không hợp lệ');
        return;
      }

      console.log('✏️ Updating value:', { attributeId: selectedAttribute.id, valueId: selectedValueToEdit.id, newValue: values.value });

      const response = await axios.put(
        `${API_BASE}/admin/attributes/${selectedAttribute.id}/values/${selectedValueToEdit.id}`,
        { value: values.value },
        { headers: getHeaders() }
      );

      console.log('✅ Update response:', response);
      message.success('Cập nhật giá trị thành công');
      setIsEditValueModalVisible(false);
      editValueForm.resetFields();
      setSelectedValueToEdit(null);
      fetchAttributeValues(selectedAttribute.id);
    } catch (error) {
      console.error('❌ Update error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi cập nhật giá trị';
      message.error(errorMsg);
    }
  };

  // Copy attribute to another category
  const handleOpenCopyModal = async (attribute) => {
    try {
      setAttributeToCopy(attribute);
      copyForm.resetFields();
      // Fetch values for the source attribute
      await fetchAttributeValues(attribute.id);
      setIsCopyModalVisible(true);
    } catch (error) {
      message.error('Lỗi tải giá trị thuộc tính để sao chép');
      console.error('Error:', error);
    }
  };

  // Save copied attribute
  const handleSaveCopyAttribute = async (values) => {
    try {
      const payload = {
        name: attributeToCopy.name,
        categoryId: values.targetCategoryId,
        displayOrder: attributeToCopy.displayOrder,
      };

      // Create new attribute for target category
      console.log('📌 Creating attribute with payload:', payload);
      const createResponse = await axios.post(`${API_BASE}/admin/attributes`, payload, {
        headers: getHeaders(),
      });
      console.log('✅ Create response:', createResponse);
      
      const newAttributeId = createResponse.data?.data?.id;

      if (!newAttributeId) {
        message.error('Không thể tạo thuộc tính - không nhận được ID');
        console.error('No ID in response:', createResponse.data);
        return;
      }

      // Always copy all values from source attribute
      const sourceValues = attributeValues.filter(v => v.attributeId === attributeToCopy.id);
      console.log('📋 Source values to copy:', sourceValues);

      if (sourceValues.length > 0) {
        let copiedCount = 0;
        for (const sourceValue of sourceValues) {
          try {
            console.log(`📤 Copying value: ${sourceValue.value}`);
            const valueResponse = await axios.post(
              `${API_BASE}/admin/attributes/${newAttributeId}/values`,
              { value: sourceValue.value },
              { headers: getHeaders() }
            );
            console.log(`✅ Value copied:`, valueResponse);
            copiedCount++;
          } catch (valueError) {
            console.error(`❌ Failed to copy value "${sourceValue.value}":`, valueError);
            // Nếu là lỗi giá trị đã tồn tại, bỏ qua và tiếp tục
            if (!valueError.response?.data?.message?.includes('đã tồn tại')) {
              throw valueError;
            }
          }
        }
        message.success(`Sao chép thuộc tính "${attributeToCopy.name}" với ${copiedCount}/${sourceValues.length} giá trị thành công`);
      } else {
        message.success(`Sao chép thuộc tính "${attributeToCopy.name}" thành công (không có giá trị)`);
      }

      setIsCopyModalVisible(false);
      fetchAttributes();
    } catch (error) {
      console.error('❌ Copy error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi sao chép thuộc tính';
      message.error(errorMsg);
    }
  };

  // Columns for attributes table
  const attributeColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên Thuộc Tính',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 200,
      render: (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? (
          <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
            {category.name}
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '13px', padding: '4px 12px' }}>
            Tất cả Danh Mục
          </Tag>
        );
      },
    },
    {
      title: 'Số Giá Trị',
      dataIndex: 'id',
      key: 'valueCount',
      width: 100,
      render: (id, record) => {
        const count = attributeValues.filter(v => v.attributeId === id).length || 0;
        return <Tag color="cyan">{count} giá trị</Tag>;
      },
    },
    {
      title: 'Thứ Tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      render: (order) => order || 0,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 380,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => handleOpenValuesModal(record)}
            title="Quản lý giá trị"
          >
            Giá Trị
          </Button>
          <Button
            type="dashed"
            size="small"
            onClick={() => handleOpenCopyModal(record)}
            title="Sao chép thuộc tính này sang danh mục khác"
          >
            Sao Chép
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa thuộc tính này?"
            onConfirm={() => handleDeleteAttribute(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="danger" size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columns for values table
  const valueColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Giá Trị',
      dataIndex: 'value',
      key: 'value',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditValueModal(record)}
            title="Sửa giá trị"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa giá trị này?"
            onConfirm={() => handleDeleteValue(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="danger" size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Category Filter Section */}
      <Card
        title="Lọc theo Danh Mục"
        size="small"
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn danh mục để xem thuộc tính"
              style={{ width: '100%' }}
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
              options={[
                { label: 'Tất cả Danh Mục', value: 'all' },
                { label: 'Chung (Tất cả sản phẩm)', value: 'common' },
                ...categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                })),
              ]}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {selectedCategoryFilter === 'all'
                ? `Hiển thị: Tất cả ${attributes.length} thuộc tính`
                : selectedCategoryFilter === 'common'
                ? `Hiển thị: ${attributes.filter(a => !a.categoryId).length} thuộc tính chung`
                : `Hiển thị: ${attributes.filter(a => a.categoryId === selectedCategoryFilter).length} thuộc tính`}
            </span>
          </Col>
        </Row>
      </Card>

      {/* Main Attributes Management Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UnorderedListOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>Quản Lý Thuộc Tính Sản Phẩm</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Thêm Thuộc Tính
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Spin spinning={loading}>
          {filteredAttributes.length === 0 ? (
            <Empty 
              description={
                selectedCategoryFilter === 'all'
                  ? 'Chưa có thuộc tính nào'
                  : 'Danh mục này chưa có thuộc tính'
              }
            />
          ) : (
            <Table
              dataSource={filteredAttributes}
              columns={attributeColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                total: filteredAttributes.length,
                showTotal: (total) => `Tổng cộng: ${total} thuộc tính`,
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>
      </Card>

      {/* Create/Edit Attribute Modal */}
      <Modal
        title={selectedAttribute ? 'Cập Nhật Thuộc Tính' : 'Thêm Thuộc Tính Mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSaveAttribute}
        >
          <Form.Item
            label="Tên Thuộc Tính"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên thuộc tính' },
            ]}
            help="💡 Gõ để xem gợi ý từ những thuộc tính đã tồn tại. Cùng một tên có thể dùng cho nhiều danh mục khác nhau"
          >
            <AutoComplete
              placeholder="VD: Màu sắc, Kích thước, Thương hiệu..."
              options={getAttributeNameSuggestions(attributeNameSearch)}
              onSearch={setAttributeNameSearch}
              onChange={setAttributeNameSearch}
              filterOption={false}
              allowClear
              style={{ width: '100%' }}
              notFoundContent={
                attributeNameSearch ? null : 'Nhập để xem gợi ý'
              }
            />
          </Form.Item>

          <Form.Item
            label="Danh Mục (Tùy chọn)"
            name="categoryId"
            rules={[]}
          >
            <Select
              placeholder="Chọn danh mục"
              allowClear
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Thứ Tự Hiển Thị"
            name="displayOrder"
            rules={[]}
            initialValue={0}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedAttribute ? 'Cập Nhật' : 'Tạo Mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Attribute Values Modal */}
      <Modal
        title={`Quản Lý Giá Trị: "${selectedAttribute?.name || ''}"`}
        open={isValuesModalVisible}
        onCancel={() => setIsValuesModalVisible(false)}
        footer={null}
        width={700}
      >
        <Spin spinning={valuesLoading}>
          <Card
            title="Thêm Giá Trị Mới"
            size="small"
            style={{ marginBottom: '24px' }}
          >
            <Form
              layout="vertical"
              form={valuesForm}
              onFinish={handleAddValue}
            >
              <Form.Item
                label="Giá Trị"
                name="value"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                ]}
                help="💡 Gõ để xem gợi ý từ những giá trị đã tồn tại"
              >
                <AutoComplete
                  placeholder="VD: Đỏ, Xanh, M, L, XL..."
                  options={getAttributeValueSuggestions(attributeValueSearch)}
                  onSearch={setAttributeValueSearch}
                  onChange={setAttributeValueSearch}
                  filterOption={false}
                  allowClear
                  style={{ width: '100%' }}
                  notFoundContent={
                    attributeValueSearch ? null : 'Nhập để xem gợi ý'
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Thêm Giá Trị
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Divider />

          <Card
            title={`Danh Sách Giá Trị (${attributeValues.length})`}
            size="small"
          >
            {attributeValues.length === 0 ? (
              <Empty description="Chưa có giá trị nào" />
            ) : (
              <Table
                dataSource={attributeValues}
                columns={valueColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Spin>
      </Modal>

      {/* Copy Attribute Modal */}
      <Modal
        title={`Sao Chép Thuộc Tính: "${attributeToCopy?.name || ''}"`}
        open={isCopyModalVisible}
        onCancel={() => setIsCopyModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          form={copyForm}
          onFinish={handleSaveCopyAttribute}
        >
          <Form.Item
            label="Danh Mục Đích"
            name="targetCategoryId"
            rules={[
              { required: true, message: 'Vui lòng chọn danh mục đích' },
            ]}
            help={`Sao chép thuộc tính "${attributeToCopy?.name}" sang danh mục khác`}
          >
            <Select
              placeholder="Chọn danh mục để sao chép vào"
              options={categories
                .filter(cat => cat.id !== attributeToCopy?.categoryId) // Không hiện category hiện tại
                .map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
            />
          </Form.Item>

          <div
            style={{
              padding: '12px',
              border: '1px solid #52c41a',
              borderRadius: '4px',
              backgroundColor: '#f6ffed',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#52c41a', fontWeight: '500' }}>
              ✓ Tự động sao chép ({attributeValues.filter(v => v.attributeId === attributeToCopy?.id).length} giá trị)
            </span>
          </div>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsCopyModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Sao Chép
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Attribute Value Modal */}
      <Modal
        title={`Sửa Giá Trị: "${selectedValueToEdit?.value || ''}"`}
        open={isEditValueModalVisible}
        onCancel={() => setIsEditValueModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          form={editValueForm}
          onFinish={handleSaveEditValue}
        >
          <Form.Item
            label="Giá Trị Mới"
            name="value"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị' },
            ]}
          >
            <Input
              placeholder="Nhập giá trị mới"
              autoFocus
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditValueModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributeManagement;
