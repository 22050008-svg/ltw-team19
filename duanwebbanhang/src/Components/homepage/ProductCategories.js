import React, { useState, useEffect } from 'react';
import { Menu, Typography, Spin, Alert, message } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import productService from '../../Services/ProductService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // useEffect để lấy danh sách danh mục từ API khi component được tải
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await productService.getCategories();
        if (response.data.data && Array.isArray(response.data.data.data)) {
          setCategories(response.data.data.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setError("Không thể tải danh sách danh mục.");
        message.error("Lỗi kết nối đến máy chủ!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy một lần

  // Hàm xử lý khi người dùng click vào một danh mục
  const handleMenuClick = (e) => {
    // e.key chính là id của danh mục
    if (e.key === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${e.key}`);
    }
  };

  // Chuyển đổi dữ liệu từ API sang định dạng mà Menu của AntD cần
  const menuItems = categories.map(category => ({
    key: category.id,
    label: category.name,
    // Bạn có thể thêm icon cho từng danh mục ở đây nếu cần
  }));

  // Thêm mục "Tất cả sản phẩm" vào đầu danh sách
  const allMenuItems = [
    { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm' },
    ...menuItems,
  ];

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md flex justify-center items-center h-48">
        <Spin />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  // Giao diện chính của component
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Title level={4} className="mb-4">Danh Mục Sản Phẩm</Title>
      <Menu
        onClick={handleMenuClick}
        mode="inline"
        items={allMenuItems}
        // Thêm style để loại bỏ đường viền không cần thiết
        style={{ borderRight: 0 }} 
      />
    </div>
  );
};

export default ProductCategories;