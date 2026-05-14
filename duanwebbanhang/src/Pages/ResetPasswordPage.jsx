import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import authService from '../Services/AuthService';

const { Title } = Typography;

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới.');
    }
  }, [searchParams]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, values.password);
      message.success(response.data.data.message, 3); // Hiển thị thông báo trong 3 giây
      setTimeout(() => navigate('/login'), 3000); // Chuyển hướng sau 3 giây
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage); // Hiển thị lỗi trên giao diện Result
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <Result
          status="error"
          title="Đặt Lại Mật Khẩu Thất Bại"
          subTitle={error}
          extra={[
            <Button type="primary" key="forgot" onClick={() => navigate('/forgot-password')}>
              Yêu cầu liên kết mới
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>Quay về trang chủ</Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <Card title="Đặt Lại Mật Khẩu" style={{ width: 400 }} headStyle={{ textAlign: 'center' }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu mới"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) { return Promise.resolve(); }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Lưu Mật Khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;