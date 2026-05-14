import React, { useState } from 'react';
import { Select, Button, InputNumber, Space, Col, Row, Tag, Popover } from 'antd';
import { ClearOutlined, FilterOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';

/**
 * HorizontalFilters - Bộ lọc nằm trên một hàng ngang
 * Hiển thị đẹp mắt dưới poster với layout responsive
 */
const HorizontalFilters = ({
  categories = [],
  selectedCategoryId,
  categoryName, // ★ NEW: Category name to display
  onCategorySelect,
  
  brands = [],
  selectedBrand,
  onBrandSelect,
  
  categoryAttributes = [],
  selectedAttributes = {},
  onAttributeChange,
  
  priceRange = { min: null, max: null },
  onPriceChange,
}) => {
  const [minPrice, setMinPrice] = useState(priceRange.min || '');
  const [maxPrice, setMaxPrice] = useState(priceRange.max || '');
  const [openPopovers, setOpenPopovers] = useState({});

  // Tìm tên attribute brand
  const brandAttrName = categoryAttributes.find(attr => 
    ['Thương Hiệu', 'Hãng', 'Brand', 'Brands'].includes(attr.name)
  )?.name || 'Thương Hiệu';

  // Handle popover visibility
  const handlePopoverVisibleChange = (attrName, visible) => {
    setOpenPopovers(prev => ({
      ...prev,
      [attrName]: visible
    }));
  };

  // Render attribute values in grid format
  const renderAttributeValuesPopover = (attrName, attrValues) => {
    return (
      <div style={{
        width: '480px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {attrValues.map((val, idx) => {
            const displayValue = val.value || val;
            const isSelected = selectedAttributes[attrName] === displayValue;
            return (
              <Tag
                key={idx}
                onClick={() => {
                  handleAttributeChange(attrName, displayValue);
                  handlePopoverVisibleChange(attrName, false);
                }}
                style={{
                  padding: '8px 12px',
                  border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? '#1890ff' : '#262626',
                  transition: 'all 0.3s',
                  marginRight: 0,
                  marginBottom: 0,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }}
              >
                {displayValue}
              </Tag>
            );
          })}
        </div>
      </div>
    );
  };

  // Handle thay đổi Attribute
  const handleAttributeChange = (attrName, value) => {
    const newSelected = { ...selectedAttributes };
    if (newSelected[attrName] === value) {
      delete newSelected[attrName];
    } else {
      newSelected[attrName] = value;
    }
    onAttributeChange(newSelected);
  };

  // Handle thay đổi Price
  const handlePriceApply = () => {
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    
    if (min && max && min > max) {
      return;
    }
    onPriceChange(min, max);
  };

  // Handle Clear All Filters
  const handleClearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    onAttributeChange({});
    onPriceChange(null, null);
    onCategorySelect('all');
  };

  // Đếm bao nhiêu filter đang active
  const activeFilterCount = Object.keys(selectedAttributes).filter(
    key => selectedAttributes[key]
  ).length + (minPrice || maxPrice || priceRange.min || priceRange.max ? 1 : 0);

  const categoryOptions = [
    { label: 'Tất cả danh mục', value: 'all' },
    ...categories.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      borderRadius: '12px',
      padding: '20px 24px',
      border: '1px solid #e8e8e8',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Header with title and clear button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FilterOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#262626'
          }}>
            Bộ Lọc Sản Phẩm
            {activeFilterCount > 0 && (
              <Tag color="blue" style={{ marginLeft: '12px', fontSize: '12px' }}>
                {activeFilterCount} bộ lọc
              </Tag>
            )}
          </h3>
        </div>
        {activeFilterCount > 0 && (
          <Button
            type="text"
            size="middle"
            danger
            icon={<ClearOutlined />}
            onClick={handleClearAll}
            style={{ fontSize: '14px' }}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <Row gutter={[12, 12]} align="middle">
        {/* Danh Mục */}
        <Col xs={12} sm={8} md={4} lg={3}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              Danh Mục
            </label>
            <Select
              placeholder="Chọn danh mục"
              options={categoryOptions}
              value={
                // ★ ENHANCED: Use categoryName if available, otherwise use selectedCategoryId
                (selectedCategoryId && categoryName && selectedCategoryId !== 'all')
                  ? categoryName
                  : (selectedCategoryId || 'all')
              }
              onChange={onCategorySelect}
              style={{ width: '100%' }}
              size="large"
            />
          </div>
        </Col>

        {/* Thương Hiệu */}
        {brands.length > 0 && (
          <Col xs={12} sm={8} md={4} lg={3}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                {brandAttrName}
              </label>
              <Popover
                content={renderAttributeValuesPopover(brandAttrName, brands.map(b => b.name))}
                title={`Chọn ${brandAttrName}`}
                trigger="click"
                placement="bottom"
                open={openPopovers[brandAttrName] || false}
                onOpenChange={(visible) => handlePopoverVisibleChange(brandAttrName, visible)}
              >
                <div style={{ position: 'relative' }}>
                  <Button
                    block
                    size="large"
                    style={{
                      backgroundColor: selectedAttributes[brandAttrName] ? '#e6f7ff' : '#fff',
                      borderColor: selectedAttributes[brandAttrName] ? '#1890ff' : '#d9d9d9',
                      color: selectedAttributes[brandAttrName] ? '#1890ff' : '#262626',
                      fontWeight: selectedAttributes[brandAttrName] ? '600' : '400',
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedAttributes[brandAttrName] || `Chọn ${brandAttrName.toLowerCase()}`}
                    </span>
                    <DownOutlined 
                      style={{ 
                        marginLeft: '8px',
                        fontSize: '10px',
                        transition: 'transform 0.3s',
                        transform: openPopovers[brandAttrName] ? 'rotate(180deg)' : 'rotate(0deg)'
                      }} 
                    />
                  </Button>
                  {selectedAttributes[brandAttrName] && (
                    <CloseOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttributeChange(brandAttrName, '');
                      }}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#999',
                        fontSize: '12px'
                      }}
                    />
                  )}
                </div>
              </Popover>
            </div>
          </Col>
        )}

        {/* Giá */}
        <Col xs={24} sm={12} md={6} lg={5}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              Khoảng Giá
            </label>
            <Space style={{ width: '100%' }} size={6}>
              <InputNumber
                placeholder="Từ"
                value={minPrice}
                onChange={setMinPrice}
                style={{ width: '100%' }}
                size="large"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/,/g, '')}
              />
              <span style={{ color: '#999' }}>–</span>
              <InputNumber
                placeholder="Đến"
                value={maxPrice}
                onChange={setMaxPrice}
                style={{ width: '100%' }}
                size="large"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/,/g, '')}
              />
              <Button 
                type="primary" 
                onClick={handlePriceApply}
                size="large"
              >
                Áp dụng
              </Button>
            </Space>
          </div>
        </Col>

        {/* Các Thuộc Tính Khác - Show All Attributes */}
        {categoryAttributes
          .filter(attr => attr.name !== brandAttrName)
          .map(attr => {
            const attrValues = attr.values || [];
            const selectedValue = selectedAttributes[attr.name];
            
            return (
              <Col xs={12} sm={8} md={6} lg={3} xl={2.4} key={attr.id}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666',
                    marginBottom: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textTransform: 'uppercase',
                    title: attr.name
                  }}>
                    {attr.name}
                  </label>
                  <Popover
                    content={renderAttributeValuesPopover(attr.name, attrValues)}
                    title={`Chọn ${attr.name}`}
                    trigger="click"
                    placement="bottom"
                    open={openPopovers[attr.name] || false}
                    onOpenChange={(visible) => handlePopoverVisibleChange(attr.name, visible)}
                  >
                    <div style={{ position: 'relative' }}>
                      <Button
                        block
                        size="large"
                        style={{
                          backgroundColor: selectedValue ? '#e6f7ff' : '#fff',
                          borderColor: selectedValue ? '#1890ff' : '#d9d9d9',
                          color: selectedValue ? '#1890ff' : '#262626',
                          fontWeight: selectedValue ? '600' : '400',
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedValue || `Chọn ${attr.name.toLowerCase()}`}
                        </span>
                        <DownOutlined 
                          style={{ 
                            marginLeft: '8px',
                            fontSize: '10px',
                            transition: 'transform 0.3s',
                            transform: openPopovers[attr.name] ? 'rotate(180deg)' : 'rotate(0deg)'
                          }} 
                        />
                      </Button>
                      {selectedValue && (
                        <CloseOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttributeChange(attr.name, '');
                          }}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontSize: '12px'
                          }}
                        />
                      )}
                    </div>
                  </Popover>
                </div>
              </Col>
            );
          })}
      </Row>

      {/* Active Filters Tags */}
      {activeFilterCount > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
              Bộ lọc đang hoạt động:
            </span>
            {Object.entries(selectedAttributes).map(([key, value]) => {
              // Handle case where value might be an object instead of string
              const displayValue = typeof value === 'string' ? value : (value?.name || value?.value || JSON.stringify(value));
              return (
                value && displayValue && (
                  <Tag
                    key={key}
                    closable
                    onClose={() => {
                      const newSelected = { ...selectedAttributes };
                      delete newSelected[key];
                      onAttributeChange(newSelected);
                    }}
                    style={{ marginRight: 0 }}
                  >
                    {key}: <strong>{displayValue}</strong>
                  </Tag>
                )
              );
            })}
            {(minPrice || maxPrice) && (
              <Tag
                closable
                onClose={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  onPriceChange(null, null);
                }}
                style={{ marginRight: 0 }}
              >
                Giá: <strong>{minPrice || '0'} - {maxPrice || '∞'}</strong>
              </Tag>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalFilters;
