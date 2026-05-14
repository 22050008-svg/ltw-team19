import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Typography, message, Spin } from 'antd';
import roleService from '../../../Services/adminservice/RoleService'; // Để tạo/cập nhật
import permissionService from '../../../Services/adminservice/PermissionService';

const { Title } = Typography;

const RoleModal = ({ open, onClose, onSuccess, editingRole }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]); // State để lưu trữ tất cả quyền

  const isEditing = !!editingRole;
  const modalTitle = isEditing ? "Phân quyền & Chỉnh sửa vai trò" : "Thêm vai trò mới";

  // useEffect để lấy danh sách tất cả các quyền khi modal được mở lần đầu
  useEffect(() => {
    if (open) {
      const fetchPermissions = async () => {
        try {
          const response = await permissionService.getPermissions();
          const permData = response.data.data || [];
          setAllPermissions(Array.isArray(permData) ? permData : []);
        } catch (error) {
          message.error("Không thể tải danh sách quyền");
        }
      };
      
      // Chỉ gọi API nếu chưa có dữ liệu
      if (allPermissions.length === 0) {
        fetchPermissions();
      }
    }
  }, [open, allPermissions.length]);

  // Nhóm các quyền lại theo thuộc tính 'group'
  const groupedPermissions = useMemo(() => {
    if (allPermissions.length === 0) return {};
    return allPermissions.reduce((acc, permission) => {
      const group = permission.group || 'Khác'; // Nhóm mặc định nếu không có
      acc[group] = acc[group] || [];
      acc[group].push({ label: permission.description, value: permission.id });
      return acc;
    }, {});
  }, [allPermissions]);

  // useEffect để điền dữ liệu vào form khi chỉnh sửa
  useEffect(() => {
    if (open) {
      if (isEditing && editingRole.permissions) {
        form.setFieldsValue({
          name: editingRole.name,
          description: editingRole.description,
          // API trả về mảng object permissions, cần chuyển thành mảng id
          permissionIds: editingRole.permissions.map(p => p.id),
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRole, form, isEditing]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        await roleService.updateRole(editingRole.id, values);
        message.success("Cập nhật vai trò thành công");
      } else {
        await roleService.createRole(values);
        message.success("Tạo vai trò thành công");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
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
      width={800}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" name="role_form" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="permissionIds" label="Phân quyền cho vai trò">
            <Checkbox.Group style={{ width: '100%' }}>
              {Object.keys(groupedPermissions).length > 0 ? (
                Object.entries(groupedPermissions).map(([groupName, permissions]) => (
                  <div key={groupName} style={{ marginBottom: 16 }}>
                    <Title level={5}>{groupName}</Title>
                    <Row>
                      {permissions.map(permission => (
                        <Col span={8} key={permission.value}>
                          <Checkbox value={permission.value}>{permission.label}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))
              ) : (
                <Typography.Text type="secondary">Chờ mẹt...</Typography.Text>
              )}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleModal;