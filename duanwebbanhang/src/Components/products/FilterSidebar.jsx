import React, { useMemo } from 'react';
import { Collapse, Button, Checkbox, InputNumber, Menu, Empty, Space } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

/**
 * FilterSidebar - Gộp tất cả filter (Category, Brand, Price, Attributes) vào một sidebar
 * Sử dụng Collapse component để tổ chức gọn gàng
 */
const FilterSidebar = ({
  categories = [],
  selectedCategoryId,
  onCategorySelect,
  
  brands = [],
  
  categoryAttributes = [],
  selectedAttributes = {},
  onAttributeChange,
  
  priceRange = { min: null, max: null },
  onPriceChange,
}) => {
  const [minPrice, setMinPrice] = React.useState(priceRange.min || '');
  const [maxPrice, setMaxPrice] = React.useState(priceRange.max || '');

  // Hàm để convert tên thành slug
  const slugify = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Handle thay đổi Attribute
  const handleAttributeChange = (attrName, value) => {
    const newSelected = { ...selectedAttributes };
    // So sánh dựa trên giá trị gốc (không slugify)
    if (newSelected[attrName] === value) {
      delete newSelected[attrName];
    } else {
      newSelected[attrName] = value;
    }
    console.log(`🔄 Brand filter changed: "${attrName}" = "${value}"`, newSelected);
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
  };

  // Category collapse items
  const categoryMenu = {
    key: 'category',
    label: '📁 Danh Mục',
    children: !categories.length ? (
      <Empty description="Không có danh mục" style={{ marginTop: '12px' }} />
    ) : (
      <Menu
        onClick={(e) => onCategorySelect(e.key)}
        selectedKeys={[selectedCategoryId || 'all']}
        mode="inline"
        items={[
          {
            key: 'all',
            label: 'Tất cả sản phẩm'
          },
          ...categories.map(cat => ({
            key: cat.id,
            label: cat.name
          }))
        ]}
        style={{ border: 'none' }}
      />
    )
  };

  // Brand collapse items
  // Tìm tên attribute brand từ categoryAttributes (có thể là "Thương Hiệu", "Hãng", etc.)
  const brandAttrName = categoryAttributes.find(attr => 
    ['Thương Hiệu', 'Hãng', 'Brand', 'Brands'].includes(attr.name)
  )?.name || 'Thương Hiệu'; // Default to "Thương Hiệu"
  
  console.log('🏷️ Brand Attribute:', {
    brandAttrName,
    categoryAttributesCount: categoryAttributes.length,
    categoryAttributeNames: categoryAttributes.map(a => a.name),
    brandsCount: brands.length,
    brandsNames: brands.map(b => b.name)
  });
  
  const brandMenu = {
    key: 'brand',
    label: `🏷️ ${brandAttrName} ${selectedAttributes[brandAttrName] ? '(1)' : ''}`,
    children: !brands.length ? (
      <Empty description="Không có thương hiệu" style={{ marginTop: '12px' }} />
    ) : (
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {brands.map(brand => (
          <div key={brand.id} style={{ marginBottom: '8px' }}>
            <Checkbox
              checked={selectedAttributes[brandAttrName] === brand.name}
              onChange={() => handleAttributeChange(brandAttrName, brand.name)}
            >
              {brand.name}
            </Checkbox>
          </div>
        ))}
      </div>
    )
  };

  // Price collapse items
  const priceMenu = {
    key: 'price',
    label: '💰 Giá',
    children: (
      <div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InputNumber
              placeholder="Từ"
              value={minPrice}
              onChange={setMinPrice}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/,/g, '')}
            />
            <span>-</span>
            <InputNumber
              placeholder="Đến"
              value={maxPrice}
              onChange={setMaxPrice}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/,/g, '')}
            />
          </div>
          <Button type="primary" block size="small" onClick={handlePriceApply}>
            Áp dụng
          </Button>
        </Space>
      </div>
    )
  };

  // Build collapse items
  const collapseItems = [categoryMenu, brandMenu, priceMenu];

  // Add attribute collapse items
  categoryAttributes.forEach((attr) => {
    // Bỏ qua Thương Hiệu vì đã có riêng
    if (attr.name === 'Thương Hiệu') return;
    
    const attrValues = attr.values || [];
    const selectedValue = selectedAttributes[attr.name];
    
    collapseItems.push({
      key: `attr-${attr.id}`,
      label: `${attr.name} ${selectedValue ? `(1)` : ''}`,
      children: attrValues.length === 0 ? (
        <Empty description="Không có giá trị" style={{ marginTop: '12px' }} />
      ) : (
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {attrValues.map((val) => {
            const value = val.value || val;
            return (
              <div key={value} style={{ marginBottom: '8px' }}>
                <Checkbox
                  checked={selectedValue === value}
                  onChange={() => handleAttributeChange(attr.name, value)}
                >
                  {value}
                </Checkbox>
              </div>
            );
          })}
        </div>
      )
    });
  });

  // Đếm bao nhiêu filter đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.keys(selectedAttributes).forEach(key => {
      if (selectedAttributes[key]) count++;
    });
    if (priceRange.min !== null || priceRange.max !== null) count++;
    return count;
  }, [selectedAttributes, priceRange]);

  // Debug: Log render
  console.log('🎨 FilterSidebar render:', {
    brandsCount: brands.length,
    brandNames: brands.map(b => b.name),
    selectedBrand: selectedAttributes[brandAttrName],
    activeFilterCount
  });

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #f0f0f0',
      position: 'sticky',
      top: '16px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          Bộ Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            type="text"
            size="small"
            danger
            icon={<ClearOutlined />}
            onClick={handleClearAll}
          >
            Xóa
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <Collapse
        items={collapseItems}
        accordion={false}
        defaultActiveKey={['category', 'brand']}
        style={{ background: '#f9f9f9' }}
      />
    </div>
  );
};

export default FilterSidebar;
