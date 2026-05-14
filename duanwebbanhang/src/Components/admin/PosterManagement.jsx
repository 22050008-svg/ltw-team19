// src/Components/admin/PosterManagement.jsx
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Upload, message, Table, Space, Card, Divider, Empty, Spin, Select } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, CameraOutlined } from '@ant-design/icons';
import PosterService from '../../Services/PosterService';
import CategoryService from '../../Services/CategoryService';
import RedirectUrlSelector from './RedirectUrlSelector';
import './PosterManagement.css';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4321';

const PosterManagement = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [form] = Form.useForm();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [posterLocation, setPosterLocation] = useState('homepage'); // 'homepage' or 'category'

  // Load danh sách categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await CategoryService.getAllCategories();
      const categoryList = response.data?.data || [];
      setCategories(categoryList);
      
      // Tự động chọn category đầu tiên
      if (categoryList.length > 0) {
        setSelectedCategoryId(categoryList[0].id);
      }
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Lấy danh sách poster
  const fetchPosters = async () => {
    try {
      setLoading(true);
      let response;
      if (posterLocation === 'homepage') {
        // Lấy poster cho trang chủ
        response = await PosterService.getHomepagePosters();
      } else {
        // Lấy poster cho category
        if (!selectedCategoryId) {
          setPosters([]);
          setLoading(false);
          return;
        }
        response = await PosterService.getPostersByCategory(selectedCategoryId);
      }
      
      // Extract data from response structure:
      // axios response.data = { status, message, data: { data: [...], pagination: {...} } }
      let posterList = [];
      try {
        // The backend returns: { data: rows, pagination: {...} }
        // wrapped by successResponse to: { status, message, data: { data: rows, pagination: {...} } }
        const dataWrapper = response.data?.data;
        if (dataWrapper && Array.isArray(dataWrapper.data)) {
          posterList = dataWrapper.data;
        } else if (Array.isArray(dataWrapper)) {
          // Fallback if structure is different
          posterList = dataWrapper;
        }
      } catch (e) {
        console.warn('Failed to extract data from response:', e);
      }
      
      console.log('✅ Posters fetched:', posterList.length, 'posters');
      console.log('📊 Response structure:', {
        responseData: response.data?.data,
        extractedList: posterList.slice(0, 2)
      });
      setPosters(posterList);
    } catch (error) {
      console.error('❌ Error fetching posters:', error);
      message.error('Không thể tải danh sách poster: ' + (error.response?.data?.message || error.message));
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  // Load categories lần đầu
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load poster khi location hoặc category thay đổi
  useEffect(() => {
    fetchPosters();
  }, [posterLocation, selectedCategoryId]);

  // Mở modal thêm mới
  const handleAddPoster = () => {
    setEditingPoster(null);
    setUploadedImageUrl(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal sửa
  const handleEditPoster = (poster) => {
    setEditingPoster(poster);
    setUploadedImageUrl(poster.imageUrl);
    form.setFieldsValue({
      title: poster.title,
      description: poster.description,
      displayOrder: poster.displayOrder,
      redirectUrl: poster.redirectUrl || null
    });
    setIsModalVisible(true);
  };

  // Upload hình ảnh
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const response = await PosterService.uploadImage(file);
      const imageUrl = response.data?.data?.imageUrl || response.data?.data?.image_url;
      setUploadedImageUrl(imageUrl);
      message.success('Tải lên hình ảnh thành công');
      return false; // Ngăn upload mặc định
    } catch (error) {
      message.error('Lỗi khi tải lên hình ảnh');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Lưu poster (thêm hoặc sửa)
  const handleSavePoster = async (values) => {
    if (!uploadedImageUrl) {
      message.error('Vui lòng chọn hình ảnh');
      return;
    }

    try {
      setLoading(true);
      
      const posterData = {
        categoryId: posterLocation === 'category' ? selectedCategoryId : null,
        imageUrl: uploadedImageUrl,
        title: values.title,
        description: values.description,
        displayOrder: values.displayOrder || 0,
        isActive: true,
        location: posterLocation,
        redirectUrl: values.redirectUrl || null
      };

      if (editingPoster) {
        // Cập nhật
        console.log('🔄 Updating poster:', editingPoster.id);
        await PosterService.updatePoster(editingPoster.id, posterData);
        message.success('Cập nhật poster thành công');
      } else {
        // Thêm mới
        console.log('✨ Creating new poster');
        await PosterService.createPoster(posterData);
        message.success('Tạo poster thành công');
      }

      console.log('📋 Closing modal and refreshing data...');
      setIsModalVisible(false);
      
      // Reset form
      form.resetFields();
      setUploadedImageUrl(null);
      
      // Fetch new data after save
      console.log('🔄 Calling fetchPosters after save');
      await fetchPosters();
      console.log('✅ Refresh complete');
    } catch (error) {
      console.error('❌ Error saving poster:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu poster');
    } finally {
      setLoading(false);
    }
  };

  // Xóa poster
  const handleDeletePoster = (posterId) => {
    console.log('[handleDeletePoster] 🗑️ Started with posterId:', posterId);
    
    Modal.confirm({
      title: '❌ Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa poster này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      cancelButtonProps: { type: 'default' },
      onOk() {
        console.log('[handleDeletePoster] ✓ User confirmed delete');
        return performDelete(posterId);
      },
      onCancel() {
        console.log('[handleDeletePoster] ✗ User cancelled delete');
      }
    });
  };

  // Hàm thực hiện xóa (tách riêng để dễ quản lý)
  const performDelete = async (posterId) => {
    try {
      console.log('[performDelete] 🗑️ Starting delete for posterId:', posterId);
      setLoading(true);
      
      console.log('[performDelete] 📡 Calling PosterService.deletePoster...');
      const response = await PosterService.deletePoster(posterId);
      
      console.log('[performDelete] ✅ Delete response:', response);
      message.success('✓ Xóa poster thành công');
      
      console.log('[performDelete] 🔄 Refreshing poster list...');
      await fetchPosters();
      
      console.log('[performDelete] ✅ Delete completed successfully');
      return true;
    } catch (error) {
      console.error('[performDelete] ❌ Error occurred:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      const errorMsg = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Lỗi khi xóa poster';
      
      message.error(`❌ Lỗi xóa poster: ${errorMsg}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cột bảng
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      render: (imageUrl) => {
        const fullUrl = imageUrl?.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`;
        return (
          <img 
            src={fullUrl} 
            alt="poster" 
            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
            onError={(e) => e.target.src = 'https://via.placeholder.com/80x60?text=Image+Error'}
          />
        );
      }
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      render: (text) => text ? text.substring(0, 50) + '...' : '-'
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      align: 'center',
      width: 80
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (active) => (
        <span style={{ color: active ? '#52c41a' : '#999' }}>
          {active ? '✓ Hoạt động' : '✗ Vô hiệu'}
        </span>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle" className="action-buttons">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditPoster(record)}
            className="edit-btn"
          >
            Sửa
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePoster(record.id)}
            disabled={loading}
            className="delete-btn"
            loading={loading}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const categoryName = selectedCategory?.name || 'Nội dung địa phương';
  const pageTitle = posterLocation === 'homepage' ? 'Poster Trang Chủ' : `Poster ${categoryName}`;

  return (
    <div className="poster-management">
      <Card 
        title={pageTitle}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddPoster}
            disabled={posterLocation === 'category' && !selectedCategoryId}
          >
            Thêm Poster
          </Button>
        }
      >
        {/* Chọn vị trí poster */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: 500 }}>Vị trí poster:</label>
          <Select
            style={{ width: '200px' }}
            value={posterLocation}
            onChange={(value) => {
              setPosterLocation(value);
              if (value === 'homepage') {
                setSelectedCategoryId(null);
              } else if (categories.length > 0) {
                setSelectedCategoryId(categories[0].id);
              }
            }}
            options={[
              { label: '📄 Trang Chủ', value: 'homepage' },
              { label: '📁 Danh Mục Sản Phẩm', value: 'category' }
            ]}
          />
        </div>

        {/* Chọn danh mục (chỉ hiển thị khi chọn category) */}
        {posterLocation === 'category' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 500 }}>Chọn danh mục:</label>
            <Select
              style={{ width: '300px' }}
              placeholder="Chọn danh mục sản phẩm"
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              loading={categoriesLoading}
              options={categories.map(cat => ({
                label: cat.name,
                value: cat.id
              }))}
            />
          </div>
        )}

        <Spin spinning={loading}>
          {posters.length === 0 ? (
            <Empty 
              description={selectedCategoryId ? "Chưa có poster nào" : "Vui lòng chọn danh mục"} 
              style={{ marginTop: '50px' }}
            />
          ) : (
            <Table 
              columns={columns}
              dataSource={posters}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} poster`
              }}
            />
          )}
        </Spin>
      </Card>

      {/* Modal thêm/sửa poster */}
      <Modal
        title={editingPoster ? `Sửa Poster${posterLocation === 'category' ? ` - ${categoryName}` : ' Trang Chủ'}` : `Thêm Poster Mới${posterLocation === 'category' ? ` - ${categoryName}` : ' Trang Chủ'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Spin spinning={uploading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSavePoster}
          >
            {/* Hiển thị vị trí poster */}
            <Form.Item label="Vị trí">
              <Input 
                value={posterLocation === 'homepage' ? 'Trang Chủ' : 'Danh Mục Sản Phẩm'} 
                disabled 
                style={{ color: '#000' }}
              />
            </Form.Item>

            {/* Hiển thị danh mục được chọn (chỉ khi là category) */}
            {posterLocation === 'category' && (
              <Form.Item label="Danh mục">
                <Input 
                  value={categoryName} 
                  disabled 
                  style={{ color: '#000' }}
                />
              </Form.Item>
            )}

            {/* Upload hình ảnh */}
            <Form.Item label="Hình ảnh poster">
              <div style={{ marginBottom: '16px' }}>
                {uploadedImageUrl && (
                  <div style={{ marginBottom: '16px' }}>
                    {(() => {
                      const fullUrl = uploadedImageUrl?.startsWith('http') ? uploadedImageUrl : `${BACKEND_URL}${uploadedImageUrl}`;
                      return (
                        <img 
                          src={fullUrl} 
                          alt="preview" 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'}
                        />
                      );
                    })()}
                  </div>
                )}
                <Upload
                  name="image"
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={handleImageUpload}
                  disabled={uploading}
                >
                  <Button 
                    icon={<CameraOutlined />}
                    loading={uploading}
                  >
                    {uploadedImageUrl ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
                  </Button>
                </Upload>
              </div>
            </Form.Item>

            {/* Tiêu đề */}
            <Form.Item 
              name="title" 
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Tiêu đề poster" />
            </Form.Item>

            {/* Mô tả */}
            <Form.Item 
              name="description" 
              label="Mô tả"
            >
              <Input.TextArea 
                rows={3}
                placeholder="Mô tả poster (tùy chọn)"
              />
            </Form.Item>

            {/* Link chuyển hướng */}
            <Form.Item 
              name="redirectUrl" 
              label="Link chuyển hướng (tùy chọn)"
            >
              <RedirectUrlSelector 
                value={form.getFieldValue('redirectUrl')}
                onChange={(url) => form.setFieldValue('redirectUrl', url)}
              />
            </Form.Item>

            {/* Thứ tự hiển thị */}
            <Form.Item 
              name="displayOrder" 
              label="Thứ tự hiển thị"
              initialValue={0}
            >
              <Input type="number" min={0} placeholder="0" />
            </Form.Item>

            <Divider />

            {/* Nút hành động */}
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                {editingPoster ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default PosterManagement;
