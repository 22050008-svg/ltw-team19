import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import authService from '../../Services/AuthService';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(values.email);
      // Luôn hiển thị thông báo thành công để bảo mật, theo yêu cầu API
      message.success(response.data.data.message);
    } catch (error) {
      // Về mặt lý thuyết, API sẽ không trả về lỗi ở đây, nhưng vẫn xử lý để phòng ngừa
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <Card title="Quên Mật Khẩu" style={{ width: 400 }} headStyle={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: 24 }}>
          Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
        </Text>
        <Form onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">Gửi liên kết</Button>
          </Form.Item>
          <div className="text-center"><Link to="/login">Quay lại Đăng nhập</Link></div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;