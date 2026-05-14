import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './ReviewImageSelector.css';

/**
 * Component to upload images for review
 * Only allows users to upload their own images, not use product images
 */
const ReviewImageSelector = ({ onImagesSelected, existingImages = [] }) => {
  const [uploadedUrls, setUploadedUrls] = useState([]); // Store only NEW uploaded images (base64)
  const [displayUrls, setDisplayUrls] = useState(existingImages || []); // Store existing images for display only

  console.log('[ReviewImageSelector] Initialized with:', { existingImages, uploadedUrls });

  // Build full URL for images
  const getFullImageUrl = (url) => {
    if (!url) return '';
    // If already base64 data URL, use directly
    if (url.startsWith('data:')) return url;
    // If external URL, use as-is
    if (url.startsWith('http')) return url;
    // If relative path, prepend server
    if (url.startsWith('/')) return `http://localhost:4321${url}`;
    // Default: prepend server
    return `http://localhost:4321/${url}`;
  };

  // Update displayUrls when existingImages prop changes (for editing)
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setDisplayUrls(existingImages);
      console.log('[ReviewImageSelector] Display URLs updated from prop:', existingImages);
    }
  }, [existingImages]);

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      console.log('[ReviewImageSelector] handleFileUpload START:', { fileName: file.name, size: file.size });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        console.log('[ReviewImageSelector] FileReader complete - base64 length:', url.length);
        
        const newUrls = [...uploadedUrls, url];
        setUploadedUrls(newUrls); // Store only NEW uploaded images
        
        if (onImagesSelected) {
          const data = {
            productImageIds: [],
            newImageUrls: newUrls // Only send newly uploaded images
          };
          console.log('[ReviewImageSelector] After file upload - calling onImagesSelected:', {
            newImageUrls: data.newImageUrls.length
          });
          onImagesSelected(data);
        }
        message.success('Ảnh đã được thêm');
      };
      
      reader.onerror = (error) => {
        console.error('[ReviewImageSelector] FileReader error:', error);
        message.error('Lỗi khi đọc file ảnh');
      };
      
      reader.readAsDataURL(file);
      return false;
    } catch (error) {
      console.error('[ReviewImageSelector] handleFileUpload error:', error);
      message.error('Lỗi khi tải ảnh');
      return false;
    }
  };

  return (
    <div className="review-image-selector">
      <h4 className="selector-title">Thêm Ảnh Để Đánh Giá</h4>
      
      {/* Upload Section - Only Option */}
      <div className="upload-section">
        <h5>Tải Ảnh Từ Máy Tính</h5>
        <Upload
          maxCount={5}
          listType="picture-card"
          beforeUpload={handleFileUpload}
          multiple
          showUploadList={false}
        >
          <button
            style={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải ảnh</div>
          </button>
        </Upload>

        {/* Show existing images when editing */}
        {displayUrls.length > 0 && (
          <div className="existing-images">
            <p>Ảnh hiện tại:</p>
            <div className="uploaded-thumbs">
              {displayUrls.map((url, index) => (
                <div key={`existing-${index}`} className="uploaded-thumb">
                  <img src={getFullImageUrl(url)} alt={`Existing ${index}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show newly uploaded images */}
        {uploadedUrls.length > 0 && (
          <div className="uploaded-images">
            <p>Ảnh đã tải:</p>
            <div className="uploaded-thumbs">
              {uploadedUrls.map((url, index) => (
                <div key={`new-${index}`} className="uploaded-thumb">
                  <img src={url} alt={`Uploaded ${index}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {(uploadedUrls.length > 0 || displayUrls.length > 0) && (
          <div className="selected-info">
            <span>
              {uploadedUrls.length} ảnh mới
              {displayUrls.length > 0 && ` + ${displayUrls.length} ảnh hiện tại`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewImageSelector;
