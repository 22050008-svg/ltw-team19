import React, { useState, useEffect } from 'react';
// 1. Import thêm Row và Col từ 'antd'
import {Button, Modal, Form, Input, Select, InputNumber, message, Spin, Row, Col, Typography, Card, AutoComplete, Tabs, Steps, Divider } from 'antd';
import { ShoppingOutlined, TagsOutlined, DollarOutlined, AppstoreOutlined, CheckCircleOutlined, PictureOutlined } from '@ant-design/icons';
import productService from '../../../Services/ProductService';
import productAdminService from '../../../Services/adminservice/ProductAdminService';
import categoryService from '../../../Services/CategoryService';
import CodeEditor from './CodeEditor'; 
import ProductImageManager from './ProductImageManager.jsx';
import SimpleImageUploader from './SimpleImageUploader'; // NEW: Simple image uploader for new products
import AttributeSelector from './AttributeSelector'; 
import VariantManager from './VariantManager';
import CategorySelector from './CategorySelector'; // NEW: Import CategorySelector
import SpecificationEditor from './SpecificationEditor'; // NEW: Import SpecificationEditor
import './ProductModal.css'; // NEW: Import CSS
const { Option } = Select;
const { TextArea } = Input;

const ProductModal = ({ open, onClose, onSuccess, editingProduct }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]); // NEW: Images to upload after creating product
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [variants, setVariants] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // NEW: Track wizard step
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null); // NEW: Store selected category info
  
  const htmlDescriptionValue = Form.useWatch('htmlDescription', form);
  const usageGuideValue = Form.useWatch('usageGuide', form);
  const attributesValue = Form.useWatch('attributes', form);
  const categoryIdValue = Form.useWatch('categoryId', form);
  const nameValue =Form.useWatch('name', form);
  const priceValue = Form.useWatch('price', form);
  const costPriceValue = Form.useWatch('costPrice', form);
  const skuValue = Form.useWatch('sku', form);
  
  const isEditing = !!editingProduct;
  const modalTitle = isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới";

  // Handle category change
  useEffect(() => {
    if (categoryIdValue && categoryIdValue !== form.getFieldValue('categoryId')) {
      setSelectedAttributes({});
      setVariants([]);
    }
  }, [categoryIdValue, form]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const categoriesRes = await productService.getCategories();
          setCategories(categoriesRes.data.data || []);
        } catch (error) {
          message.error("Không thể tải danh sách danh mục.");
        }
      };
      fetchData();

      if (isEditing && editingProduct?.id) {
        // Lấy default variant (variant đầu tiên)
        const defaultVariant = editingProduct.variants && editingProduct.variants.length > 0 
          ? editingProduct.variants[0] 
          : {};
        
        // ⭐ Load attributes - prioritize variant attributes, fallback to product attributes
        let loadedAttributes = {};
        
        if (defaultVariant.attributes && Object.keys(defaultVariant.attributes).length > 0) {
          // Use variant-level attributes if available
          loadedAttributes = defaultVariant.attributes;
          console.log('[ProductModal] Loading variant-level attributes:', loadedAttributes);
        } else if (editingProduct.attributes && Object.keys(editingProduct.attributes).length > 0) {
          // Fallback to product-level attributes
          loadedAttributes = editingProduct.attributes;
          console.log('[ProductModal] Fallback to product-level attributes:', loadedAttributes);
        } else {
          console.log('[ProductModal] No attributes found for either variant or product');
        }
        
        setSelectedAttributes(loadedAttributes);
        
        // Set all variants from edited product
        if (editingProduct.variants && editingProduct.variants.length > 0) {
          setVariants(editingProduct.variants.map((v, idx) => ({
            id: v.id || `variant-${idx}`,
            sku: v.sku,
            price: parseFloat(v.price || 0),
            costPrice: parseFloat(v.cost_price || 0),
            stockQuantity: parseInt(v.stock_quantity || 0, 10),
            attributes: v.attributes || {},
          })));
        }
        
        form.setFieldsValue({
          name: editingProduct.name,
          description: editingProduct.description,
          htmlDescription: editingProduct.htmlDescription,
          usageGuide: editingProduct.usageGuide,
          specifications: editingProduct.specifications || [],
          categoryId: editingProduct.categoryId,
          brandId: editingProduct.brandId,
          attributes: editingProduct.attributes ? JSON.stringify(editingProduct.attributes, null, 2) : '',
          sku: defaultVariant.sku,
          price: parseFloat(defaultVariant.price || 0),
          costPrice: parseFloat(defaultVariant.cost_price || 0),
          stockQuantity: parseInt(defaultVariant.stock_quantity || 0, 10),
        });
        
        // Fetch full product details to get productImages
        const fetchFullProductDetails = async () => {
          try {
            console.log("ProductModal: Fetching full product details for ID:", editingProduct.id);
            const response = await productService.getProductById(editingProduct.id);
            console.log("ProductModal: API Response:", response);
            const fullProduct = response.data.data || response.data;
            console.log("ProductModal: fullProduct:", fullProduct);
            console.log("ProductModal: fullProduct.productImages:", fullProduct.productImages);
            console.log("ProductModal: fullProduct.specifications:", fullProduct.specifications);
            console.log("ProductModal: fullProduct.attributes:", fullProduct.attributes);
            console.log("ProductModal: fullProduct.variants[0]?.attributes:", fullProduct.variants?.[0]?.attributes);
            
            setProductImages(fullProduct.productImages || []);
            
            // ⭐ UPDATE: Also update form with specifications, htmlDescription and attributes from API
            form.setFieldsValue({
              htmlDescription: fullProduct.htmlDescription || '',
              usageGuide: fullProduct.usageGuide || '',
              specifications: fullProduct.specifications || []
            });
            
            // ⭐ UPDATE selected attributes if API returns different values
            if (fullProduct.attributes && Object.keys(fullProduct.attributes).length > 0) {
              console.log('[ProductModal] Updating selectedAttributes from API:', fullProduct.attributes);
              setSelectedAttributes(fullProduct.attributes);
            }
          } catch (error) {
            console.warn("Không thể tải ảnh sản phẩm:", error);
            setProductImages(editingProduct.productImages || []);
          }
        };
        
        fetchFullProductDetails();
      } else {
        form.resetFields();
        setProductImages([]);
        setSelectedAttributes({});
        setVariants([]);
      }
    }
  }, [open, editingProduct, form, isEditing]);

  const handleFinish = async (values) => {
    setLoading(true);
    
    console.log('[ProductModal] handleFinish - Form values received:', {
      name: values.name,
      hasSpecifications: !!values.specifications,
      specifications: values.specifications,
      specificationsLength: Array.isArray(values.specifications) ? values.specifications.length : 'N/A',
      selectedAttributes: selectedAttributes,
      selectedAttributesKeys: Object.keys(selectedAttributes)
    });
    
    // Validation: Phải có ít nhất một variant
    if (variants.length === 0) {
      message.error('Vui lòng thêm ít nhất một variant');
      setLoading(false);
      return;
    }

    // ✅ NEW: Validation - Thương Hiệu là bắt buộc
    if (!selectedAttributes['Thương Hiệu']) {
      message.error('⚠️ Vui lòng chọn THƯƠNG HIỆU trong Bước 3');
      setLoading(false);
      return;
    }

    // Tạo một bản sao của values để xử lý
    const processedValues = { ...values };

    // Nếu có selected attributes, thêm chúng vào attributes object
    if (Object.keys(selectedAttributes).length > 0) {
      processedValues.attributes = selectedAttributes;
    } else if (processedValues.attributes && typeof processedValues.attributes === 'string') {
      // Chuyển đổi chuỗi JSON từ CodeEditor thành object trước khi gửi đi
      try {
        processedValues.attributes = JSON.parse(processedValues.attributes);
      } catch (e) {
        message.error('Lỗi cú pháp trong Cấu trúc thuộc tính JSON. Vui lòng kiểm tra lại');
        setLoading(false);
        return;
      }
    }

    // Thêm variants vào payload
    processedValues.variants = variants;

    console.log('[ProductModal] handleFinish - Processed values before submit:', {
      name: processedValues.name,
      hasSpecifications: !!processedValues.specifications,
      specifications: processedValues.specifications,
      hasHtmlDescription: !!processedValues.htmlDescription,
      hasUsageGuide: !!processedValues.usageGuide
    });

    // Validation: costPrice không được lớn hơn price
    const defaultVariant = variants[0];
    if (defaultVariant.costPrice && defaultVariant.price && defaultVariant.costPrice > defaultVariant.price) {
      message.error('Giá vốn không thể lớn hơn giá bán');
      setLoading(false);
      return;
    }

    try {
      let productId;
      
      if (isEditing) {
        console.log('[ProductModal] Updating product ID:', editingProduct.id);
        await productAdminService.updateProduct(editingProduct.id, processedValues);
        message.success("Cập nhật sản phẩm thành công");
        productId = editingProduct.id;
      } else {
        const response = await productAdminService.createProduct(processedValues);
        message.success("Tạo sản phẩm thành công");
        // Extract product ID from response
        productId = response?.data?.data?.id || response?.data?.id;
      }

      // NEW: Upload pending images if any
      if (!isEditing && pendingImages.length > 0 && productId) {
        message.loading('Đang tải ảnh lên...');
        
        try {
          for (const image of pendingImages) {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('productImage', image.file); // image.file is the File object
            
            // Upload using raw axios call to support multipart/form-data
            await productAdminService.updateProductImage(productId, formData);
          }
          message.success(`✅ Đã tải ${pendingImages.length} ảnh lên`);
          setPendingImages([]); // Clear pending images after upload
        } catch (uploadError) {
          message.warning('⚠️ Sản phẩm tạo thành công, nhưng lỗi tải ảnh: ' + (uploadError.message || 'Unknown error'));
          console.error("Image upload error:", uploadError);
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin";
      message.error(errorMessage);
      console.error("Product operation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={1300}
      destroyOnClose
      bodyStyle={{ maxHeight: '75vh', overflowY: 'auto' }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* STEP 1: Basic Info & Category */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingOutlined />
                <span>Bước 1: Thông Tin Cơ Bản</span>
                {nameValue && categoryIdValue && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              </div>
            }
            size="large"
            style={{ marginBottom: '20px' }}
            className="product-form-card"
          >
            <Form.Item 
              name="name" 
              label="Tên sản phẩm *" 
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm.' }]}
            >
              <Input 
                placeholder="VD: Samsung RT92 300L Tủ Lạnh Nơi Cơm"
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="sku" 
                  label="Mã SKU *" 
                  rules={[{ required: true, message: 'Vui lòng nhập SKU.' }]}
                >
                  <Input 
                    placeholder="VD: RF-SAM-300L"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* NOTE: Thương Hiệu giờ chỉ lấy từ Thuộc Tính (STEP 3) - không còn ô nhập riêng */}

            {/* NEW: Visual Category Selector */}
            <Form.Item 
              name="categoryId" 
              label="Danh Mục *"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục.' }]}
            >
              <div style={{ marginTop: '8px' }}>
                <CategorySelector 
                  onSelect={(categoryId, categoryData) => {
                    form.setFieldValue('categoryId', categoryId);
                    setSelectedCategoryInfo(categoryData);
                  }}
                  selectedCategoryId={categoryIdValue}
                  typeFilter="appliance"
                />
              </div>
            </Form.Item>

            <Form.Item name="description" label="Mô Tả Ngắn">
              <TextArea 
                rows={2} 
                placeholder="Mô tả nhỏ cho sản phẩm (hiển thị trên danh sách)"
              />
            </Form.Item>

            {/* NEW: Image Uploader for new products */}
            {!isEditing && (
              <SimpleImageUploader 
                onImagesChange={(images) => setPendingImages(images)}
                existingImages={pendingImages}
              />
            )}
          </Card>

          {/* STEP 2: Pricing & Stock */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarOutlined />
                <span>Bước 2: Giá & Tồn Kho</span>
                {priceValue && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              </div>
            }
            size="large"
            style={{ marginBottom: '20px' }}
            className="product-form-card"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item 
                  name="price" 
                  label="Giá Bán (VND) *" 
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán.' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    size="large"
                    placeholder="15000000"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item 
                  name="costPrice" 
                  label="Giá Vốn (VND)" 
                  help="Để trống nếu không cần"
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    size="large"
                    placeholder="12000000"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item 
                  name="stockQuantity" 
                  label="Tồn Kho *" 
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng.' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    size="large"
                    placeholder="50"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* STEP 3: Attributes & Variants */}
          {categoryIdValue && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TagsOutlined />
                  <span>Bước 3: Thuộc Tính & Biến Thể</span>
                  {variants.length > 0 && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                </div>
              }
              size="large"
              style={{ marginBottom: '20px' }}
              className="product-form-card"
            >
              <AttributeSelector 
                categoryId={categoryIdValue}
                onAttributesChange={(attrs) => setSelectedAttributes(attrs)}
                existingAttributes={selectedAttributes}
              />

              <VariantManager
                productId={editingProduct?.id}
                selectedAttributes={selectedAttributes}
                price={priceValue}
                costPrice={costPriceValue}
                sku={skuValue}
                existingVariants={variants}
                onVariantsChange={(v) => setVariants(v)}
                isEditing={isEditing}
              />
            </Card>
          )}

          {/* STEP 4: Description HTML */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝 Bước 4: Mô Tả Chi Tiết (HTML - Optional)</span>
              </div>
            }
            size="large"
            style={{ marginBottom: '20px' }}
            className="product-form-card"
          >
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col span={12}>
                <Form.Item name="htmlDescription" noStyle>
                  <CodeEditor placeholder="Nhập HTML mô tả chi tiết sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Card title="Xem Trước Mô Tả" size="small" style={{ height: '100%' }}>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlDescriptionValue || '<em>Chưa có nội dung</em>' }}
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider>Hướng Dẫn Sử Dụng (Optional)</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="usageGuide" 
                  label="Hướng Dẫn Sử Dụng (HTML)"
                  help="Nhập hướng dẫn sử dụng sản phẩm dưới định dạng HTML"
                  noStyle
                >
                  <CodeEditor placeholder="Hướng dẫn sử dụng sản phẩm..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Card title="Xem Trước Hướng Dẫn" size="small" style={{ height: '100%' }}>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: usageGuideValue || '<em>Chưa có nội dung</em>' }}
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* STEP 5: Thông Số Kỹ Thuật */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊 Bước 5: Thông Số Kỹ Thuật (Optional)</span>
              </div>
            }
            size="large"
            style={{ marginBottom: '20px' }}
            className="product-form-card"
          >
            <Form.Item 
              name="specifications"
              label="Thông Số Kỹ Thuật"
              help="Quản lý thông số kỹ thuật sản phẩm. Bạn có thể sử dụng chế độ đơn giản hoặc nhóm theo section."
            >
              <SpecificationEditor />
            </Form.Item>
          </Card>

          {/* Advanced Tab: JSON */}
          <Card 
            title="⚙️ Nâng Cao: JSON (Tùy Chọn)"
            size="large"
            className="product-form-card"
            collapsible
            defaultActiveKey={[]}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="attributes" 
                  label="Dữ liệu JSON"
                  help="Nhập cấu trúc JSON cho các biến thể"
                > 
                  <CodeEditor language="json" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Card title="Xem Trước" size="small">
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '300px', overflowY: 'auto' }}>
                    {attributesValue || 'Chưa có dữ liệu...'}
                  </pre>
                </Card>
              </Col>
            </Row>
          </Card>
        </Form>

        {isEditing && editingProduct?.id && (
          <ProductImageManager 
            productId={editingProduct.id}
            productImages={productImages}
            onImagesUpdated={(updatedImages) => {
              setProductImages(updatedImages);
              onSuccess();
            }}
            isEditing={isEditing}
          />
        )}
      </Spin>
    </Modal>
  );
};

export default ProductModal;