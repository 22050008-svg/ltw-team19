import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Space, Divider, Card, Empty, InputNumber, Row, Col, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import './SpecificationEditor.css';

/**
 * SpecificationEditor - Component để quản lý thông số kỹ thuật sản phẩm
 * 
 * Format specifications:
 * - Không có section: [{ label: "...", value: "..." }]
 * - Có section: [{ section: "...", items: [{ label: "...", value: "..." }] }]
 */
const SpecificationEditor = ({ value, onChange }) => {
  const [mode, setMode] = useState('simple'); // 'simple' hoặc 'grouped'
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [sections, setSections] = useState(
    Array.isArray(value) && value.length > 0 && value[0].section 
      ? value 
      : []
  );
  const [simpleSpecs, setSimpleSpecs] = useState(
    Array.isArray(value) && value.length > 0 && !value[0].section 
      ? value 
      : []
  );

  // Watch for value prop changes - CRITICAL for editing products
  useEffect(() => {
    console.log('[SpecificationEditor] Value prop changed:', {
      value,
      isArray: Array.isArray(value),
      length: Array.isArray(value) ? value.length : 'N/A',
      firstItem: Array.isArray(value) && value.length > 0 ? value[0] : 'N/A'
    });
    
    if (Array.isArray(value) && value.length > 0) {
      if (value[0].section) {
        // Grouped format
        console.log('[SpecificationEditor] Loading grouped specifications');
        setSections(value);
        setMode('grouped');
      } else {
        // Simple format
        console.log('[SpecificationEditor] Loading simple specifications');
        setSimpleSpecs(value);
        setMode('simple');
      }
    } else {
      // Empty value
      console.log('[SpecificationEditor] No specifications');
      setSections([]);
      setSimpleSpecs([]);
    }
    // Reset editing state when value changes
    setEditingIndex(null);
    setTempLabel('');
    setTempValue('');
  }, [JSON.stringify(value)]);

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Sync value khi đổi mode
    if (newMode === 'simple') {
      // Convert grouped to simple
      let allSpecs = [];
      sections.forEach(section => {
        if (section.items) {
          allSpecs = [...allSpecs, ...section.items];
        }
      });
      setSimpleSpecs(allSpecs);
      onChange(allSpecs);
    } else {
      // Convert simple to grouped
      if (simpleSpecs.length > 0) {
        const grouped = [{
          section: 'Thông Số Chung',
          items: simpleSpecs
        }];
        setSections(grouped);
        onChange(grouped);
      }
    }
  };

  // Simple mode: Add/Edit spec
  const handleAddOrUpdateSpec = () => {
    if (!tempLabel.trim() || !tempValue.toString().trim()) {
      message.error('Vui lòng nhập đầy đủ label và value');
      return;
    }

    let updated;
    if (editingIndex !== null) {
      updated = simpleSpecs.map((spec, idx) =>
        idx === editingIndex ? { label: tempLabel, value: tempValue } : spec
      );
      setEditingIndex(null);
    } else {
      updated = [...simpleSpecs, { label: tempLabel, value: tempValue }];
    }

    setSimpleSpecs(updated);
    onChange(updated);
    setTempLabel('');
    setTempValue('');
  };

  // Simple mode: Delete spec
  const handleDeleteSpec = (index) => {
    const updated = simpleSpecs.filter((_, idx) => idx !== index);
    setSimpleSpecs(updated);
    onChange(updated);
  };

  // Simple mode: Edit spec
  const handleEditSpec = (index) => {
    const spec = simpleSpecs[index];
    setEditingIndex(index);
    setTempLabel(spec.label);
    setTempValue(spec.value);
  };

  // Grouped mode columns
  const groupedColumns = [
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      width: '30%',
    },
    {
      title: 'Items Count',
      dataIndex: 'items',
      key: 'itemsCount',
      width: '20%',
      render: (items) => items ? items.length : 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record, index) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              // TODO: Edit section
              message.info('Edit section coming soon');
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              const updated = sections.filter((_, idx) => idx !== index);
              setSections(updated);
              onChange(updated);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="specification-editor">
      {/* Mode selector */}
      <div style={{ marginBottom: '16px' }}>
        <Select
          value={mode}
          onChange={handleModeChange}
          style={{ width: 200 }}
          options={[
            { label: '📋 Chế độ đơn giản', value: 'simple' },
            { label: '📊 Chế độ nhóm (sections)', value: 'grouped' },
          ]}
        />
      </div>

      <Divider />

      {/* Simple mode */}
      {mode === 'simple' && (
        <div>
          <Card title="Thêm Thông Số" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={10}>
                <Input
                  placeholder="VD: Pin, Trọng lượng, Kích thước, ..."
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  onPressEnter={() => {
                    // Focus vào value field khi enter trên label
                    document.querySelector('[data-spec-value-input]')?.focus();
                  }}
                />
              </Col>
              <Col xs={24} sm={10}>
                <Input.TextArea
                  data-spec-value-input
                  placeholder="VD: 5000 mAh (Enter để xuống dòng, không submit)"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={3}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
              </Col>
              <Col xs={24} sm={4}>
                <Button
                  type="primary"
                  icon={editingIndex !== null ? <EditOutlined /> : <PlusOutlined />}
                  onClick={handleAddOrUpdateSpec}
                  block
                  style={{ height: '100%' }}
                >
                  {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Col>
            </Row>
          </Card>

          {simpleSpecs.length > 0 ? (
            <Table
              dataSource={simpleSpecs.map((spec, idx) => ({ ...spec, key: idx }))}
              columns={[
                {
                  title: 'Thông Số',
                  dataIndex: 'label',
                  key: 'label',
                  width: '30%',
                  render: (text) => <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</span>,
                },
                {
                  title: 'Giá Trị',
                  dataIndex: 'value',
                  key: 'value',
                  width: '50%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'pre-wrap', 
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      {text}
                    </div>
                  ),
                },
                {
                  title: 'Hành Động',
                  key: 'actions',
                  width: '20%',
                  render: (_, record, index) => (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSpec(index)}
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSpec(index)}
                      />
                    </Space>
                  ),
                },
              ]}
              pagination={false}
              bordered
              size="small"
            />
          ) : (
            <Empty description="Chưa có thông số kỹ thuật" />
          )}
        </div>
      )}

      {/* Grouped mode */}
      {mode === 'grouped' && (
        <div>
          <Card title="Thêm Section" size="small" style={{ marginBottom: '16px' }}>
            <Info>{sections.length} section(s)</Info>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                const newSection = { section: 'Section mới', items: [] };
                const updated = [...sections, newSection];
                setSections(updated);
                onChange(updated);
                message.success('Thêm section mới');
              }}
              style={{ marginTop: '8px' }}
            >
              Thêm Section Mới
            </Button>
          </Card>

          {sections.length > 0 ? (
            <Table
              dataSource={sections.map((section, idx) => ({ ...section, key: idx }))}
              columns={groupedColumns}
              pagination={false}
              bordered
              size="small"
            />
          ) : (
            <Empty description="Chưa có section nào" />
          )}
        </div>
      )}
    </div>
  );
};

// Simple info component
const Info = ({ children }) => (
  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
    {children}
  </div>
);

export default SpecificationEditor;
