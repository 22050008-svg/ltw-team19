import React, { useState, useEffect } from 'react';
import { Upload, Button, Card, Row, Col, Image, Spin, message, Popconfirm, Space } from 'antd';
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import productAdminService from '../../../Services/adminservice/ProductAdminService';
import './ProductImageManager.css';

/**
 * Component quản lý ảnh sản phẩm
 * - Hiển thị danh sách ảnh hiện có
 * - Upload nhiều ảnh mới
 * - Xóa ảnh
 */
const ProductImageManager = ({ 
  productId, 
  productImages = [], 
  onImagesUpdated,
  isEditing = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(productImages || []);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Pending uploads
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';

  // Watch for changes in productImages prop and update state
  useEffect(() => {
    console.log("ProductImageManager: productImages prop changed:", productImages);
    if (productImages && Array.isArray(productImages)) {
      setImages(productImages);
    }
  }, [productImages]);

  // Xây dựng full URL cho ảnh
  const getFullImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
  };

  // Xử lý upload ảnh (save to base64)
  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }

    // Đọc file thành base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        base64: reader.result,
        name: file.name,
        fromServer: false
      }]);
      message.success(`${file.name} sẵn sàng để tải lên`);
    };
    return false;
  };

  // Xử lý upload ảnh mới lên server
  const handleUploadImage = async (fileData) => {
    if (!productId) {
      message.error("Bạn cần lưu sản phẩm trước khi tải ảnh lên");
      return;
    }

    setUploading(true);
    try {
      const response = await productAdminService.updateProductImage(productId, fileData.base64);
      console.log("📤 Upload response full:", response);
      console.log("📦 response.data:", response.data);
      console.log("📋 response.data.data:", response.data?.data);
      console.log("🖼️ response.data.data.productImages:", response.data?.data?.productImages);

      // Cập nhật danh sách ảnh từ response
      if (response.data.data?.productImages) {
        console.log("✅ ProductImages found! Count:", response.data.data.productImages.length);
        setImages(response.data.data.productImages);
        if (onImagesUpdated) {
          onImagesUpdated(response.data.data.productImages);
        }
        message.success('Tải ảnh thành công!');

        // Xóa file này từ pending uploads
        setUploadedFiles(prev => prev.filter(f => f.id !== fileData.id));
      } else {
        console.warn("❌ ProductImages NOT found in response!");
        console.warn("Response.data structure:", Object.keys(response.data || {}));
        console.warn("Response.data.data structure:", Object.keys(response.data?.data || {}));
        message.warning('Ảnh được tải lên nhưng không thể cập nhật danh sách (response structure mismatch)');
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      message.error(error.response?.data?.message || 'Tải ảnh thất bại');
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setUploading(false);
    }
  };

  // Xử lý xóa ảnh
  const handleDeleteImage = async (imageId) => {
    if (!productId) {
      message.error("Product ID không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Deleting image:', { productId, imageId });
      
      const response = await productAdminService.deleteProductImage(productId, imageId);
      console.log("📤 Delete response full:", response);
      console.log("📦 response.data:", response.data);
      console.log("📋 response.data.data:", response.data?.data);
      console.log("🖼️ response.data.data.productImages:", response.data?.data?.productImages);

      // Cập nhật danh sách ảnh từ response
      if (response.data.data?.productImages) {
        console.log("✅ ProductImages found! Count:", response.data.data.productImages.length);
        setImages(response.data.data.productImages);
        if (onImagesUpdated) {
          onImagesUpdated(response.data.data.productImages);
        }
        message.success('Xóa ảnh thành công!');
      } else {
        console.warn("❌ ProductImages NOT found in response!");
        console.warn("Response.data structure:", Object.keys(response.data || {}));
        console.warn("Response.data.data structure:", Object.keys(response.data?.data || {}));
        message.warning('Ảnh được xóa nhưng không thể cập nhật danh sách (response structure mismatch)');
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        fullError: error
      });
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Xóa ảnh thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Xóa file pending
  const handleRemovePendingFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="product-image-manager">
      <Card 
        title={`Quản lý ảnh sản phẩm (${images?.length || 0} ảnh)`}
        size="small"
        style={{ marginTop: '16px' }}
      >
        <Spin spinning={loading}>
          {/* Danh sách ảnh hiện có từ server */}
          {images && images.length > 0 && (
            <div className="existing-images-section">
              <h4>Ảnh hiện có ({images.length})</h4>
              <Row gutter={[12, 12]}>
                {images.map(img => (
                  <Col key={img.id} xs={12} sm={8} md={6} lg={4}>
                    <div className="image-card">
                      <div className="image-wrapper">
                        <Image
                          width="100%"
                          height={120}
                          src={getFullImageUrl(img.imageUrl)}
                          alt={`Product image ${img.id}`}
                          preview={true}
                          style={{ objectFit: 'cover' }}
                          placeholder={
                            <Spin 
                              indicator={<LoadingOutlined style={{ fontSize: 20 }} />} 
                            />
                          }
                        />
                        {img.isPrimary && (
                          <div className="primary-badge">Ảnh chính</div>
                        )}
                      </div>
                      <div className="image-actions">
                        <Popconfirm
                          title="Xóa ảnh"
                          description="Bạn chắc chắn muốn xóa ảnh này?"
                          onConfirm={() => handleDeleteImage(img.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button 
                            danger 
                            size="small" 
                            block
                            icon={<DeleteOutlined />}
                            disabled={loading || uploading}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Pending uploads */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="pending-uploads-section" style={{ marginTop: '20px' }}>
              <h4>Ảnh chờ tải lên ({uploadedFiles.length})</h4>
              <Row gutter={[12, 12]}>
                {uploadedFiles.map(file => (
                  <Col key={file.id} xs={12} sm={8} md={6} lg={4}>
                    <div className="image-card">
                      <div className="image-wrapper">
                        <Image
                          width="100%"
                          height={120}
                          src={file.base64}
                          alt={file.name}
                          preview={true}
                          style={{ objectFit: 'cover', opacity: 0.6 }}
                        />
                        <div className="pending-badge">Chờ...</div>
                      </div>
                      <div className="image-actions">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Button 
                            type="primary"
                            size="small" 
                            block
                            loading={uploading}
                            onClick={() => handleUploadImage(file)}
                            disabled={!isEditing}
                          >
                            Tải lên
                          </Button>
                          <Button 
                            danger 
                            size="small" 
                            block
                            onClick={() => handleRemovePendingFile(file.id)}
                            disabled={uploading}
                          >
                            Hủy
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Upload new images */}
          <div className="upload-section" style={{ marginTop: '20px' }}>
            <h4>Thêm ảnh mới</h4>
            <Upload
              listType="picture-card"
              beforeUpload={handleBeforeUpload}
              multiple
              showUploadList={false}
              disabled={!isEditing}
              accept="image/*"
              maxCount={10}
            >
              <Button 
                icon={<PlusOutlined />}
                disabled={!isEditing}
              >
                Chọn ảnh
              </Button>
            </Upload>
            {!isEditing && (
              <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                Bạn cần lưu sản phẩm trước khi có thể tải ảnh lên
              </p>
            )}
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default ProductImageManager;
