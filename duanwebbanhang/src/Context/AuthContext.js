import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../Services/AuthService';
// import { mockAdminUser } from '../data/mockUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // ★ FIX: Only set loading=true if we have a token to verify
  // Public pages should load immediately without waiting for token validation
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  
  // Define logOut first so it can be used in useEffect
  const logOut = () => {
    setUser(null);
    setToken(null);
    setLoading(false); // Done loading after logout
    localStorage.removeItem('token');
  };
  
  // useEffect sẽ chạy một lần khi component được tạo
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Dùng token để gọi API /me lấy thông tin user
          const response = await authService.getMe();
          // API trả về thành công, set user vào state
          const userData = response.data.data;
          setUser(userData);
          // Connect and authenticate the socket after user is fetched
        
        } catch (error) {
          // ★ FIX: Handle 401 errors more gracefully
          if (error.response?.status === 401) {
            // Token không hợp lệ hoặc hết hạn, đăng xuất im lặng
            console.warn("Token expired or invalid, logging out");
            logOut();
          } else {
            // For other errors, also logout but keep the console log
            console.error("Error fetching user:", error);
            logOut();
          }
        } finally {
          setLoading(false); // Done loading
        }
      } else {
        setLoading(false); // Done loading
      }
    };
    
    fetchUser();
  }, [token]); // Effect này chỉ chạy lại khi token thay đổi
  const updateUserContext = (newUserData) => {
      setUser(currentUser => ({ ...currentUser, ...newUserData }));
    };
  const loginAction = (data) => {
  
    const userData = data.user;
    setUser(userData);
    setToken(data.token);
    setLoading(false); // Done loading after login
    localStorage.setItem('token', data.token);
   
  };

  const value = { token, user, loading, loginAction, logOut, updateUserContext };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};