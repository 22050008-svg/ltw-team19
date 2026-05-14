import api from '../api/axiosConfig';

const getCart = () => {
  return api.get('/cart');
};

/**
 * ★ THAY ĐỔI: productId -> productVariantId (gửi variant ID thay vì product ID)
 * Backend sử dụng ProductVariant thay vì Product
 */
const addToCart = (productVariantId, quantity) => {
  console.log('[CartService] addToCart:', { productVariantId, quantity });
  return api.post('/cart/items', { productVariantId, quantity });
};

/**
 * ★ THAY ĐỔI: productId -> variantId (gửi variant ID trong URL)
 * Backend sử dụng variant ID để xóa CartItem
 */
const removeFromCart = (variantId) => {
  console.log('[CartService] removeFromCart:', variantId);
  return api.delete(`/cart/items/${variantId}`);
};

const cartService = {
  getCart,
  addToCart,
  removeFromCart,
};

export default cartService;