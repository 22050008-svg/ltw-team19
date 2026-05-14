// src/Components/profilepage/ProfileInfo.js

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Avatar, Upload, Spin, Space } from 'antd';
import { UserOutlined, PhoneOutlined, LoadingOutlined, UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../Context/AuthContext';
import profileService from '../../Services/ProfileService';
import authService from '../../Services/AuthService'; // Thêm authService

const ProfileInfo = () => {
  const [form] = Form.useForm();
  const { user, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // State cho URL xem trước của ảnh
  const [fileToUpload, setFileToUpload] = useState(null); // State để giữ File object

  // Điền thông tin vào form khi có dữ liệu user
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phone: user.phone,
      });
    }
    // Reset trạng thái preview khi modal được mở lại hoặc user thay đổi
    setPreviewImage(null);
    setFileToUpload(null);
  }, [user, form]);



  // Xử lý khi submit form cập nhật thông tin (họ tên, SĐT)
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await profileService.updateProfile(values);
      updateUserContext(response.data.data);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra file và tạo ảnh preview
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }

    if (isJpgOrPng && isLt2M) {
      // Lưu file để chuẩn bị upload
      setFileToUpload(file);
      // Tạo URL tạm thời để xem trước
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewImage(reader.result);
    }

    return false; // Luôn trả về false để ngăn Ant Design tự động upload
  };

  // Xử lý khi nhấn nút "Lưu"
  const handleSaveAvatar = async () => {
    if (!fileToUpload) {
      message.error('Vui lòng chọn ảnh trước khi lưu.');
      return;
    }
    setUploading(true);
    try {
      // 1. Gửi đối tượng File đã lưu trong state lên service
      await profileService.updateAvatar(fileToUpload);

      // 2. Gọi API getMe để lấy thông tin user mới nhất (bao gồm avatarUrl)
      const userResponse = await authService.getMe();
      updateUserContext(userResponse.data.data); // 3. Cập nhật context với dữ liệu mới
      message.success('Cập nhật ảnh đại diện thành công!');
      
      // 4. Reset trạng thái sau khi thành công
      setFileToUpload(null);
      setPreviewImage(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload ảnh thất bại.';
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Xử lý khi nhấn nút "Hủy"
  const handleCancelAvatar = () => {
    setFileToUpload(null);
    setPreviewImage(null);
  };

  // Xác định URL ảnh để hiển thị: ưu tiên ảnh preview, sau đó là ảnh của user
  const avatarToShow = previewImage || (user?.avatarUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${user.avatarUrl}` : null);

  return (
    <Card title="Thông tin cá nhân">
      <div className="flex flex-col items-center mb-8">
        {avatarToShow ? (
          <Avatar size={128} src={avatarToShow} />
        ) : (
          <Avatar size={128} icon={<UserOutlined />} />
        )}
        
        {/* Hiển thị các nút điều khiển khi có ảnh mới được chọn */}
        {fileToUpload ? (
          <Space className="mt-4">
            <Button icon={<SaveOutlined />} type="primary" onClick={handleSaveAvatar} loading={uploading}>Lưu</Button>
            <Button icon={<CloseOutlined />} onClick={handleCancelAvatar} disabled={uploading}>Hủy</Button>
          </Space>
        ) : (
          <Upload name="avatar" showUploadList={false} beforeUpload={beforeUpload}>
            <div className='p-3'></div>
            <Button icon={<UploadOutlined />} className="mt-4">Chọn ảnh</Button>
          </Upload>
        )}
      </div>

      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item label="Email">
          <Input value={user?.email} disabled />
        </Form.Item>
        <Form.Item 
          name="fullName" 
          label="Họ và tên" 
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input prefix={<UserOutlined />} />
        </Form.Item>
        <Form.Item 
          name="phone" 
          label="Số điện thoại" 
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi thông tin
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfileInfo;