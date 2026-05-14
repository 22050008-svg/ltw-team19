import React from 'react';
import { Select, Button, Row, Col, Empty, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

/**
 * Component lọc sản phẩm theo thuộc tính (attributes) - Minimal design
 */
const AttributeFilter = ({ 
  categoryId, 
  categoryAttributes = [], 
  selectedAttributes = {}, 
  onAttributeChange 
}) => {
  // Không show component nếu không có categoryId hoặc categoryId = 'all'
  if (!categoryId || categoryId === 'all' || !categoryAttributes || categoryAttributes.length === 0) {
    return null;
  }

  const handleAttributeChange = (attributeName, value) => {
    const newSelected = {
      ...selectedAttributes,
      [attributeName]: value
    };

    // Xóa giá trị nếu là null/undefined
    if (!value) {
      delete newSelected[attributeName];
    }

    onAttributeChange?.(newSelected);
  };

  const handleClearAll = () => {
    onAttributeChange?.({});
  };

  const hasActiveFilters = Object.keys(selectedAttributes).length > 0;

  if (categoryAttributes.length === 0) {
    return <Empty description="Không có thuộc tính" />;
  }

  return (
    <div>
      {hasActiveFilters && (
        <div style={{ marginBottom: '10px', textAlign: 'right' }}>
          <Button 
            type="text" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      <Row gutter={[8, 8]}>
        {categoryAttributes.map((attribute) => {
          const attributeValues = attribute.ProductAttributeValues || attribute.values || [];
          const selectedValue = selectedAttributes[attribute.name];
          
          return (
            <Col xs={12} sm={8} md={6} lg={6} key={attribute.id}>
              <Select
                placeholder={attribute.name}
                value={selectedValue || undefined}
                onChange={(value) => handleAttributeChange(attribute.name, value)}
                style={{ width: '100%' }}
                allowClear
                size="middle"
                options={attributeValues.map(v => ({
                  label: v.value || v,
                  value: v.value || v
                }))}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AttributeFilter;