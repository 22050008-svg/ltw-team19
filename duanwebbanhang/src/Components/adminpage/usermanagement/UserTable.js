import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import UserModal from './UserModal';
import userService from '../../../Services/UserService';

const { Search } = Input;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await userService.getUsers(params);
      // Xử lý cấu trúc response: response.data.data hoặc response.data.data.users
      const usersData = response.data.data?.users || response.data.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      message.success("Cập nhật trạng thái thành công!");
      fetchUsers(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    fetchUsers(); // Tải lại dữ liệu sau khi tạo/sửa thành công
  };
  
  const onSearch = (value) => {
      fetchUsers({ search: value });
  };

  const columns = [
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: roles => (
        <>
          {(roles || []).map(role => (
            <Tag color="blue" key={role.id}>{role.name?.toUpperCase()}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Chỉnh sửa</Button>
          <Popconfirm
            title={record.isActive ? 'Vô hiệu hóa người dùng?' : 'Kích hoạt người dùng?'}
            description="Hành động này sẽ cập nhật trạng thái người dùng"
            onConfirm={() => handleStatusChange(record.id, record.isActive)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger={record.isActive}>
              {record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm người dùng</Button>
        <Search 
            placeholder="Tìm kiếm theo tên hoặc email" 
            onSearch={onSearch}
            enterButton="Tìm"
            style={{ width: 300 }} 
        />
      </Space>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        bordered
        loading={loading}
      />
      <UserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingUser={editingUser}
      />
    </div>
  );
};

export default UserTable;