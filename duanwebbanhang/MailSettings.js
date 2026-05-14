import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Spin, message, Row, Col, InputNumber, Switch, Radio, Divider, Modal,Space } from 'antd';
import { SaveOutlined, MailOutlined } from '@ant-design/icons';
import mailService from '../../../Services/adminservice/MailService';

const MailSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);

  // Lắng nghe sự thay đổi của authType để render form tương ứng
  const authType = Form.useWatch('authType', form);

  useEffect(() => {
    const fetchMailConfig = async () => {
      try {
        const response = await mailService.getMailConfig();
        if (response.data.data) {
          form.setFieldsValue(response.data.data);
        }
      } catch (error) {
        message.error('Không thể tải cấu hình email.');
      } finally {
        setLoading(false);
      }
    };

    fetchMailConfig();
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await mailService.updateMailConfig(values);
      message.success('Cập nhật cấu hình email thành công!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại.';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (values) => {
    setTesting(true);
    try {
      const response = await mailService.sendTestMail({ toEmail: values.testEmail });
      message.success(response.data.data.message);
      setIsTestModalVisible(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gửi email test thất bại. Vui lòng kiểm tra lại cấu hình.';
      message.error(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  const SmtpFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="user" label="Tài khoản (User)" rules={[{ required: true, message: 'Vui lòng nhập tài khoản SMTP!' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="pass" label="Mật khẩu (App Password)" help="Với Gmail, đây là mật khẩu ứng dụng.">
            <Input.Password placeholder="Để trống nếu không muốn thay đổi" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const Oauth2Fields = () => (
    <>
      <Form.Item name="tenantId" label="Tenant ID" rules={[{ required: true, message: 'Vui lòng nhập Tenant ID!' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="clientId" label="Client ID" rules={[{ required: true, message: 'Vui lòng nhập Client ID!' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="clientSecret" label="Client Secret">
        <Input.Password placeholder="Để trống nếu không muốn thay đổi" />
      </Form.Item>
    </>
  );

  if (loading) {
    return <Spin tip="Đang tải cấu hình..." className="flex justify-center items-center h-full" />;
  }

  return (
    <>
      <Card title="Cấu hình gửi Email (SMTP)">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="authType" label="Phương thức xác thực" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="smtp">Tài khoản & Mật khẩu (SMTP)</Radio>
              <Radio value="oauth2">Microsoft 365 (OAuth2)</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider>Thông tin chung</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="host" label="Máy chủ (Host)" rules={[{ required: true, message: 'Vui lòng nhập host!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="port" label="Cổng (Port)" rules={[{ required: true, message: 'Vui lòng nhập port!' }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="secure" label="Bảo mật (Secure)" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromEmail" label="Email gửi từ" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fromName" label="Tên người gửi" rules={[{ required: true, message: 'Vui lòng nhập tên người gửi!' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Thông tin xác thực</Divider>

          {authType === 'smtp' && <SmtpFields />}
          {authType === 'oauth2' && <Oauth2Fields />}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Lưu cấu hình
              </Button>
              <Button icon={<MailOutlined />} onClick={() => setIsTestModalVisible(true)}>
                Gửi Email Test
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Gửi Email kiểm tra"
        open={isTestModalVisible}
        onCancel={() => setIsTestModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form onFinish={handleSendTestEmail} layout="vertical">
          <Form.Item
            name="testEmail"
            label="Gửi đến Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email người nhận!' },
              { type: 'email', message: 'Địa chỉ email không hợp lệ!' }
            ]}
          >
            <Input placeholder="nhap_email_test@example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={testing}>
              Gửi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MailSettings;