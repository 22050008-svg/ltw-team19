import React, { useState } from 'react';
import { List, Button, Image, Typography, message, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';

const { Text } = Typography;

const CartItemList = ({ items }) => {
  // Lấy hàm addItem và removeItem từ context
  const { addOrUpdateItem: addItem, removeItem } = useCart();
  const [loadingItemId, setLoadingItemId] = useState(null);

  const handleQuantityChange = async (item, newQuantity) => {
    setLoadingItemId(item.id); // Bắt đầu loading cho sản phẩm này

    try {
      if (newQuantity <= 0) {
        // Nếu số lượng về 0, gọi hàm xóa
        // ★ THAY ĐỔI: gửi productVariantId thay vì id
        await removeItem(item.productVariantId);
        message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } else {
        // Nếu số lượng > 0, gọi hàm cập nhật
        // ★ THAY ĐỔI: gửi productVariantId thay vì id
        await addItem(item.productVariantId, newQuantity);
      }
    } catch {
      message.error("Cập nhật giỏ hàng thất bại.");
    } finally {
      setLoadingItemId(null); // Dừng loading
    }
  };

  const handleRemove = async (productId) => {
    setLoadingItemId(productId);
    try {
      // ★ THAY ĐỔI: gửi productVariantId thay vì productId
      const variantId = items.find(item => item.id === productId)?.productVariantId;
      if (variantId) {
        await removeItem(variantId);
        message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      }
    } catch {
      message.error("Xóa sản phẩm thất bại.");
    } finally {
      setLoadingItemId(null);
    }
  };
console.log(items);

  return (
    <List
      itemLayout="horizontal"
      dataSource={items}
      renderItem={item => (
        <List.Item
          // Bỏ actions mặc định để tùy chỉnh layout hoàn toàn
        >
          <div className=" sm:flex-row w-full items-start sm:items-center">
            {/* Cột 1: Hình ảnh */}
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
              {/* ★ THAY ĐỔI: item.imageUrl → item.variant.imageUrl */}
              <Image width={80} src={`${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${item.variant?.imageUrl}` || 'https://dummyimage.com/80x80/cccccc/969696?text=No+Image'} />
            </div>

            {/* Cột 2: Thông tin sản phẩm và số lượng */}
            <div className="flex-grow mb-4 sm:mb-0 space">
              {/* ★ THAY ĐỔI: item.id → item.product.id, item.name → item.variant.name */}
              <Link to={`/products/${item.product?.id}`} className="text-base font-semibold hover:text-blue-500">
                {item.variant?.name || item.product?.name}
              </Link>
              <div className="text-gray-500 mt-1">
                {/* ★ THAY ĐỔI: item.price → item.variant.price */}
                Đơn giá: {new Intl.NumberFormat('vi-VN').format(item.variant?.price || 0)} đ
              </div>
              <Space className="mt-2">
                <Button
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  disabled={loadingItemId === item.id || item.quantity <= 1}
                />
                {/* ★ THAY ĐỔI: item.CartItem.quantity → item.quantity */}
                <Text className="mx-2">{item.quantity}</Text>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  disabled={loadingItemId === item.id}
                />
              </Space>
              <br />
              {/* ★ THAY ĐỔI: item.price * item.CartItem.quantity → item.subtotal */}
              <Text strong className="text-base mb-0 sm:mb-2 ">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal || 0)}
              </Text>

            </div>

            {/* Cột 3: Tổng tiền và nút xóa */}
            <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto sm:items-end">
              <Button 
                icon={<DeleteOutlined />} 
                onClick={() => handleRemove(item.id)} 
                danger 
                loading={loadingItemId === item.id}
              />
            </div>
          </div>
        </List.Item>
      )}
    />
  );
};

export default CartItemList;