import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Tag, Image, Pagination, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import productService from '../../../Services/ProductService';
import productAttributeService from '../../../Services/ProductAttributeService';
import productAdminService from '../../../Services/adminservice/ProductAdminService';
import ProductModal from './ProductModal';

const { Search } = Input;
const { Option } = Select;

const formatPrice = (price) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('vi-VN').format(parseFloat(price)) + ' đ';
};

// Helper function để lấy default variant (variant đầu tiên)
const getDefaultVariant = (product) => {
  if (!product.variants || product.variants.length === 0) {
    return {
      sku: 'N/A',
      price: 0,
      stock_quantity: 0,
      image_url: null,
      status: 'inactive'
    };
  }
  return product.variants[0];
};

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [categories, setCategories] = useState([]);
  const [categoryAttributesMap, setCategoryAttributesMap] = useState({}); // Map category ID to attributes

  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        categoryId: selectedCategoryId
      };
      const response = await productAdminService.getAllProducts(params);
      const responseData = response.data.data;

      if (responseData && responseData.data) {
        setProducts(responseData.data);
        const { currentPage, totalItems, itemsPerPage } = responseData.pagination;
        setPagination({ page: currentPage, total: totalItems, limit: itemsPerPage });
      } else {
        setProducts([]);
        setPagination({ page: 1, limit: 10, total: 0 });
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchTerm, selectedCategoryId]);

  useEffect(() => {
    // Lấy danh sách danh mục khi component được mount
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        const cats = response.data.data || [];
        setCategories(cats);
        
        // Fetch attributes cho từng category
        const attributesMap = {};
        for (const cat of cats) {
          try {
            const attrResponse = await productAttributeService.getAttributesByCategory(cat.id);
            const attrs = attrResponse.data?.data || [];
            attributesMap[cat.id] = attrs;
          } catch (error) {
            console.error(`Failed to fetch attributes for category ${cat.id}:`, error);
            attributesMap[cat.id] = [];
          }
        }
        setCategoryAttributesMap(attributesMap);
      } catch (error) {
        message.error("Không thể tải danh sách danh mục.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Gọi lại API khi trang hoặc bộ lọc thay đổi
    fetchProducts(pagination.page);
  }, [pagination.page, fetchProducts]);

  const handleFilterChange = () => {
    // Khi nhấn nút tìm kiếm hoặc thay đổi bộ lọc, luôn quay về trang 1
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(1);
  };

  const handleDelete = async (productId) => {
    try {
      await productAdminService.deleteProduct(productId);
      message.success("Xóa sản phẩm thành công!");
      fetchProducts(pagination.page); // Tải lại trang hiện tại
    } catch (error) {
      message.error("Xóa sản phẩm thất bại.");
    }
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    // Tải lại dữ liệu sau khi thêm/sửa thành công
    fetchProducts(pagination.page);
  };

  const columns = [
    { 
      title: 'Ảnh', 
      dataIndex: 'variants',
      key: 'imageUrl',
      width: 80,
      render: (variants, record) => {
        const variant = getDefaultVariant(record);
        const imageUrl = variant.image_url ? `${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${variant.image_url}` : 'https://dummyimage.com/60x60/cccccc/969696?text=No+Image';
        return <Image width={60} src={imageUrl} alt={record.name} />;
      }
    },
    { 
      title: 'Tên sản phẩm', 
      dataIndex: 'name', 
      key: 'name',
      width: 150,
      ellipsis: true
    },
    { 
      title: 'SKU', 
      key: 'sku',
      width: 100,
      render: (_, record) => {
        const variant = getDefaultVariant(record);
        return variant.sku;
      }
    },
    { 
      title: 'Danh mục', 
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (text, record) => record.category ? <Tag color="cyan">{record.category.name}</Tag> : 'N/A'
    },
    { 
      title: 'Nhãn hàng', 
      key: 'brand',
      width: 100,
      render: (_, record) => {
        try {
          // Lấy danh sách attributes của category sản phẩm
          const categoryAttrs = categoryAttributesMap[record.categoryId] || [];
          // Tìm attribute "Thương hiệu"
          const brandAttr = categoryAttrs.find(attr => 
            ['Thương Hiệu', 'Hãng', 'Brand', 'Brands'].includes(attr.name)
          );
          
          if (!brandAttr) {
            return <Tag>Không có</Tag>;
          }
          
          // Parse product attributes
          let productAttrs = {};
          if (record.attributes) {
            if (typeof record.attributes === 'string') {
              try {
                productAttrs = JSON.parse(record.attributes);
              } catch (e) {
                console.error('Failed to parse product attributes:', e);
                return <Tag>Lỗi</Tag>;
              }
            } else {
              productAttrs = record.attributes;
            }
          }
          
          // Extract brand value
          const brandValue = productAttrs[brandAttr.name];
          if (!brandValue) {
            return <Tag>Không rõ</Tag>;
          }
          
          return <Tag color="blue">{brandValue}</Tag>;
        } catch (error) {
          console.error('Error rendering brand column:', error);
          return <Tag>Lỗi</Tag>;
        }
      }
    },
    { 
      title: 'Giá bán', 
      key: 'price',
      width: 120,
      render: (_, record) => {
        const variant = getDefaultVariant(record);
        return formatPrice(variant.price);
      }
    },
    {
      title: 'Tồn kho',
      key: 'stock_quantity',
      width: 100,
      render: (_, record) => {
        const variant = getDefaultVariant(record);
        return variant.stock_quantity || 0;
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const variant = getDefaultVariant(record);
        const statusColor = variant.status === 'active' ? 'green' : 'red';
        const statusText = variant.status === 'active' ? 'Hoạt động' : 'Vô hiệu';
        return <Tag color={statusColor}>{statusText}</Tag>;
      }
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'attributes',
      key: 'attributes',
      width: 100,
      render: (attributes) => attributes ? <Tag color="blue">Đã có</Tag> : <Tag>Trống</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Chỉnh sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger title="Xóa sản phẩm" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm sản phẩm</Button>
        <Search
          placeholder="Tìm theo tên hoặc SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleFilterChange}
          enterButton
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo danh mục"
          style={{ width: 200 }}
          onChange={(value) => setSelectedCategoryId(value)}
          onClear={() => setSelectedCategoryId(null)}
          allowClear
        >
          {(categories || []).map(cat => (<Option key={cat.id} value={cat.id}>{cat.name}</Option>))}
        </Select>
        <Button onClick={handleFilterChange}>Lọc</Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading} 
        bordered
        pagination={false}
        scroll={{ x: 1200 }}
      />
      <Pagination
        current={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onChange={(page) => setPagination(prev => ({ ...prev, page }))}
        style={{ marginTop: 16, textAlign: 'right' }}
        showSizeChanger={false}
      />
      <ProductModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductTable;