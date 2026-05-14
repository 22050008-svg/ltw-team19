import React, { useState, useCallback } from 'react';
import { Upload, Card, Row, Col, Image, Button, Space, Spin, message, Popconfirm, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import './SimpleImageUploader.css';

/**
 * Simple Image Uploader for Product Creation Form
 * Được dùng khi tạo sản phẩm mới (chưa có productId)
 * Lưu trữ File objects để upload sau khi tạo sản phẩm
 */
const SimpleImageUploader = ({ onImagesChange = () => {}, existingImages = [] }) => {
  const [images, setImages] = useState(existingImages || []);
  const [uploading, setUploading] = useState(false);

  // Xử lý khi chọn file ảnh
  const handleBeforeUpload = useCallback((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('❌ Chỉ có thể tải lên file ảnh (PNG, JPG, GIF...)');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('❌ Ảnh phải nhỏ hơn 5MB');
      return Upload.LIST_IGNORE;
    }

    // Lưu File object (không chuyển đổi base64)
    const newImage = {
      id: Date.now() + Math.random(), // Unique ID
      file: file, // Lưu file object
      name: file.name,
      isNew: true, // Đánh dấu ảnh mới
      size: file.size,
      type: file.type,
      // Tạo preview URL để hiển thị
      preview: URL.createObjectURL(file)
    };
    
    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    message.success(`✅ Đã thêm ảnh: ${file.name}`);
    
    return false;
  }, [images, onImagesChange]);

  // Xóa ảnh
  const handleRemoveImage = useCallback((imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    message.success('✅ Đã xóa ảnh');
  }, [images, onImagesChange]);

  // Get image URL để preview
  const getImageUrl = (image) => {
    if (image.preview) return image.preview;
    if (image.url) return image.url;
    return 'https://via.placeholder.com/150';
  };

  return (
    <Card 
      title={`📸 Hình Ảnh Sản Phẩm (${images.length})`}
      size="small"
      style={{ marginBottom: '16px' }}
      className="simple-image-uploader"
    >
      {/* Upload Area */}
      <div style={{ marginBottom: '16px' }}>
        <Upload.Dragger
          beforeUpload={handleBeforeUpload}
          multiple={true}
          accept="image/*"
          showUploadList={false}
          style={{
            padding: '20px',
            border: '2px dashed #d9d9d9',
            borderRadius: '6px',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            <UploadOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
          </p>
          <p style={{ color: '#666' }}>Click hoặc kéo thả ảnh vào đây</p>
          <p style={{ fontSize: '12px', color: '#999' }}>Hỗ trợ: PNG, JPG, GIF (tối đa 5MB)</p>
        </Upload.Dragger>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {images.map((image, index) => (
            <div 
              key={image.id} 
              style={{
                position: 'relative',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #ddd',
                aspectRatio: '1/1'
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Product ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* Overlay with delete button */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'all 0.3s',
                  ':hover': { opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 1;
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = 0;
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                }}
              >
                <Popconfirm
                  title="Xóa ảnh?"
                  description="Bạn có chắc muốn xóa ảnh này?"
                  onConfirm={() => handleRemoveImage(image.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okType="danger"
                >
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>
              </div>

              {image.isNew && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: '#52c41a',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  NEW
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty 
          description="Chưa có ảnh nào"
          style={{ margin: '20px 0' }}
        />
      )}

      {images.length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
          💡 Tip: {images.length} ảnh sẽ được tải lên sau khi tạo sản phẩm
        </div>
      )}
    </Card>
  );
};

export default SimpleImageUploader;
