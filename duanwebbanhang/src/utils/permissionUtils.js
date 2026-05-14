<<<<<<< HEAD
import { UserOutlined, SolutionOutlined, AppstoreOutlined, ShoppingCartOutlined, TagOutlined, DollarCircleOutlined, MailOutlined, PictureOutlined, UnorderedListOutlined, BarChartOutlined } from '@ant-design/icons';

// Import các component chính cho mỗi tab
import DashboardTab from '../Components/adminpage/dashboard/DashboardTab';
=======
import { UserOutlined, SolutionOutlined, AppstoreOutlined, ShoppingCartOutlined, TagOutlined, DollarCircleOutlined, MailOutlined, PictureOutlined, UnorderedListOutlined } from '@ant-design/icons';

// Import các component chính cho mỗi tab
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
import UserManagementTab from '../Components/adminpage/usermanagement/UserTable';
import RoleManagementTab from '../Components/adminpage/rolemanagement/RoleTable';
import ProductManagementTab from '../Components/adminpage/productmanagement/ProductTable';
import OrderTable from '../Components/adminpage/order/OrderTable';
import VoucherManagement from '../Components/adminpage/vouchermanagement/VoucherManagement';
import MailSettings from '../Components/adminpage/mailmanagement/MailSettings';
import PosterManagement from '../Components/admin/PosterManagement';
import AttributeManagement from '../Components/admin/AttributeManagement';

/**
 * Định nghĩa tất cả các tab có thể có trong trang Admin.
 * Mỗi tab sẽ yêu cầu một quyền (permission) cụ thể để được hiển thị.
 * 
 * Permission naming convention từ Backend:
 * - system.manage.roles, system.manage.permissions, system.manage.users
 * - product.read, product.create, product.update, product.delete
 * - order.read, order.create, order.update, order.approve
 * - finance.invoice.view, finance.refund.view
 * - support.ticket.read, support.ticket.manage
 * - system.view.logs (cho xem log/report hệ thống)
 */
export const ALL_ADMIN_TABS = [
<<<<<<< HEAD
  // Dashboard - yêu cầu dashboard.read
  {
    key: 'dashboard',
    label: (<span><BarChartOutlined /> Dashboard</span>),
    children: <DashboardTab />,
    requiredPermission: ['dashboard.read'],
  },
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  // User Management - yêu cầu system.manage.users hoặc user.manage.staff
  {
    key: 'user_management',
    label: (<span><UserOutlined /> Quản lý Người dùng</span>),
    children: <UserManagementTab />,
    requiredPermission: ['system.manage.users', 'user.manage.staff'], // Chấp nhận một trong những quyền này
  },
  // Role Management - yêu cầu system.manage.roles hoặc user.manage.roles
  {
    key: 'role_management',
    label: (<span><SolutionOutlined /> Quản lý Vai trò</span>),
    children: <RoleManagementTab />,
    requiredPermission: ['system.manage.roles', 'user.manage.roles'],
  },
  // Product Management - yêu cầu product.create, product.read, hoặc product.update
  {
    key: 'product_management',
    label: (<span><AppstoreOutlined /> Quản lý sản phẩm</span>),
    children: <ProductManagementTab />,
    requiredPermission: ['product.read', 'product.create', 'product.update'],
  },
  // Order Management - yêu cầu order.read, order.update, hoặc order.approve
  {
    key: 'order_management',
    label: (<span><ShoppingCartOutlined /> Quản lý bán hàng</span>),
    children: <OrderTable />,
    requiredPermission: ['order.read', 'order.update', 'order.approve'],
  },
  // Voucher Management - yêu cầu marketing.promotion.read hoặc marketing.promotion.create
  {
    key: 'voucher_management',
    label: (<span><TagOutlined /> Quản lý Mã giảm giá</span>),
    children: <VoucherManagement />,
    requiredPermission: ['promotion.read', 'promotion.create', 'promotion.update'],
  },
  // Financial Management - yêu cầu finance permissions
  {
    key: 'financial_management',
    label: (<span><DollarCircleOutlined /> Quản lý Tài chính</span>),
    children: <div>Nội dung quản lý tài chính sẽ được xây dựng ở đây.</div>,
    requiredPermission: ['invoice.read', 'invoice.manage', 'payment.manage'],
  },
  // Mail Settings - yêu cầu system.manage.settings hoặc system.manage.permissions
  {
    key: 'mail_settings',
    label: (<span><MailOutlined /> Cấu hình Email</span>),
    children: <MailSettings />,
    requiredPermission: ['system.manage.settings', 'system.manage.permissions'],
  },
  // Poster Management - yêu cầu poster.read, poster.create, poster.update, hoặc poster.delete
  {
    key: 'poster_management',
    label: (<span><PictureOutlined /> Quản lý Poster</span>),
    children: <PosterManagement />,
    requiredPermission: ['poster.read', 'poster.create', 'poster.update', 'poster.delete'],
  },
  // Attribute Management - yêu cầu product.create, product.update hoặc attribute.manage
  {
    key: 'attribute_management',
    label: (<span><UnorderedListOutlined /> Quản lý Thuộc tính</span>),
    children: <AttributeManagement />,
    requiredPermission: ['product.create', 'product.update', 'attribute.manage'],
  },
];


/**
 * Hàm này nhận vào đối tượng user và trả về danh sách các tab mà user đó có quyền xem.
 * @param {object} user - Đối tượng user từ AuthContext.
 * @returns {Array} - Mảng các tab đã được lọc theo quyền.
 */
export const getVisibleTabs = (user) => {
  if (!user || !Array.isArray(user.roles)) {
    return []; // Nếu không có user hoặc roles, không hiển thị tab nào
  }

<<<<<<< HEAD
=======
  // Đặc biệt: Super Admin luôn thấy tất cả các tab
  const isSuperAdmin = user.roles.some(role => role.name === 'super-admin');
  if (isSuperAdmin) {
    return ALL_ADMIN_TABS;
  }

>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
  // Lấy tất cả các TÊN QUYỀN (permission.name) từ tất cả các vai trò của người dùng
  const userPermissions = new Set(
    user.roles.flatMap(role => (role.permissions || []).map(p => p.name))
  );

  // Lọc danh sách tất cả các tab dựa trên quyền người dùng có
  // Mỗi tab có thể yêu cầu một trong nhiều quyền (OR logic)
  return ALL_ADMIN_TABS.filter(tab => {
    const requiredPerms = Array.isArray(tab.requiredPermission) 
      ? tab.requiredPermission 
      : [tab.requiredPermission];
    
    // Kiểm tra xem user có ít nhất một quyền yêu cầu
    return requiredPerms.some(perm => userPermissions.has(perm));
  });
};

/**
 * Kiểm tra xem user có quyền admin (có thể truy cập bất kỳ tab admin nào)
 * @param {object} user - Đối tượng user từ AuthContext
 * @returns {boolean} - true nếu user có quyền admin
 */
export const hasAdminPermission = (user) => {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }

  // Super Admin có quyền
  if (user.roles.some(role => role.name === 'super-admin')) {
    return true;
  }

  // Kiểm tra xem user có bất kỳ quyền admin nào
  const adminPermissions = [
    'system.manage.users',
    'system.manage.roles',
    'system.manage.permissions',
    'system.manage.settings',
    'product.read',
    'product.create',
    'order.read',
    'order.update',
    'invoice.read',
    'invoice.manage',
    'ticket.read',
    'user.manage.staff',
    'promotion.read',
    'poster.read',
    'poster.create',
  ];

  const userPermissions = new Set(
    user.roles.flatMap(role => (role.permissions || []).map(p => p.name))
  );

  return adminPermissions.some(perm => userPermissions.has(perm));
};