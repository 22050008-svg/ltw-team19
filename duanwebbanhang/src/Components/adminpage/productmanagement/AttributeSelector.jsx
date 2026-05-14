import React, { useState, useEffect } from 'react';
import { Form, Select, Spin, Card, Row, Col, message, Empty, Button, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import productAttributeService from '../../../Services/ProductAttributeService';
import './AttributeSelector.css';

const { Option } = Select;

/**
 * AttributeSelector Component
 * Cho phép admin chọn các thuộc tính của sản phẩm theo danh mục
 * Hiển thị tất cả thuộc tính và cho phép chọn giá trị cho từng thuộc tính
 */
const AttributeSelector = ({ categoryId, onAttributesChange, existingAttributes = {} }) => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState(existingAttributes);

  // ⭐ Watch for existingAttributes prop changes (for editing products)
  useEffect(() => {
    console.log('[AttributeSelector] existingAttributes prop changed:', existingAttributes);
    setSelectedAttributes(existingAttributes);
  }, [existingAttributes]);

  // Fetch attributes khi categoryId thay đổi
  useEffect(() => {
    if (!categoryId) {
      setAttributes([]);
      setSelectedAttributes({});
      return;
    }

    const fetchAttributes = async () => {
      setLoading(true);
      try {
        const response = await productAttributeService.getAttributesByCategory(categoryId);
        const data = response.data?.data || response.data || [];
        
        // Xử lý dữ liệu từ API
        const processedAttributes = Array.isArray(data) ? data : [];
        setAttributes(processedAttributes);
        
        console.log('[AttributeSelector] Attributes loaded for category:', {
          categoryId,
          attributeCount: processedAttributes.length,
          currentSelectedAttributes: selectedAttributes
        });
        
        // Gọi callback để cập nhật parent component
        onAttributesChange(selectedAttributes);
      } catch (error) {
        message.error('Không thể tải danh sách thuộc tính');
        console.error('Fetch attributes error:', error);
        setAttributes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [categoryId]);

  // Xử lý thay đổi giá trị thuộc tính
  const handleAttributeChange = (attributeName, value) => {
    console.log('[AttributeSelector] Attribute changed:', { attributeName, value });
    const updated = {
      ...selectedAttributes,
      [attributeName]: value,
    };
    console.log('[AttributeSelector] Updated selectedAttributes:', updated);
    setSelectedAttributes(updated);
    onAttributesChange(updated);
  };

  // Xóa một thuộc tính
  const handleRemoveAttribute = (attributeName) => {
    const updated = { ...selectedAttributes };
    delete updated[attributeName];
    setSelectedAttributes(updated);
    onAttributesChange(updated);
  };

  if (!categoryId) {
    return (
      <Card title="Chọn Thuộc Tính Sản Phẩm" style={{ marginTop: '16px' }}>
        <Empty description="Vui lòng chọn danh mục trước tiên" />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card title="Chọn Thuộc Tính Sản Phẩm" style={{ marginTop: '16px' }}>
        <Spin tip="Đang tải thuộc tính..." />
      </Card>
    );
  }

  if (!attributes || attributes.length === 0) {
    return (
      <Card title="Chọn Thuộc Tính Sản Phẩm" style={{ marginTop: '16px' }}>
        <Empty description="Danh mục này chưa có thuộc tính nào" />
      </Card>
    );
  }

  return (
    <Card title="Chọn Thuộc Tính Sản Phẩm" style={{ marginTop: '16px' }} className="attribute-selector-card">
      <div className="attributes-container">
        {attributes.map((attribute, index) => {
          const attributeValues = attribute.ProductAttributeValues || attribute.values || [];
          const isSelected = selectedAttributes[attribute.name];
          const isMandatory = attribute.required === true || attribute.required === 1;

          return (
            <div key={attribute.id} className="attribute-item">
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <label className="attribute-label" style={{ fontWeight: isMandatory ? 'bold' : 'normal' }}>
                    {isMandatory ? '🔴' : '⚪'} {attribute.name}
                    {isMandatory && ' *'}
                  </label>
                  {isMandatory && (
                    <div style={{ fontSize: '12px', color: '#d4463f', marginTop: '4px' }}>Bắt buộc</div>
                  )}
                </Col>
                <Col span={14}>
                  <Select
                    placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                    value={isSelected || undefined}
                    onChange={(value) => handleAttributeChange(attribute.name, value)}
                    className="attribute-select"
                    allowClear={!isMandatory}
                    required={isMandatory}
                    status={isMandatory && !isSelected ? "error" : ""}
                  >
                    {attributeValues.map((attrValue) => (
                      <Option key={attrValue.id} value={attrValue.value}>
                        {attrValue.value}
                      </Option>
                    ))}
                  </Select>
                  {isMandatory && !isSelected && (
                    <div style={{ fontSize: '12px', color: '#d4463f', marginTop: '4px' }}>
                      ⚠️ Vui lòng chọn {attribute.name}
                    </div>
                  )}
                </Col>
                <Col span={4} className="action-col">
                  {isSelected && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveAttribute(attribute.name)}
                      title="Xóa"
                    />
                  )}
                </Col>
              </Row>
            </div>
          );
        })}
      </div>

      {/* Hiển thị summary của các thuộc tính đã chọn */}
      {Object.keys(selectedAttributes).length > 0 && (
        <>
          <Divider />
          <div className="selected-summary">
            <h4>Thuộc tính đã chọn:</h4>
            <div className="summary-content">
              {Object.entries(selectedAttributes).map(([key, value]) => {
                // Handle case where value might be an object instead of string
                const displayValue = typeof value === 'string' ? value : (value?.name || value?.value || JSON.stringify(value));
                return (
                  <span key={key} className="summary-tag">
                    <strong>{key}:</strong> {displayValue}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AttributeSelector;
