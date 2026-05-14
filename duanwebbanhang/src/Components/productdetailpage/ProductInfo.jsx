import React, { useState } from 'react';
import { Typography, Button, InputNumber, Space, Tag, message, Modal, Image, Row, Col } from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined, PictureOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Hàm tiện ích để định dạng giá tiền
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber)) return 'Không xác định';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNumber);
};

const ProductInfo = ({ product, productImages = [], onAddToCart, onBuyNow, loading }) => {
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);

  // Lấy dữ liệu từ variant đầu tiên (variant mặc định)
  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : {};
  
  // Ưu tiên lấy từ variant, fallback lấy từ product
  const price = defaultVariant.price ?? product.price;
  const stockQuantity = defaultVariant.stock_quantity ?? product.stockQuantity;
  const sku = defaultVariant.sku ?? product.sku;

  const handleQuantityChange = (value) => {
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCartClick = () => {
    if (quantity > stockQuantity) {
      message.error(`Số lượng tồn kho không đủ, chỉ còn ${stockQuantity} sản phẩm.`);
      return;
    }
    onAddToCart(quantity);
  };

  const handleBuyNowClick = () => {
    if (quantity > stockQuantity) {
      message.error(`Số lượng tồn kho không đủ, chỉ còn ${stockQuantity} sản phẩm.`);
      return;
    }
    onBuyNow(quantity);
  };

  // Xây dựng full URL cho ảnh
  const getFullImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2 flex-wrap">
        {product.category && <Tag color="blue">{product.category.name}</Tag>}
        {product.brand && <Tag color="orange">{product.brand.name}</Tag>}
      </div>
      <Title level={2} className="!mt-0 !mb-2">{product.name}</Title>
      {sku && <Text type="secondary" className="mb-4">SKU: {sku}</Text>}
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="text-3xl font-bold text-red-600">{formatPrice(price)}</Text>
      </div>

      <Paragraph>{product.description}</Paragraph>
      <Text>Số lượng tồn kho: <Text strong>{stockQuantity}</Text></Text>

    
      <div className=' mt-2'>
         <Space wrap className="mt-auto ">
        <Button type="primary" ghost icon={<ShoppingCartOutlined />} size="large" onClick={handleAddToCartClick} loading={loading}>Thêm vào giỏ hàng</Button>
        <Button type="primary" danger icon={<ThunderboltOutlined />} size="large" onClick={handleBuyNowClick} loading={loading}>Mua ngay</Button>
        {productImages && productImages.length > 0 && (
          <Button type="default" icon={<PictureOutlined />} size="large" onClick={() => setShowImageModal(true)}>
            Xem ảnh ({productImages.length})
          </Button>
        )}
      </Space>
      </div>

      {/* Modal xem gallery ảnh */}
      <Modal
        title={`Xem ảnh sản phẩm (${productImages?.length || 0} ảnh)`}
        open={showImageModal}
        onCancel={() => setShowImageModal(false)}
        width={1000}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          {productImages && productImages.length > 0 ? (
            productImages.map(img => (
              <Col key={img.id} xs={24} sm={12} md={8} lg={6}>
                <div style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Image
                    width="100%"
                    height={150}
                    src={getFullImageUrl(img.imageUrl)}
                    alt={`Product image ${img.id}`}
                    preview={true}
                    style={{ objectFit: 'cover' }}
                  />
                  {img.isPrimary && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      background: '#1890ff',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '0 8px 0 8px'
                    }}>
                      Ảnh chính
                    </div>
                  )}
                </div>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Text type="secondary">Không có ảnh nào</Text>
            </Col>
          )}
        </Row>
      </Modal>
    </div>
  );
};

export default ProductInfo;