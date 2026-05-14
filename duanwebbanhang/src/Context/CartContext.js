import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../Services/CartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth(); // Chỉ hoạt động khi có token (đã đăng nhập)
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        setLoading(true);
        try {
          const response = await cartService.getCart();
          setCartItems(response.data.data.items || []);
          console.log('[CartContext] Cart loaded after login:', response.data.data.items?.length || 0, 'items');
        } catch (error) {
          console.error("[CartContext] Lỗi khi lấy giỏ hàng:", error);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      } else {
        // ★ THAY ĐỔI: Chỉ xóa giỏ hàng lần đầu tiên khi app khởi động (initialized = false)
        // Không xóa giỏ hàng khi user đăng xuất - nó sẽ vẫn hiển thị ở local state
        // Sẽ được tải lại khi user đăng nhập trở lại
        if (!initialized) {
          console.log('[CartContext] No token on initial load, cart stays empty until login');
          setInitialized(true);
        } else {
          console.log('[CartContext] User logged out - keeping cart in memory for potential re-login');
        }
      }
    };
    fetchCart();
  }, [token, initialized]);

  const addOrUpdateItem = async (productId, quantity) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCartItems(response.data.data.items);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ:", error);
      throw error; // Ném lỗi ra để component gọi nó có thể xử lý
    }
  };
  
  const removeItem = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      setCartItems(response.data.data.items);
    } catch (error) {
       console.error("Lỗi khi xóa khỏi giỏ:", error);
       throw error;
    }
  };

  const clearCart = () => {
    // Đơn giản là set lại mảng items về rỗng ở phía client
    setCartItems([]);
  };

  // ★ FIX: API returns item.quantity directly, not item.CartItem.quantity
  const cartCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

  
  const value = { cartItems, cartCount, addOrUpdateItem, removeItem, loading, clearCart };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};