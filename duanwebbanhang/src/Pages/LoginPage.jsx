// src/Pages/LoginPage.jsx

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import authService from '../Services/AuthService'; // Giả sử bạn đã có file này

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAction } = useAuth();
  const [loading, setLoading] = useState(false);

  // Hàm này sẽ được gọi khi form được submit thành công
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập từ authService
      const response = await authService.login(values.email, values.password);

      if (response.data) {
        message.success('Đăng nhập thành công!');
        loginAction(response.data.data); // Cập nhật context với thông tin user và token
        navigate('/'); // Chuyển hướng về trang chủ
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error('Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false); // Dừng trạng thái loading dù thành công hay thất bại
    }
  };

  return (
    // Sử dụng flexbox của tailwind để căn giữa Card
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <Card
        title="Đăng nhập tài khoản"
        style={{ width: 400 }}
        headStyle={{ textAlign: 'center', fontSize: '20px' }}
      >
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          {/* Input cho Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          {/* Input cho Mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Mật khẩu"
            />
          </Form.Item>

          {/* Chức năng Ghi nhớ đăng nhập và Quên mật khẩu */}
          <Form.Item>
            <div className="flex justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ tôi</Checkbox>
              </Form.Item>
              <a href="/forgot-password">
                Quên mật khẩu
              </a>
            </div>
          </Form.Item>

          {/* Nút Đăng nhập */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>

          {/* Link chuyển sang trang Đăng ký */}
          <div className="text-center">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;