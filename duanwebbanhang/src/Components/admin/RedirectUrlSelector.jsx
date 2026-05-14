// src/Components/admin/RedirectUrlSelector.jsx
import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Row, Col, Card, Tag, Button, Space, Divider } from 'antd';
import { LinkOutlined, FileTextOutlined } from '@ant-design/icons';
import CategoryService from '../../Services/CategoryService';
import ProductAttributeService from '../../Services/ProductAttributeService';

const RedirectUrlSelector = ({ value, onChange }) => {
  const [redirectType, setRedirectType] = useState('none');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brandAttributeId, setBrandAttributeId] = useState(null);

  // Load categories và brands on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoryResponse = await CategoryService.getAllCategories();
      const categoryList = categoryResponse.data?.data || [];
      setCategories(categoryList);
      
      // Load attributes để tìm attribute "Thương Hiệu" hoặc "Brand"
      const attributesResponse = await ProductAttributeService.getAttributes();
      const attributes = attributesResponse.data?.data || [];
      
      // Tìm attribute "Thương Hiệu" hoặc "Brand"
      const brandAttribute = attributes.find(attr => 
        attr.name.toLowerCase().includes('thương hiệu') || 
        attr.name.toLowerCase().includes('brand') ||
        attr.name.toLowerCase().includes('hãng')
      );
      
      if (brandAttribute) {
        setBrandAttributeId(brandAttribute.id);
        // Load các giá trị của attribute này
        const valuesResponse = await ProductAttributeService.getAttributeValues(brandAttribute.id);
        const brandValues = valuesResponse.data?.data || [];
        setBrands(brandValues.map(v => ({
          id: v.id,
          name: v.value
        })));
      } else {
        // Nếu không tìm thấy attribute, tạo danh sách rỗng
        console.warn('Brand attribute not found');
        setBrands([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate URL based on selection
  const generateUrl = () => {
    let url = '';
    
    switch (redirectType) {
      case 'category':
        if (selectedCategory) {
          url = `/category/${selectedCategory}`;
        }
        break;
      case 'brand':
        if (selectedBrand) {
          // Tìm brand name từ id
          const brandName = brands.find(b => b.id === selectedBrand)?.name || selectedBrand;
          url = `/products?brand=${encodeURIComponent(brandName)}`;
        }
        break;
      case 'category-brand':
        if (selectedCategory && selectedBrand) {
          const brandName = brands.find(b => b.id === selectedBrand)?.name || selectedBrand;
          url = `/category/${selectedCategory}?brand=${encodeURIComponent(brandName)}`;
        } else if (selectedCategory) {
          url = `/category/${selectedCategory}`;
        } else if (selectedBrand) {
          const brandName = brands.find(b => b.id === selectedBrand)?.name || selectedBrand;
          url = `/products?brand=${encodeURIComponent(brandName)}`;
        }
        break;
      case 'sale':
        url = '/products?type=sale';
        break;
      case 'new':
        url = '/products?type=new';
        break;
      case 'trending':
        url = '/products?type=trending';
        break;
      case 'search':
        url = '/products';
        break;
      case 'custom':
        url = customUrl;
        break;
      default:
        url = '';
    }
    
    return url;
  };

  // Handle change in redirect type
  const handleTypeChange = (type) => {
    setRedirectType(type);
    setSelectedCategory(null);
    setSelectedBrand(null);
    setCustomUrl('');
  };

  // When any value changes, update parent
  useEffect(() => {
    const newUrl = generateUrl();
    onChange(newUrl);
  }, [redirectType, selectedCategory, selectedBrand, customUrl, brands]);

  const currentUrl = generateUrl();
  const urlPreview = currentUrl || 'Không có link';

  return (
    <div>
      <Card 
        size="small" 
        style={{ marginBottom: '16px', backgroundColor: '#f5f7fa' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <strong>📋 Loại Link Chuyển Hướng</strong>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Chọn loại link hoặc nhập URL tùy chỉnh
            </p>
          </div>

          <Select
            placeholder="Chọn loại link để chuyển hướng..."
            value={redirectType || undefined}
            onChange={handleTypeChange}
            options={[
              { label: 'Không có link', value: 'none' },
              { label: '📁 Danh mục sản phẩm', value: 'category' },
              { label: '🏢 Theo hãng sản xuất', value: 'brand' },
              { label: '📁 + 🏢 Danh mục + Hãng', value: 'category-brand' },
              { label: '🔥 Sản phẩm bán chạy', value: 'sale' },
              { label: '✨ Sản phẩm mới', value: 'new' },
              { label: '🌟 Xu hướng', value: 'trending' },
              { label: '🔍 Tất cả sản phẩm', value: 'search' },
              { label: '⚙️ Tùy chỉnh URL', value: 'custom' },
            ]}
            style={{ width: '100%' }}
          />
        </Space>
      </Card>

      {/* Category Selection */}
      {(redirectType === 'category' || redirectType === 'category-brand') && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <strong>Chọn danh mục:</strong>
            <Select
              placeholder="Chọn danh mục sản phẩm..."
              value={selectedCategory || undefined}
              onChange={setSelectedCategory}
              loading={loading}
              options={categories.map(cat => ({
                label: cat.name,
                value: cat.id
              }))}
              style={{ width: '100%' }}
            />
          </Space>
        </Card>
      )}

      {/* Brand Selection */}
      {(redirectType === 'brand' || redirectType === 'category-brand') && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <strong>Chọn hãng sản xuất:</strong>
            <Select
              placeholder={loading ? "Đang tải hãng..." : "Chọn hãng sản xuất..."}
              value={selectedBrand || undefined}
              onChange={setSelectedBrand}
              loading={loading}
              options={brands.map(brand => ({
                label: brand.name,
                value: brand.id
              }))}
              style={{ width: '100%' }}
            />
            {brands.length === 0 && !loading && (
              <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                ⚠️ Không tìm thấy hãng nào. Vui lòng kiểm tra cấu hình thuộc tính sản phẩm.
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Custom URL */}
      {redirectType === 'custom' && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <strong>Nhập URL tùy chỉnh:</strong>
            <Input
              placeholder="VD: /products?search=summer hoặc https://example.com"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              prefix={<LinkOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              💡 Hỗ trợ:
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>Link nội bộ: /products?search=summer</li>
                <li>Link ngoài: https://example.com</li>
              </ul>
            </div>
          </Space>
        </Card>
      )}

      {/* URL Preview */}
      <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
        <div>
          <strong>🔗 Link sẽ chuyển hướng đến:</strong>
          <div 
            style={{ 
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all',
              color: currentUrl ? '#1890ff' : '#999'
            }}
          >
            {urlPreview}
          </div>
        </div>
      </Card>

      {/* Hidden input to store actual value */}
      <input type="hidden" value={value || ''} readOnly />
    </div>
  );
};

export default RedirectUrlSelector;
