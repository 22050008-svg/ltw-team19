import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, message, Spin, Empty, Popconfirm, Tag, Card, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import profileService from '../../Services/ProfileService';
import AddressModal from './AddressModal';

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { Text } = Typography;

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await profileService.getAddresses();
      setAddresses(response.data.data || []);
    } catch (error) {
      message.error('Không thể tải sổ địa chỉ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenModal = (address = null) => {
    setEditingAddress(address);
    setModalVisible(true);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setEditingAddress(null);
  };

  const handleOkModal = async (values) => {
    setSubmitLoading(true);
    try {
      // Kiểm tra xem 'values' có chứa 'id' không để quyết định là thêm mới hay cập nhật
      if (values.id) {
        await profileService.updateAddress(values.id, values);
        message.success('Cập nhật địa chỉ thành công!');
      } else {
        await profileService.addAddress(values);
        message.success('Thêm địa chỉ mới thành công!');
      }
      setModalVisible(false);
      setEditingAddress(null);
      fetchAddresses(); // Tải lại danh sách địa chỉ
    } catch (error) {
      message.error('Thao tác thất bại. Vui lòng thử lại.');
      console.error("Lỗi khi lưu địa chỉ:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await profileService.deleteAddress(id);
      message.success('Xóa địa chỉ thành công!');
      fetchAddresses();
    } catch (error) {
      message.error('Xóa địa chỉ thất bại.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await profileService.updateAddress(id, { isDefault: true });
      message.success('Đặt làm địa chỉ mặc định thành công!');
      fetchAddresses();
    } catch (error) {
      message.error('Thao tác thất bại.');
    }
  };

  if (loading) return <div className="text-center p-8"><Spin /></div>;

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => handleOpenModal()}>
        Thêm địa chỉ mới
      </Button>
      {addresses.length > 0 ? (
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, xl: 2 }}
          dataSource={addresses}
          renderItem={item => (
            <List.Item key={item.id}>
              <Card
                title={item.recipientName}
                className="shadow-md rounded-lg h-full flex flex-col"
                style={item.isDefault ? { border: '1px solid #52c41a' } : {}}
                styles={{ body: { flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
                extra={item.isDefault && <Tag icon={<CheckCircleOutlined />} color="success">Mặc định</Tag>}
                actions={[
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(item)}>Sửa</Button>,
                  <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(item.id)} okText="Xóa" cancelText="Hủy">
                    <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>,
                  !item.isDefault && (
                    <Button type="text" icon={<CheckCircleOutlined />} onClick={() => handleSetDefault(item.id)}>Đặt làm mặc định</Button>
                  )
                ]}
              >
                <Space direction="vertical" size="small" className="w-full">
                  <Text>
                    <PhoneOutlined className="mr-2" />
                    {item.phone}
                  </Text>
                  <Text>
                    <HomeOutlined className="mr-2" />
<<<<<<< HEAD
                    {[item.street, item.wardName, item.districtName, item.provinceName].filter(Boolean).join(', ')}
=======
                    {`${item.street}, ${item.wardName}, ${item.districtName}, ${item.provinceName}`}
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
                  </Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        !loading && <Empty description="Bạn chưa có địa chỉ nào." />
      )}
      {/* Modal để thêm/sửa địa chỉ */}
      <AddressModal
        visible={modalVisible}
        onCancel={handleCancelModal}
        onOk={handleOkModal}
        initialData={editingAddress}
        loading={submitLoading}
      />
    </div>
  );
};

export default AddressBook;