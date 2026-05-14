import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Spin } from 'antd';
import userService from '../../../Services/UserService'; // Sửa lại đường dẫn nếu cần
import roleService from '../../../Services/adminservice/RoleService';

const { Option } = Select;

const UserModal = ({ open, onClose, onSuccess, editingUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [allRoles, setAllRoles] = useState([]);

  const isEditing = !!editingUser;
  const modalTitle = isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới";

  useEffect(() => {
    if (open) {
      const fetchRoles = async () => {
        setRolesLoading(true);
        try {
          const response = await roleService.getRoles();
          // Dữ liệu vai trò có thể nằm trong response.data.data
          setAllRoles(response.data.data || response.data || []);
        } catch (error) {
          message.error("Không thể tải danh sách vai trò.");
        } finally {
            setRolesLoading(false);
        }
      };
      fetchRoles();

      if (isEditing) {
        form.setFieldsValue({
          ...editingUser,
          roleIds: editingUser.roles ? editingUser.roles.map(role => role.id) : [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingUser, form, isEditing]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.updateUser(editingUser.id, updateData);
        message.success("Cập nhật người dùng thành công");
      } else {
        await userService.createUser(values);
        message.success("Tạo người dùng thành công");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" name="user_form" onFinish={handleFinish}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email'}, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input disabled={isEditing} />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: !isEditing, message: 'Vui lòng nhập mật khẩu' }]} help={isEditing ? "Bỏ trống nếu không muốn thay đổi mật khẩu" : ""}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="roleIds" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn vai trò"
              loading={rolesLoading}
            >
              {(allRoles || []).map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UserModal;