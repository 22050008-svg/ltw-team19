import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các component chung và các trang
import Header from '../Components/Header';
import Footer from '../Components/Foooter.js'; // Import Footer
import HomePage from '../Pages/HomePage.jsx';
import LoginPage from '../Pages/LoginPage.jsx';
import RegisterPage from '../Pages/RegisterPage.jsx';
import AdminPage from '../Pages/AdminPage.jsx'; // 1. Import trang Admin
import ProductAdminPage from '../Pages/ProductAdminPage.jsx'; // ★ NEW: Import trang edit sản phẩm
import ProductsPage from '../Pages/ProductsPage.jsx';
import CartPage from '../Pages/CartPage.jsx';
import CheckoutPage from '../Pages/CheckoutPage.jsx';
import ProfilePage from '../Pages/ProfilePage.jsx';
import ProductDetailPage from '../Pages/ProductDetailPage.jsx'; // Import trang chi tiết sản phẩm
import ForgotPassword from '../Components/profilepage/ForgotPassword.js';
import ResetPasswordPage from '../Pages/ResetPasswordPage.jsx';
import ProtectedRoute from './ProtectedRoute';

// ★ PHÂN LOẠI ROUTES:
// - Public routes: Ai cũng có thể xem
// - Protected routes: Chỉ users đã đăng nhập mới xem được

// Định nghĩa mảng routes CÔNG KHAI để quản lý tập trung
export const publicRoutes = [
    {
        path: "/",
        component: HomePage
    },
    {
        path: "/login",
        component: LoginPage
    },
    {
        path: "/register",
        component: RegisterPage
    },
    {
        path: '/products',
        component: ProductsPage
    },
    {
        path: 'forgot-password',
        component: ForgotPassword,
    },
    {
        path: 'reset-password',
        component: ResetPasswordPage,
    }
];

// Định nghĩa mảng routes BẢO VỆ (cần đăng nhập)
export const protectedRoutes = [
    {
        path: '/profile',
        component: ProfilePage,
    },
    {
        path: '/cart',
        component: CartPage
    },
    {
        path: '/checkout',
        component: CheckoutPage,
    }
];

// Keep backward compatibility
export const routes = [...publicRoutes, ...protectedRoutes];

const AppRouter = () => {
  return (
    <Router>    
      <div className="flex flex-col min-h-screen">
        {/* Header sẽ hiển thị trên tất cả các trang */}
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* 📖 PUBLIC ROUTES - Ai cũng có thể xem */}
            {publicRoutes.map((route) => {
              const Page = route.component;
              return <Route key={route.path} path={route.path} element={<Page />} />;
            })}

            {/* 🔒 PROTECTED ROUTES - Chỉ users đã đăng nhập mới xem được */}
            {protectedRoutes.map((route) => {
              const Page = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <Page />
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* ★ NEW: Route cho trang chi tiết sản phẩm với ID động (công khai) */}
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* ★ NEW: Route cho danh mục sản phẩm - hỗ trợ poster redirect */}
            {/* Ví dụ: /category/1?brand=Samsung */}
            <Route path="/category/:categoryId" element={<ProductsPage />} />

            {/* ★ NEW: Route PROTECTED cho quản lý sản phẩm (edit thông tin) */}
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute>
                  <ProductAdminPage />
                </ProtectedRoute>
              }
            />

            {/* 🔒 Route được bảo vệ cho trang Admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer sẽ hiển thị trên tất cả các trang */}
        <Footer />
      </div>
    </Router>
  );
};

export default AppRouter;