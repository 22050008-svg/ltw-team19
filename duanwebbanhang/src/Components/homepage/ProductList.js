import React, { useState } from 'react';
import { List, Card, Pagination, Tag, Button, message, Tooltip, Typography, Rate } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useCart } from '../../Context/CartContext';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;
const { Text } = Typography;

// Hàm tiện ích để định dạng giá tiền theo chuẩn Việt Nam
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber)) return 'Không xác định';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNumber);
};

const ProductList = ({ loading, products, pagination, onPageChange, selectedAttributes }) => {
  const { addOrUpdateItem } = useCart(); // Sử dụng hàm đã được tối ưu
  const { token } = useAuth();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState(null);

  // Hàm xử lý khi người dùng nhấn nút "Thêm vào giỏ"
  const handleAddToCart = async (event, product) => {
    event.stopPropagation(); // Ngăn sự kiện click lan ra thẻ Card và điều hướng trang
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    // ★ THAY ĐỔI: Lấy productVariantId từ variant đầu tiên thay vì product.id
    const productVariantId = product.variants?.[0]?.id;
    if (!productVariantId) {
      message.error('Sản phẩm này không có variant nào. Vui lòng chọn từ trang chi tiết sản phẩm.');
      return;
    }

    setAddingId(product.id);
    try {
      console.log('[ProductList] Adding to cart:', { productVariantId, quantity: 1 });
      await addOrUpdateItem(productVariantId, 1); // Mặc định thêm 1 sản phẩm
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      message.error('Thêm sản phẩm thất bại, vui lòng thử lại.');
    } finally {
      setAddingId(null);
    }
  };

  // Hàm xử lý khi người dùng click vào thẻ Card để xem chi tiết
  const handleCardClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Hàm để lấy URL hình ảnh phù hợp nhất dựa trên các thuộc tính đã chọn
  const getProductImage = (product) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
    const placeholder = 'https://dummyimage.com/300x230/cccccc/969696?text=No+Image';

    // Ưu tiên lấy ảnh từ variant đầu tiên (mặc định)
    if (product.variants && product.variants.length > 0 && product.variants[0].image_url) {
      return `${baseUrl}${product.variants[0].image_url}`;
    }

    // Nếu không có ảnh ở variant, dùng imageUrl của product
    let imageUrl = product.imageUrl ? `${baseUrl}${product.imageUrl}` : placeholder;

    if (!product.attributes?.attribute_tree || !selectedAttributes || Object.keys(selectedAttributes).length === 0) {
      return imageUrl;
    }

    let currentNode = product.attributes.attribute_tree;
    let lastFoundImage = imageUrl;

    while (currentNode && selectedAttributes[currentNode.slug]) {
      const selectedOptionSlug = selectedAttributes[currentNode.slug];
      const selectedOption = currentNode.options.find(opt => opt.slug === selectedOptionSlug);

      if (selectedOption) {
        if (selectedOption.image_url) {
          // Giả sử image_url từ attribute_tree là một URL đầy đủ
          lastFoundImage = selectedOption.image_url;
        }
        currentNode = selectedOption.sub_attributes?.[0];
      } else {
        break; // Dừng lại nếu không tìm thấy lựa chọn
      }
    }

    return lastFoundImage;
  };

  return (
    <div>
      <List
        loading={loading}
        grid={{ gutter: [24, 24], xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
        dataSource={Array.isArray(products) ? products : []}
        renderItem={(product) => (
          <List.Item>
            <Card
              hoverable
              // Thêm h-full, flex, flex-col để đảm bảo các card có chiều cao bằng nhau
              className="shadow-lg rounded-lg overflow-hidden group relative h-full flex flex-col" 
              onClick={() => handleCardClick(product.id)}
              cover={
                <div className="overflow-hidden h-56 relative">
                  <img
                    alt={product.name}
                    src={getProductImage(product)}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                  />
                  {/* Lớp phủ và nút "Xem nhanh" chỉ hiện khi hover */}
                
                </div>
              }
              
              // styles.body để phần body của card có thể co giãn
              styles={{ body: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', padding: '16px' } }}
            >
              {/* flex-grow để phần nội dung chính chiếm hết không gian còn lại */}
              <div className="flex flex-col justify-between flex-grow h-full">
                {/* Phần trên của card: category, brand, tên, giá */}
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {product.category && (
                      <Tag color="blue">{product.category.name}</Tag>
                    )}
                    {product.brand && (
                      <Tag color="orange">{product.brand.name}</Tag>
                    )}
                  </div>
                  <Meta 
                    title={
                      <Tooltip title={product.name}>
                        {/* Giới hạn tên sản phẩm trong 2 dòng và đặt chiều cao cố định */}
                        <span
                          className="font-semibold text-base block whitespace-normal line-clamp-2 h-12"
                        >
                          {product.name}
                        </span>
                      </Tooltip>
                    }
                    description={
                      // ★ THAY ĐỔI: product.price → product.variants?.[0]?.price (lấy giá từ variant đầu tiên)
                      <span className="text-red-500 font-bold text-lg">{formatPrice(product.variants?.[0]?.price || product.price)}</span>
                    } 
                    
                  />
                  {/* Hiển thị đánh giá sao */}
                  <div className="mt-2 flex items-center gap-2">
                    {product.rating && product.rating.averageRating > 0 ? (
                      <>
                        <Rate 
                          disabled 
                          allowHalf 
                          value={product.rating.averageRating} 
                          style={{ fontSize: '14px' }}
                        />
                        <Tooltip title={`${product.rating.totalReviews} đánh giá`}>
                          <Text className="text-xs text-gray-600">
                            ({product.rating.totalReviews})
                          </Text>
                        </Tooltip>
                      </>
                    ) : (
                      <Text className="text-xs text-gray-400">Chưa có đánh giá</Text>
                    )}
                  </div>
                  {product.sku && (
                    <p className="text-xs font-semibold text-black p-2">SKU: {product.sku}</p>
                  )}
                </div>
                {/* Phần dưới của card: SKU và nút thêm vào giỏ */}
                <div>
                  
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => handleAddToCart(e, product)}
                    loading={addingId === product.id}
                    className="w-full mt-4"
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
      
      {pagination && pagination.total > pagination.pageSize && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default ProductList;
