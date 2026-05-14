import React from 'react';
import { Menu, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CategorySidebar = ({ categories = [], selectedCategoryId, onSelect }) => {
  const menuItems = categories.map(category => ({
    key: category.id,
    label: category.name,
  }));

  const allItems = [
    { key: 'all', label: 'Tất cả sản phẩm', icon: <AppstoreOutlined /> },
    ...menuItems,
  ];

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
      <Title level={4}>Danh Mục</Title>
      <Menu
        onClick={(e) => onSelect(e.key)}
        selectedKeys={[selectedCategoryId]}
        mode="inline"
        items={allItems}
      />
    <>

    </>
    </div>
  );
};

export default CategorySidebar;



// import React from 'react';
// import { Menu, Typography } from 'antd';
// import { AppstoreOutlined } from '@ant-design/icons';

// const { Title } = Typography;

// const CategorySidebar = ({ categories = [], selectedCategoryId, onSelect }) => {
//   // Lọc để chỉ lấy danh mục "Education"
//   const educationCategory = categories.find(cat => cat.name.toLowerCase() === 'education');
//   const menuItems = educationCategory 
//     ? [{ key: educationCategory.id, label: educationCategory.name }] 
//     : [];

//   const allItems = [
//     { key: 'all', label: 'Tất cả sản phẩm', icon: <AppstoreOutlined /> },
//     ...menuItems,
//   ];

//   return (
//     <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
//       <Title level={4}>Danh Mục</Title>
//       <Menu
//         onClick={(e) => onSelect(e.key)}
//         selectedKeys={[selectedCategoryId]}
//         mode="inline"
//         items={allItems}
//       />
//     <>

//     </>
//     </div>
//   );
// };

// export default CategorySidebar;