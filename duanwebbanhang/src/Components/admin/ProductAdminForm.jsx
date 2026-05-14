import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, message, Spin, Row, Col, Alert, Space } from 'antd';
import { SaveOutlined, ReloadOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import productService from '../../Services/ProductService';
import ProductImageManager from '../adminpage/productmanagement/ProductImageManager';

/**
 * ProductAdminForm - Form quản lý thông tin sản phẩm
 * - Mô tả HTML
 * - Thông số kỹ thuật (JSON)
 * - Hướng dẫn sử dụng HTML
 * 
 * Sử dụng: http://localhost:3000/admin/products/1/edit
 */

const ProductAdminForm = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [jsonError, setJsonError] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        const productData = response.data?.data || response.data;
        
        if (productData) {
          setProduct(productData);
          setProductImages(productData.productImages || []);
          form.setFieldsValue({
            name: productData.name,
            description: productData.description,
            htmlDescription: productData.htmlDescription || '',
            specifications: productData.specifications 
              ? JSON.stringify(productData.specifications, null, 2) 
              : '',
            usageGuide: productData.usageGuide || '',
          });
        }
      } catch (err) {
        message.error('❌ Không thể tải sản phẩm: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, form]);

  // Handle images updated from ProductImageManager
  const handleImagesUpdated = (updatedImages) => {
    setProductImages(updatedImages);
  };

  // Validate & Submit
  const onFinish = async (values) => {
    try {
      setJsonError(null);
      
      // Validate JSON specifications
      let specs = [];
      if (values.specifications && values.specifications.trim()) {
        try {
          specs = JSON.parse(values.specifications);
        } catch (err) {
          setJsonError('❌ JSON Thông số không hợp lệ: ' + err.message);
          return;
        }
      }

      setSubmitting(true);

      // Call API to update product
      await productService.updateProduct(id, {
        name: values.name,
        description: values.description,
        htmlDescription: values.htmlDescription,
        specifications: specs,
        usageGuide: values.usageGuide,
      });

      message.success('✅ Cập nhật sản phẩm thành công!');
    } catch (err) {
      message.error('❌ Lỗi cập nhật: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle JSON validation while typing
  const handleSpecsChange = (e) => {
    const value = e.target.value;
    if (!value.trim()) {
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError('⚠️ JSON không hợp lệ: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu sản phẩm..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: '📝 Thông Tin Cơ Bản',
      children: (
        <Form layout="vertical">
          <Form.Item
            label="Tên Sản Phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input 
              placeholder="VD: Máy Lạnh Panasonic 1.5 HP CU/CS-PU12AKH-8"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mô Tả (Ngắn)"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Mô tả ngắn gọn về sản phẩm, 100-200 ký tự"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Alert
            message="💡 Thông Tin"
            description="Tên và mô tả này sẽ hiển thị trên trang tìm kiếm và trang danh sách sản phẩm"
            type="info"
            style={{ marginTop: 16 }}
          />
        </Form>
      ),
    },
    {
      key: 'html-description',
      label: '🌐 Mô Tả Chi Tiết (HTML)',
      children: (
        <Form layout="vertical">
          <Alert
            message="Hướng Dẫn"
            description={
              <div>
                <p>✓ Hỗ trợ HTML tag: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;img&gt;, &lt;table&gt;</p>
                <p>✓ Ảnh: Dùng &lt;img src="/images/product.jpg" style="width:100%;" /&gt;</p>
                <p>✓ Tự động xử lý URL hình ảnh</p>
              </div>
            }
            type="success"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Nội Dung HTML"
            name="htmlDescription"
          >
            <Input.TextArea 
              rows={12} 
              placeholder={`<h2>Máy Lạnh Panasonic Inverter 1.5 Hp</h2>
<p>Sản phẩm công nghệ hiện đại với nhiều tính năng tiết kiệm điện.</p>

<h3>Ưu điểm nổi bật</h3>
<ul>
  <li>Tiết kiệm điện lên đến 40%</li>
  <li>Làm lạnh nhanh, chóng mặt</li>
  <li>Hộc lọc giữ sạch không khí</li>
</ul>

<h3>Thông số kỹ thuật</h3>
<img src="/images/ac-specs.jpg" style="width:100%; margin:20px 0;" />`}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>

          <Alert
            message="Mẹo"
            description="Copy mẫu HTML từ GUIDE_NON_DEVELOPER.md (Ví dụ 1, 2, 3)"
            type="warning"
          />
        </Form>
      ),
    },
    {
      key: 'specifications',
      label: '⚙️ Thông Số Kỹ Thuật (JSON)',
      children: (
        <Form layout="vertical">
          <Alert
            message="Hướng Dẫn JSON"
            description={
              <div>
                <p><strong>Format với Sections (khuyến cáo):</strong></p>
                <code style={{ display: 'block', background: '#f5f5f5', padding: 8 }}>
                  [{'{'}
                    <br/>&nbsp;&nbsp;"section": "Tên section",
                    <br/>&nbsp;&nbsp;"items": [
                    <br/>&nbsp;&nbsp;&nbsp;&nbsp;{'{'}return "label": "...", "value": "..." {'}'}
                    <br/>&nbsp;&nbsp;]
                    <br/>{'}'}, ...]
                </code>
                <p style={{ marginTop: 8 }}>
                  ✓ Mỗi section là 1 bảng<br/>
                  ✓ Trong items, mỗi object có label + value
                </p>
              </div>
            }
            type="success"
            style={{ marginBottom: 16 }}
          />

          {jsonError && (
            <Alert
              message={jsonError}
              type="error"
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Thông Số (JSON)"
            name="specifications"
          >
            <Input.TextArea 
              rows={14} 
              placeholder={`[
  {
    "section": "Thông tin sản phẩm",
    "items": [
      { "label": "Công suất", "value": "1.5 HP - 12.000 BTU" },
      { "label": "Phạm vi làm lạnh", "value": "15-20m²" },
      { "label": "Gas", "value": "R32" }
    ]
  },
  {
    "section": "Hiệu suất",
    "items": [
      { "label": "Độ ồn trung bình", "value": "48 dB" },
      { "label": "Tiêu thụ điện", "value": "0.5 kW" }
    ]
  }
]`}
              style={{ fontFamily: 'monospace', fontSize: 11 }}
              onChange={handleSpecsChange}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Alert
                message="✓ JSON hợp lệ"
                type="success"
                style={{ display: jsonError ? 'none' : 'block' }}
              />
            </Col>
            <Col span={12}>
              <Space>
                <FileTextOutlined /> 
                <a href="https://jsonlint.com" target="_blank" rel="noopener noreferrer">
                  Kiểm tra JSON online
                </a>
              </Space>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'usage-guide',
      label: '📖 Hướng Dẫn Sử Dụng (HTML)',
      children: (
        <Form layout="vertical">
          <Alert
            message="Hướng Dẫn"
            description={
              <div>
                <p>✓ Hỗ trợ HTML, Markdown, plain text</p>
                <p>✓ Sử dụng &lt;h3&gt;, &lt;ol&gt;, &lt;ul&gt; cho cấu trúc</p>
                <p>✓ Thêm &lt;table&gt; cho bảng tính năng</p>
              </div>
            }
            type="success"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Nội Dung HTML"
            name="usageGuide"
          >
            <Input.TextArea 
              rows={12} 
              placeholder={`<h2>Cách Sử Dụng Máy Lạnh</h2>

<h3>Bước 1: Chuẩn bị</h3>
<p>Tắt máy, đóng cửa và cửa sổ phòng.</p>

<h3>Bước 2: Bật máy</h3>
<ol>
  <li>Nhấn nút Power trên điều khiển từ xa</li>
  <li>Chọn chế độ "Cool" (làm lạnh)</li>
  <li>Đặt nhiệt độ 24-26°C</li>
  <li>Chọn tốc độ quạt "Auto"</li>
</ol>

<h3>Bước 3: Bảo dưỡng</h3>
<p><strong>Hàng tuần:</strong> Vệ sinh bộ lọc</p>
<p><strong>Hàng tháng:</strong> Kiểm tra hoạt động</p>`}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>

          <Alert
            message="Tuỳ chọn"
            description="Trường này không bắt buộc. Để trống nếu không có hướng dẫn."
            type="info"
          />
        </Form>
      ),
    },
    {
      key: 'images',
      label: '🖼️ Quản Lý Ảnh',
      children: (
        <div>
          <Alert
            message="Quản lý ảnh sản phẩm"
            description={
              <div>
                <p>✓ Tải lên các ảnh cho sản phẩm</p>
                <p>✓ Xóa ảnh không cần thiết</p>
                <p>✓ Các ảnh sẽ được lưu vào cơ sở dữ liệu</p>
              </div>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />
          <ProductImageManager 
            productId={parseInt(id)}
            productImages={productImages}
            onImagesUpdated={handleImagesUpdated}
            isEditing={true}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>✏️ Quản Lý Thông Tin Sản Phẩm</span>
            {product && <span style={{ color: '#666', fontSize: 14 }}>({product.name})</span>}
          </Space>
        }
        style={{ maxWidth: 1200, margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          requiredMark="optional"
        >
          <Tabs 
            items={tabItems}
            defaultActiveKey="basic"
          />

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={16}>
              <Col>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  💾 Lưu Thay Đổi
                </Button>
              </Col>
              <Col>
                <Button 
                  htmlType="reset" 
                  size="large"
                  icon={<ReloadOutlined />}
                >
                  🔄 Đặt Lại
                </Button>
              </Col>
            </Row>

            <Alert
              message="Hướng Dẫn Sử Dụng"
              description={
                <ol style={{ marginTop: 8 }}>
                  <li>Nhập hoặc chỉnh sửa thông tin sản phẩm ở các tab</li>
                  <li>Kiểm tra JSON (phải có dấu ngoặc kép đúng)</li>
                  <li>Click "💾 Lưu Thay Đổi" khi hoàn tất</li>
                  <li>Xem trang sản phẩm để kiểm tra: /products/{id}</li>
                </ol>
              }
              type="info"
              style={{ marginTop: 24 }}
            />
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductAdminForm;
