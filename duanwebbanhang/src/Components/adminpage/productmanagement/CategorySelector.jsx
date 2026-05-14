import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Radio, Button, Divider, message, Badge, Empty } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import categoryService from '../../../Services/CategoryService';
import './CategorySelector.css';

/**
 * CategorySelector Component
 * Hiển thị danh mục dưới dạng grid visual với icons/emojis
 * Cho admin dễ dàng chọn danh mục khi tạo sản phẩm
 */
const CategorySelector = ({ 
  onSelect, 
  selectedCategoryId = null, 
  showWithCount = false,
  typeFilter = 'appliance' 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(selectedCategoryId);

  useEffect(() => {
    fetchCategories();
  }, [typeFilter]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = showWithCount 
        ? await categoryService.getCategoriesWithCount(typeFilter)
        : await categoryService.getCategoriesByType(typeFilter);
      
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh mục');
      console.error('Fetch categories error:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (categoryId) => {
    setSelected(categoryId);
    const selectedCat = categories.find(c => c.id === categoryId);
    if (onSelect && selectedCat) {
      onSelect(categoryId, selectedCat);
    }
  };

  if (loading) {
    return (
      <Card className="category-selector-card">
        <Spin tip="Đang tải danh mục..." />
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="category-selector-card">
        <Empty description="Không có danh mục nào" />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👆 Chọn Danh Mục Sản Phẩm</span>
          {selected && <Badge count="✓" color="#52c41a" />}
        </div>
      }
      className="category-selector-card"
    >
      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
            <div 
              className={`category-item ${selected === category.id ? 'selected' : ''}`}
              onClick={() => handleSelect(category.id)}
              role="radio"
              tabIndex="0"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSelect(category.id);
              }}
              style={{
                cursor: 'pointer',
                borderColor: category.color || '#d9d9d9',
              }}
            >
              <div 
                className="category-icon"
                style={{ backgroundColor: category.color || '#f0f0f0' }}
              >
                {category.icon || '📦'}
              </div>
              
              <div className="category-content">
                <div className="category-name">{category.name}</div>
                
                {category.description && (
                  <div className="category-description">
                    {category.description.substring(0, 40)}
                    {category.description.length > 40 ? '...' : ''}
                  </div>
                )}
                
                {showWithCount && category.productCount !== undefined && (
                  <div className="category-count">
                    {category.productCount} sản phẩm
                  </div>
                )}
              </div>

              {selected === category.id && (
                <div className="category-selected-badge">
                  <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>

      {selected && (
        <>
          <Divider />
          <div className="category-selected-info">
            <strong>✓ Đã chọn danh mục:</strong>{' '}
            {categories.find(c => c.id === selected)?.name}
          </div>
        </>
      )}
    </Card>
  );
};

export default CategorySelector;
