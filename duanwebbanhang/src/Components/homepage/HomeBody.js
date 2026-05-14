<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Alert, Typography, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Alert, Typography, Input, Select, Button } from 'antd';
import { Link } from 'react-router-dom'; // Giữ lại Link
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
import ProductList from './ProductList';
import productService from '../../Services/ProductService';

const { Title } = Typography;
<<<<<<< HEAD

const HomeBody = () => {
  const [sections, setSections] = useState([]); // [{ category, products }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedByCategory = async () => {
      setLoading(true);
      try {
        const catResponse = await productService.getCategories();
        const catData = catResponse?.data?.data ?? catResponse?.data ?? [];
        const categories = Array.isArray(catData) ? catData : [];

        const results = await Promise.all(
          categories.map(async (cat) => {
            try {
              const res = await productService.getProducts({
                categoryId: cat.id,
                limit: 4,
                sortBy: '-createdAt',
              });
              const data = res?.data?.data?.data ?? res?.data?.data ?? res?.data;
              return { category: cat, products: Array.isArray(data) ? data : [] };
            } catch {
              return { category: cat, products: [] };
            }
          })
        );

        setSections(results.filter(s => s.products.length > 0));
      } catch (err) {
        console.error('Lỗi tải sản phẩm nổi bật:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedByCategory();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <Title level={2} className="text-center mb-8">SẢN PHẨM NỔI BẬT</Title>
      {error ? (
        <Alert message="Lỗi" description={error} type="error" showIcon />
      ) : (
        sections.map(({ category, products }) => (
          <div key={category.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <Title level={4} className="!mb-0">{category.name}</Title>
              <Link to={`/products?categoryId=${category.id}`}>Xem thêm →</Link>
            </div>
            <ProductList
              products={products}
              loading={false}
              pagination={null}
              selectedAttributes={{}}
            />
          </div>
        ))
=======
const { Search } = Input;
const { Option } = Select;

const HomeBody = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State mới cho tìm kiếm và bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null nghĩa là "Tất cả"

  // Hàm gọi API sản phẩm, giờ đây sẽ nhận tham số tìm kiếm và lọc
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page: 1, 
        limit: 8, // Vẫn chỉ hiển thị 8 sản phẩm trên trang chủ
        search: searchTerm,
        categoryId: selectedCategory,
      };
      
      const response = await productService.getProducts(params);
      
      // API trả về cấu trúc: { status: "success", data: { data: [...], total: ..., page: ... } }
      // Hoặc: { data: { data: [...], total: ... } } từ axios wrapper
      const productsData = response?.data?.data?.data || response?.data?.data || response?.data;
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else if (productsData && typeof productsData === 'object') {
        // Nếu API trả về object thay vì array
        console.warn("API trả về products dưới dạng object, chuyển thành array");
        const arrData = Array.isArray(productsData.data) ? productsData.data : Object.values(productsData);
        setProducts(Array.isArray(arrData) ? arrData : []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  // useEffect để lấy danh mục (chỉ 1 lần)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        // Cấu trúc response: { status: "success", data: [...] }
        // Trong axios, response.data = { status: "success", data: [...] }
        const categoriesData = response?.data?.data || response?.data;
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData && typeof categoriesData === 'object') {
          // Nếu API trả về object thay vì array
          console.warn("API trả về categories dưới dạng object, chuyển thành array");
          setCategories(Object.values(categoriesData));
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // useEffect để gọi lại API mỗi khi bộ lọc thay đổi
  useEffect(() => {
    // Sử dụng debounce để tránh gọi API liên tục khi người dùng gõ
    const handler = setTimeout(() => {
      fetchProducts();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(handler); // Hủy bỏ timeout nếu người dùng gõ tiếp
    };
  }, [fetchProducts]);

  return (
    <div className="py-8">
      <Title level={2} className="text-center mb-8">SẢN PHẨM</Title>
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={12}>
            <Search 
              placeholder="Tìm kiếm sản phẩm..." 
              size="large"
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo danh mục"
              size="large"
              style={{ width: '100%' }}
              onChange={(value) => setSelectedCategory(value)}
              allowClear
            >
              {Array.isArray(categories) && categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
      {/* Hiển thị danh sách sản phẩm */}
      {error ? (
        <Alert message="Lỗi" description={error} type="error" showIcon />
      ) : (
        <ProductList 
          products={products} 
          loading={loading}
          pagination={null} // Trang chủ không có phân trang
          selectedAttributes={{}} // Truyền selectedAttributes mặc định
        />
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
      )}
      <div className="text-center mt-8">
        <Link to="/products">
          <Button type="primary" size="large">Xem tất cả sản phẩm</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomeBody;
<<<<<<< HEAD
=======



// import React, { useState, useEffect, useCallback } from 'react';
// import { Alert, Typography, Button } from 'antd';
// import { Link } from 'react-router-dom'; // Giữ lại Link
// import ProductList from './ProductList';
// import productService from '../../Services/ProductService';

// const { Title } = Typography;

// const HomeBody = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Hàm gọi API sản phẩm, giờ đây sẽ nhận tham số tìm kiếm và lọc
//   const fetchProducts = useCallback(async (educationCategoryId) => {
//     setLoading(true);
//     try {
//       if (!educationCategoryId) {
//         setProducts([]);
//         return;
//       }
//       const params = { 
//         page: 1, 
//         limit: 8, // Vẫn chỉ hiển thị 8 sản phẩm trên trang chủ
//         categoryId: educationCategoryId,
//       };
      
//       const response = await productService.getProducts(params);
      
//       if (response.data.data && Array.isArray(response.data.data.data)) {
//         setProducts(response.data.data.data);
//       } else {
//         setProducts([]);
//       }
//     } catch (err) {
//       setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // useEffect để lấy danh mục (chỉ 1 lần)
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await productService.getCategories();
//         if(response.data && Array.isArray(response.data.data)){
//           const allCategories = response.data.data;
//           setCategories(allCategories);
//           // Tìm ID của danh mục "Education"
//           const educationCategory = allCategories.find(cat => cat.name.toLowerCase() === 'education');
//           // Gọi fetchProducts với ID tìm được
//           fetchProducts(educationCategory?.id);
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải danh mục:", error);
//       }
//     };
//     fetchCategories();
//   }, [fetchProducts]); // Thêm fetchProducts vào dependency array

//   return (
//     <div className="py-8">
//       <div className="text-center mb-8"><Title level={2} >Sản Phẩm Giáo Dục Nổi Bật</Title></div>
//       {/* Hiển thị danh sách sản phẩm */}
//       {error ? (
//         <Alert message="Lỗi" description={error} type="error" showIcon />
//       ) : (
//         <ProductList 
//           products={products} 
//           loading={loading}
//           pagination={null} // Trang chủ không có phân trang
//         />
//       )}
//       <div className="text-center mt-8">
//         <Link to="/products">
//           <Button type="primary" size="large">Xem tất cả sản phẩm</Button>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default HomeBody;
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
