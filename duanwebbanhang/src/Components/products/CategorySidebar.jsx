import React from 'react';
import { Menu, Empty } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

/**
 * Component hiển thị danh mục sản phẩm ở sidebar trái - Minimal design
 * @param {array} props.categories - Danh sách danh mục
 * @param {number|string} props.selectedCategoryId - ID danh mục được chọn
 * @param {function} props.onSelect - Callback khi chọn danh mục
 */
const CategorySidebar = ({ categories = [], selectedCategoryId, onSelect }) => {
  // Icon map cho các danh mục
  const iconMap = {
    'Tủ Lạnh': '❄️',
    'Máy Giặt': '🧺',
    'Máy Sấy': '💨',
    'Máy Lạnh': '❅'
  };

  const menuItems = [
    {
      key: 'all',
      label: 'Tất cả sản phẩm',
      icon: <AppstoreOutlined style={{ fontSize: '14px' }} />
    },
    ...categories.map(cat => ({
      key: cat.id,
      label: cat.name,
      icon: <span style={{ marginRight: '0' }}>{iconMap[cat.name] || '📦'}</span>
    }))
  ];

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
      {categories.length === 0 ? (
        <Empty description="Không có danh mục" />
      ) : (
        <Menu
          onClick={(e) => onSelect(e.key)}
          selectedKeys={[selectedCategoryId || 'all']}
          mode="vertical"
          items={menuItems}
          style={{ 
            border: '1px solid #f0f0f0',
            borderRadius: '8px'
          }}
        />
      )}
    </div>
  );
};

export default CategorySidebar;
