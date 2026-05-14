import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import RoleModal from './RoleModal';
import roleService from '../../../Services/adminservice/RoleService';

const RoleTable = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Sử dụng useCallback để tránh tạo lại hàm fetchRoles mỗi lần render
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roleService.getRoles();
      
      // Dữ liệu vai trò nằm trong response.data
      setRoles(response.data.data);
      
    } catch (error) {
      message.error("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const showModal = (role = null) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleModalSuccess = () => {
    // Khi modal thành công (tạo/sửa), tải lại dữ liệu từ server
    fetchRoles();
  };
  
  const handleDelete = async (roleId) => {
      try {
          await roleService.deleteRole(roleId);
          message.success("Xóa vai trò thành công!");
          fetchRoles(); // Tải lại dữ liệu sau khi xóa
      } catch (error) {
          const errorMessage = error.response?.data?.message || "Xóa vai trò thất bại.";
      message.error(errorMessage);
      }
  }

  const columns = [
    { title: 'Tên vai trò', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Phân quyền</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa vai trò này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm vai trò</Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={roles} 
        rowKey="id" 
        bordered 
        loading={loading}
      />
      <RoleModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingRole={editingRole}
      />
    </div>
  );
};

export default RoleTable;