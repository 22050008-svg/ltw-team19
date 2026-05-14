// src/Components/Header.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useCart } from '../Context/CartContext'; // Import hook useCart
import { Dropdown, message, Avatar, Badge, Input, Button, Drawer, Divider, Menu } from 'antd'; // Thêm Menu
import {
    UserOutlined,
    LogoutOutlined,
    DownOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    MenuOutlined
} from '@ant-design/icons';

const { Search } = Input;

const Header = () => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { user, logOut } = useAuth();
    const { cartCount } = useCart();

    const isAdmin = user && user.roles.length > 0 ;
    const handleLogout = () => {
        logOut();
        message.success('Đăng xuất thành công!');
        navigate('/login');
    };

    const onSearch = (value) => {
        const trimmedValue = value.trim();
        if (trimmedValue) {
            navigate(`/products?search=${encodeURIComponent(trimmedValue)}`);
            if (drawerVisible) {
                setDrawerVisible(false);
            }
        }
    };

    const showDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    const fullAvatarUrl = user?.avatarUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:4321'}${user.avatarUrl}` : null;

    const desktopMenuItems = [
        {
            key: 'profile',
            label: 'Thông tin tài khoản',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        isAdmin && {
            key: 'admin',
            label: 'Trang quản trị',
            icon: <SettingOutlined />,
            onClick: () => navigate('/admin')
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true,
        }
    ].filter(Boolean);

    // Menu cho khu vực - Convert JSX to items array format untuk Ant Design v5
    const locationMenuItems = [
        {
            key: 'hanoi',
            label: 'Hà Nội',
            onClick: () => {} // Add location filter logic here if needed
        },
        {
            key: 'danang',
            label: 'Đà Nẵng',
            onClick: () => {}
        },
        {
            key: 'hcm',
            label: 'TP. Hồ Chí Minh',
            onClick: () => {}
        }
    ];

    const renderNavLinks = (isMobile = false) => (
        // Đổi từ 'lg:flex' sang 'lg:flex'
        <div className={isMobile ? "flex flex-col gap-y-4" : "hidden lg:flex gap-x-6 items-center"}>
            <Link to="/products" onClick={isMobile ? closeDrawer : undefined} className={isMobile ? "text-lg p-2 hover:bg-gray-100 rounded" : "hover:text-blue-500"}>
                Sản phẩm
            </Link>
            {/* Thay thế "Khuyến mãi" bằng Dropdown "Khu vực" */}
            <Dropdown menu={{ items: locationMenuItems }} trigger={['hover']}>
                <span className={isMobile ? "text-lg p-2 hover:bg-gray-100 rounded flex items-center" : "hover:text-blue-500 cursor-pointer flex items-center"}>
                    Khu vực <DownOutlined style={{ marginLeft: 4, fontSize: '12px' }} />
                </span>
            </Dropdown>
            <Link to="/contact" onClick={isMobile ? closeDrawer : undefined} className={isMobile ? "text-lg p-2 hover:bg-gray-100 rounded" : "hover:text-blue-500"}>
                Liên hệ
            </Link>

        </div>
    );

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50 ">
            {/* Logo và Tên cửa hàng */}
            <Link to="/">
               <div className="flex items-center gap-2">
                {/* Logo đầy đủ - chỉ hiện trên desktop (sm trở lên) */}
                <img 
                    src="/Logo/Logo.png"
                    className="h-25 w-auto hidden sm:inline-block" 
                    alt="Mèo Vàng Logo" 
                />
                
                {/* Icon mèo - chỉ hiện trên mobile (dưới sm) */}
                <img 
                    src="/Logo/Logo1.png" 
                    className="h-20 w-auto sm:hidden" 
                    alt="Mèo Vàng Icon" 
                />
               </div>
            </Link>

            {/* Cập nhật breakpoint từ 'md:flex' sang 'lg:flex' */}
            <div className="hidden lg:flex flex-grow justify-center items-center">
                <div className="max-w-xl w-full mx-9 ">
                    <Search
                        placeholder="Tìm kiếm sản phẩm..."
                        onSearch={onSearch}
                        enterButton
                    />
                </div>
                <nav>{renderNavLinks()}</nav>
            </div>

            <div className="flex items-center gap-x-4">
                <Link to="/cart">
                    <Badge count={cartCount} size="small">
                        <ShoppingCartOutlined style={{ fontSize: '24px', color: '#000' }} />
                    </Badge>
                </Link>

                {/* Cập nhật breakpoint từ 'md:block' sang 'lg:block' */}
                <div className="hidden lg:block">
                    {user ? (
                        <Dropdown menu={{ items: desktopMenuItems }} trigger={['click']}>
                            <span className="ant-dropdown-link cursor-pointer flex items-center">
                                <Avatar src={fullAvatarUrl} icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#1890ff' }} />
                                {user.fullName}
                                <DownOutlined style={{ marginLeft: 4 }} />
                            </span>
                        </Dropdown>
                    ) : (
                        <Button onClick={() => navigate('/login')}>
                            Đăng nhập / Đăng ký
                        </Button>
                    )}
                </div>

                {/* Cập nhật breakpoint từ 'md:hidden' sang 'lg:hidden' */}
                <div className='lg:hidden'>
                <Button  type="text" icon={<MenuOutlined style={{ fontSize: '20px' }} />} onClick={showDrawer} />

                </div>
            </div>

            <Drawer title="Menu" placement="right" onClose={closeDrawer} open={drawerVisible}>
                <div className="flex flex-col h-full">
                    <Search
                        placeholder="Tìm kiếm sản phẩm..."
                        onSearch={onSearch}
                        enterButton
                        className="mb-4"
                    />
                    <nav className="mb-4">
                        {renderNavLinks(true)}
                    </nav>
                    <Divider />
                    <div className="mt-auto">
                        {user ? (
                            <div className="flex flex-col gap-y-4">
                                <Link to="/profile" onClick={closeDrawer} className="text-lg p-2 hover:bg-gray-100 rounded flex items-center gap-x-2">
                                    <Avatar src={fullAvatarUrl} icon={<UserOutlined />} size="small" />
                                    Thông tin tài khoản
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={closeDrawer} className="text-lg p-2 hover:bg-gray-100 rounded flex items-center gap-x-2">
                                        <SettingOutlined />
                                        Trang quản trị
                                    </Link>
                                )}
                                <Button type="primary" danger block onClick={() => { handleLogout(); closeDrawer(); }}>
                                    Đăng xuất
                                </Button>
                            </div>
                        ) : (
                            <Button type="primary" block onClick={() => { navigate('/login'); closeDrawer(); }}>
                                Đăng nhập / Đăng ký
                            </Button>
                        )}
                    </div>
                </div>
            </Drawer>
        </header>
    );
};

export default Header;