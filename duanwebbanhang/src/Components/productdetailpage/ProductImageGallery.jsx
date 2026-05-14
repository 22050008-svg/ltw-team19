import React, { useState, useEffect } from 'react';
import '../styles/ProductImageGallery.css';

const ProductImageGallery = ({ images = [], productImages = [], productName, variants = [] }) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
  const placeholder = 'https://dummyimage.com/600x600/cccccc/969696?text=No+Image';

  // Hàm để tạo URL đầy đủ cho ảnh
  const getFullImageUrl = (url) => {
    if (!url) return placeholder;
    // Nếu url đã là đường dẫn tuyệt đối (http), trả về chính nó. Ngược lại, thêm baseUrl.
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
  };

  // Lấy ảnh từ các nguồn - ưu tiên productImages từ backend API
  const getAllImages = () => {
    const seenUrls = new Set();
    const allImages = [];
    
    // ★ ƯTIÊN 1: Lấy từ productImages (API trả về - xu hướng mới)
    if (productImages && Array.isArray(productImages) && productImages.length > 0) {
      console.log('[ProductImageGallery] Using productImages from API:', productImages);
      productImages.forEach(img => {
        // Backend trả về imageUrl, không phải image_url
        const imgUrl = img.imageUrl || img.url || img.image_url;
        if (imgUrl && !seenUrls.has(imgUrl)) {
          seenUrls.add(imgUrl);
          allImages.push({
            url: imgUrl,
            alt: productName,
            displayOrder: img.displayOrder,
            isPrimary: img.isPrimary
          });
        }
      });
    }
    
    // ★ ƯU TIÊN 2: Lấy ảnh từ images array (đã extract từ ProductDetailPage)
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('[ProductImageGallery] Using extracted images:', images);
      images.forEach(img => {
        const imgUrl = img.url || img.imageUrl || img.image_url;
        if (imgUrl && !seenUrls.has(imgUrl)) {
          seenUrls.add(imgUrl);
          allImages.push({
            url: imgUrl,
            alt: img.alt || productName
          });
        }
      });
    }
    
    // ★ ƯU TIÊN 3: Lấy ảnh từ variants (legacy fallback)
    if (variants && Array.isArray(variants) && variants.length > 0) {
      console.log('[ProductImageGallery] Using variant images as fallback:', variants);
      variants.forEach(variant => {
        if (variant.image_url && !seenUrls.has(variant.image_url)) {
          seenUrls.add(variant.image_url);
          allImages.push({
            url: variant.image_url,
            alt: variant.name || productName
          });
        }
      });
    }
    
    return allImages.length > 0 ? allImages : [{ url: placeholder, alt: productName }];
  };

  const allImages = getAllImages();
  
  console.log('[ProductImageGallery] Debug:', { 
    allImagesCount: allImages.length,
    productImagesCount: productImages?.length || 0,
    imagesCount: images?.length || 0,
    variantsCount: variants?.length || 0,
    allImages 
  }); // Debug

  // Mặc định hiển thị ảnh đầu tiên
  const [mainImage, setMainImage] = useState(
    allImages.length > 0 ? getFullImageUrl(allImages[0].url) : placeholder
  );
  const [thumbnails, setThumbnails] = useState(allImages);

  // Cập nhật lại ảnh chính khi props thay đổi
  useEffect(() => {
    const updatedImages = getAllImages();
    if (updatedImages.length > 0) {
      setMainImage(getFullImageUrl(updatedImages[0].url));
      setThumbnails(updatedImages);
    }
  }, [images, productImages, variants]);

  const handleSelectImage = (url) => {
    setMainImage(getFullImageUrl(url));
  };

  return (
    <div className="image-gallery">
      <div className="main-image-container">
        <img
          src={mainImage}
          alt={productName}
          className="main-image"
          onError={(e) => {
            e.target.src = placeholder;
          }}
        />
      </div>
      
      {/* Thumbnails */}
      {thumbnails.length > 1 && (
        <div className="thumbnails">
          {thumbnails.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${mainImage === getFullImageUrl(img.url) ? 'active' : ''}`}
              onClick={() => handleSelectImage(img.url)}
            >
              <img
                src={getFullImageUrl(img.url)}
                alt={img.alt}
                onError={(e) => {
                  e.target.src = placeholder;
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;