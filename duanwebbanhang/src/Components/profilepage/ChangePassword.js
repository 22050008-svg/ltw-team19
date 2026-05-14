import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import profileService from '../../Services/ProfileService';

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await profileService.changePassword(values);
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Thay đổi mật khẩu">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;