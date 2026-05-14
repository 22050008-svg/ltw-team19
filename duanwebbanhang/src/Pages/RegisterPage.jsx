// src/Pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined, KeyOutlined } from '@ant-design/icons'; // Thêm icon HomeOutlined
import { Link, useNavigate } from 'react-router-dom';
import authService from '../Services/AuthService';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [verificationForm] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi service đăng ký với đầy đủ các tham số, bao gồm cả địa chỉ
      await authService.register(values.fullName, values.email, values.password, values.phone, values.address);
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      // Lưu lại email và chuyển sang bước xác thực
      setRegisteredEmail(values.email);
      setShowVerification(true);
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      // Giả sử API trả về lỗi trong error.response.data.message
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (values) => {
    setVerifying(true);
    try {
      // Gửi email đã đăng ký và mã xác thực (values.token) lên server
      await authService.verifyEmail(registeredEmail, values.token);
      message.success('Xác thực email thành công! Bây giờ bạn có thể đăng nhập.');
      navigate('/login'); // Chuyển hướng đến trang đăng nhập
    } catch (error) {
      console.error('Lỗi xác thực:', error);
      const errorMessage = error.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
      message.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // Giao diện nhập mã xác thực
  const VerificationForm = () => (
    <Card title="Xác thực Email" style={{ width: 450 }} headStyle={{ textAlign: 'center', fontSize: '20px' }}>
      <div className="text-center mb-4">
        <Text>
          Một mã xác thực đã được gửi đến email <Text strong>{registeredEmail}</Text>.
          Vui lòng nhập mã vào ô bên dưới.
        </Text>
      </div>
      <Form form={verificationForm} onFinish={onVerify} layout="vertical">
        <Form.Item
          name="token"
          label="Mã xác thực"
          rules={[{ required: true, message: 'Vui lòng nhập mã xác thực!' }]}
        >
          <Input
            prefix={<KeyOutlined />}
            placeholder="Nhập mã gồm 6 chữ số"
            size="large"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full" loading={verifying} size="large">
            Xác thực
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      {showVerification ? (
        <VerificationForm />
      ) : (
        <Card title="Tạo tài khoản mới" style={{ width: 450 }} headStyle={{ textAlign: 'center', fontSize: '20px' }}>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          {/* Input cho Họ và tên */}
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>

          {/* Input cho Email */}
          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ!' },
              { required: true, message: 'Vui lòng nhập Email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          {/* Input cho Số điện thoại */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^\d{10}$/, message: 'Số điện thoại phải có đủ 10 chữ số!' }
            ]}
          >
            <Input type="number" prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          {/* ===== MỤC MỚI ĐƯỢC THÊM VÀO ===== */}
          {/* Input cho Địa chỉ */}
          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ liên hệ!' }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ liên hệ" />
          </Form.Item>
          {/* ==================================== */}

          {/* Input cho Mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* Input để xác nhận Mật khẩu */}
          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          {/* Nút Đăng ký */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>

          {/* Link chuyển sang trang Đăng nhập */}
          <div className="text-center">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay!</Link>
          </div>
        </Form>
        </Card>
      )}
    </div>
  );
};

export default RegisterPage;