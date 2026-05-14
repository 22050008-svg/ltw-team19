import React from 'react';
import { Layout } from 'antd';
import ProductAdminForm from '../Components/admin/ProductAdminForm';

const { Content } = Layout;

/**
 * ProductAdminPage - Page wrapper cho form quản lý sản phẩm
 * Route: /admin/products/:id/edit
 */

const ProductAdminPage = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content>
        <ProductAdminForm />
      </Content>
    </Layout>
  );
};

export default ProductAdminPage;
