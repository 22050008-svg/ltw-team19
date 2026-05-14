


import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Row, Col, Typography, Alert, message, Input, Select } from 'antd';
import { useLocation, useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import ProductList from '../Components/homepage/ProductList';
import HorizontalFilters from '../Components/products/HorizontalFilters';
import CategoryPoster from '../Components/products/CategoryPoster';
import productService from '../Services/ProductService';
import productAttributeService from '../Services/ProductAttributeService';
import SideCart from '../Components/products/SideCart';

const { Search } = Input;
const { Content } = Layout;
const { Title } = Typography;

const ProductsPage = () => {
  const location = useLocation();
  const params = useParams(); // ★ NEW: Get URL params (categoryId from /category/:categoryId)

  // State để lưu trữ dữ liệu
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi lọc thuộc tính
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // State cho danh sách thương hiệu (được trích từ attributes)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  
  // State để quản lý bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeTree, setAttributeTree] = useState(null); 
  const [selectedAttributes, setSelectedAttributes] = useState({}); // State cho các thuộc tính đã chọn (bao gồm "Thương Hiệu")
  const [priceRange, setPriceRange] = useState({ min: null, max: null }); // State cho khoảng giá
  const [sortOrder, setSortOrder] = useState(null); // State để sắp xếp
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Sẽ được đặt trong useEffect
  const [categoryName, setCategoryName] = useState('Tất cả sản phẩm'); // State cho tên danh mục
  const [categoryIcon, setCategoryIcon] = useState('🛍️'); // State cho icon danh mục
  const [categoryAttributes, setCategoryAttributes] = useState([]); // State cho thuộc tính của danh mục

  // State để quản lý giao diện
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook để kiểm tra kích thước màn hình
  const isDesktop = useMediaQuery({ query: '(min-width: 1280px)' });

  // Helper function to safely parse attributes
  const parseAttributes = (attributes) => {
    if (!attributes) return null;
    if (typeof attributes === 'string') {
      try {
        return JSON.parse(attributes);
      } catch (e) {
        console.error('❌ Failed to parse attributes string:', attributes, e);
        return null;
      }
    }
    return attributes;
  };

  // Hàm để hợp nhất nhiều cây thuộc tính từ danh sách sản phẩm
  const mergeAttributeTrees = (products) => {
    if (!products || products.length === 0) {
      return null;
    }

    const firstProductAttrs = parseAttributes(products[0].attributes);
    const mergedTree = JSON.parse(JSON.stringify(firstProductAttrs?.attribute_tree || null));

    if (!mergedTree) return null;

    const mergeNodes = (targetNode, sourceNode) => {
      if (!sourceNode || !targetNode) return;

      sourceNode.options.forEach(sourceOption => {
        const targetOption = targetNode.options.find(opt => opt.slug === sourceOption.slug);
        if (!targetOption) {
          targetNode.options.push(JSON.parse(JSON.stringify(sourceOption)));
        } else {
          if (sourceOption.sub_attributes && sourceOption.sub_attributes.length > 0) {
            if (!targetOption.sub_attributes || targetOption.sub_attributes.length === 0) {
              targetOption.sub_attributes = JSON.parse(JSON.stringify(sourceOption.sub_attributes));
            } else {
              mergeNodes(targetOption.sub_attributes[0], sourceOption.sub_attributes[0]);
            }
          }
        }
      });
    };

    for (let i = 1; i < products.length; i++) {
      const productAttrs = parseAttributes(products[i].attributes);
      const sourceTree = productAttrs?.attribute_tree;
      if (sourceTree) {
        mergeNodes(mergedTree, sourceTree);
      }
    }
    return mergedTree;
  };
  // Hàm convert tên thành slug
  const slugify = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-'); // Loại bỏ các dấu gạch ngang liên tiếp
  };

  // Tạo bản đồ ánh xạ từ tên thuộc tính sang slug
  const fetchProducts = useCallback(async (categoryId, page, pageSize, search) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize, search };
      let response;
      
      if (categoryId === 'all' || !categoryId) {
        response = await productService.getProducts(params);
      } else {
        response = await productService.getProductsByCategory(categoryId, params);
      }
      
      // ===== SỬA LỖI LOGIC Ở ĐÂY =====
      // Truy cập vào lớp data lồng nhau: response.data.data.data và response.data.data.pagination
      const responseData = response.data.data; 
      const fetchedProducts = responseData?.data || [];

      // DEBUG: Log ra dữ liệu từ API
      console.log('=== FULL API Response ===', response);
      console.log('=== Response.data.data ===', responseData);
      console.log('=== Fetched Products ===', fetchedProducts);
      console.log('=== Fetched Products Count ===', fetchedProducts.length);
      
      if (fetchedProducts.length > 0) {
        console.log('=== First Product (Full) ===', JSON.stringify(fetchedProducts[0], null, 2));
        console.log('=== First Product Attributes ===', fetchedProducts[0].attributes);
        console.log('=== First Product Variants ===', fetchedProducts[0].variants);
        
        if (fetchedProducts[0].variants && fetchedProducts[0].variants.length > 0) {
          console.log('=== First Variant Attributes ===', fetchedProducts[0].variants[0].attributes);
        }
        
        // Check attribute_tree
        if (fetchedProducts[0].attributes?.attribute_tree) {
          console.log('=== Attribute Tree (exists!) ===', fetchedProducts[0].attributes.attribute_tree);
          console.log('=== Attribute Tree Slug ===', fetchedProducts[0].attributes.attribute_tree.slug);
          console.log('=== Attribute Tree Options ===', fetchedProducts[0].attributes.attribute_tree.options);
        } else {
          console.log('⚠️ NO attribute_tree in product.attributes');
          // Try parsing if it's a string
          const parsedAttr = parseAttributes(fetchedProducts[0].attributes);
          console.log('🔄 Parsed attributes:', parsedAttr);
          if (parsedAttr?.attribute_tree) {
            console.log('✅ Found attribute_tree after parsing!');
          }
        }
      }

      if (responseData && responseData.pagination && Array.isArray(fetchedProducts)) {
        setProducts(fetchedProducts);
        // Merge attribute trees from all products
        setAttributeTree(mergeAttributeTrees(fetchedProducts));
        
        // Extract brand from product.attributes.attribute_tree
        const uniqueBrands = [];
        const brandSet = new Set();
        
        console.log('✅ Looking for brands in products...');
        fetchedProducts.forEach((product, idx) => {
          console.log(`\n📦 Product ${idx}:`);
          
          // Parse attributes if it's a string
          const parsedAttributes = parseAttributes(product.attributes);
          if (!parsedAttributes) {
            console.log(`   ⚠️ No valid attributes (null or failed to parse)`);
            return;
          }
          
          // Extract from attribute_tree (only source now)
          const attrTree = parsedAttributes?.attribute_tree;
          if (attrTree) {
            console.log(`   - Has attribute_tree: slug="${attrTree.slug}"`);
            
            const brandSlugs = ['hang', 'thuong-hieu', 'brand', 'brands'];
            
            // Check if root node is brand
            if (brandSlugs.includes(attrTree.slug) && attrTree.options) {
              console.log(`✅ ROOT NODE IS BRAND! Options:`, attrTree.options.map(o => o.value).join(', '));
              attrTree.options.forEach(option => {
                if (option.value && !brandSet.has(option.value)) {
                  brandSet.add(option.value);
                  uniqueBrands.push({
                    id: option.slug,
                    name: option.value
                  });
                }
              });
            } else {
              // If not root, recursively search sub_attributes
              const findBrandNode = (node, depth = 0) => {
                if (!node) return;
                
                const indent = '   '.repeat(depth);
                
                if (brandSlugs.includes(node.slug) && node.options) {
                  console.log(`${indent}✅ FOUND BRAND NODE! Options:`, node.options.map(o => o.value).join(', '));
                  node.options.forEach(option => {
                    if (option.value && !brandSet.has(option.value)) {
                      brandSet.add(option.value);
                      uniqueBrands.push({
                        id: option.slug,
                        name: option.value
                      });
                    }
                  });
                  return true;
                }
                
                if (node.sub_attributes && node.sub_attributes.length > 0) {
                  return findBrandNode(node.sub_attributes[0], depth + 1);
                }
                return false;
              };
              
              findBrandNode(attrTree);
            }
          } else {
            console.log(`   ⚠️ No attribute_tree found in product`);
          }
        });
        
        console.log(`\n📊 Extracted ${uniqueBrands.length} unique brands:`, uniqueBrands.map(b => b.name).join(', '));
        
        console.log('Extracted brands:', uniqueBrands);
        setBrands(uniqueBrands);

        // Ánh xạ dữ liệu từ API sang cấu trúc state của Ant Design
        setPagination({
          current: responseData.pagination.currentPage,
          pageSize: responseData.pagination.itemsPerPage,
          total: responseData.pagination.totalItems,
        });
      } else {
        // Xử lý khi API không trả về đúng định dạng mong đợi
        console.error("API response for products is not in the expected format:", response.data);
        setAttributeTree(null);
        setProducts([]);
        setPagination({ current: 1, pageSize: 12, total: 0 });
      }
      // ==============================

    } catch (err) {
      message.error("Không thể tải danh sách sản phẩm.");
      setError("Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect để tải danh sách tất cả danh mục
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // 1. Tải danh sách tất cả danh mục
        const categoriesResponse = await productService.getCategories();
        const allCategories = categoriesResponse.data?.data || [];
        if (Array.isArray(allCategories)) {
            setCategories(allCategories);

            // ★ UPDATED: Check if categoryId comes from URL path (/category/:categoryId)
            // This runs AFTER categories are loaded
            let initialCategoryId;
            if (params.categoryId) {
              // Coming from /category/:categoryId route (poster redirect)
              initialCategoryId = params.categoryId;
              console.log(`📍 Category from URL param: ${initialCategoryId}`);
            } else {
              // Default: Find "Education" category
              const educationCategory = allCategories.find(
                cat => cat.name.toLowerCase() === 'education'
              );
              initialCategoryId = educationCategory ? educationCategory.id : 'all';
            }
            
            setSelectedCategoryId(initialCategoryId);

        } else {
            console.error("API response for categories is not in the expected format:", categoriesResponse.data);
            setSelectedCategoryId('all'); // Đặt về 'all' nếu có lỗi
        }
      } catch (err) {
        message.error("Không thể tải dữ liệu ban đầu.");
        setSelectedCategoryId('all'); // Đặt về 'all' nếu có lỗi
      } finally {
        // Không cần setLoading(false) ở đây vì useEffect tiếp theo sẽ xử lý
      }
    };
    fetchInitialData();
  }, [params.categoryId]); // ★ UPDATED: Add params.categoryId as dependency

  // useEffect để cập nhật tên và icon danh mục, cũng như fetch thuộc tính của danh mục
  useEffect(() => {
    const updateCategoryInfo = async () => {
      if (selectedCategoryId && selectedCategoryId !== 'all') {
        const cat = categories.find(c => c.id.toString() === selectedCategoryId.toString());
        if (cat) {
          setCategoryName(cat.name);
          // Định nghĩa icon cho từng danh mục dựa trên tên
          const iconMap = {
            'Tủ Lạnh': '❄️',
            'Máy Giặt': '🧺',
            'Máy Sấy': '💨',
            'Máy Lạnh': '❅'
          };
          setCategoryIcon(iconMap[cat.name] || '📦');

          // Fetch thuộc tính của danh mục
          try {
            console.log(`\n🔄 Fetching attributes for categoryId: ${selectedCategoryId}...`);
            const response = await productAttributeService.getAttributesByCategory(selectedCategoryId);
            console.log('📥 Raw API Response:', response);
            const attributes = response.data?.data || [];
            console.log('✅ Category Attributes:', attributes);
            console.log('📊 Attributes count:', attributes.length);
            console.log('📋 Attribute names:', attributes.map(a => a.name).join(', '));
            setCategoryAttributes(attributes);
          } catch (error) {
            console.error('❌ Error fetching category attributes:', error);
            setCategoryAttributes([]);
          }
        }
      } else {
        setCategoryName('Tất cả sản phẩm');
        setCategoryIcon('🛍️');
        setCategoryAttributes([]);
      }
    };
    updateCategoryInfo();
  }, [selectedCategoryId, categories]);

  // ★ NEW: useEffect để parse brand query parameter từ URL
  // Ví dụ: /category/1?brand=Samsung → auto-select Samsung
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandParam = params.get('brand');
    
    if (brandParam) {
      console.log(`🎯 Brand from URL query: ${brandParam}`);
      // Auto-select the brand from URL parameter
      setSelectedAttributes(prev => ({
        ...prev,
        'Thương Hiệu': brandParam,
        'Hãng': brandParam,
        'Brand': brandParam  // Try different attribute names
      }));
    }
  }, [location.search]);

  // Đồng bộ searchTerm từ URL khi người dùng được điều hướng tới
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search') || '';
    setSearchTerm(searchQuery);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset về trang 1 khi có tìm kiếm mới
  }, [location.search]);

  // ★ NEW: Adjust page size when filters change - fetch more items to ensure >= 12 results after filtering
  useEffect(() => {
    const hasActiveFilters = Object.keys(selectedAttributes).length > 0 || priceRange.min !== null || priceRange.max !== null;
    
    if (hasActiveFilters) {
      // When filtering, fetch 100 items to increase chance of having 12+ results after client-side filtering
      console.log('🔍 Active filters detected - increasing page size to 100');
      setPagination(prev => ({ ...prev, pageSize: 100, current: 1 }));
    } else {
      // When no filters, use default page size of 12
      console.log('✅ No filters - using default page size of 12');
      setPagination(prev => ({ ...prev, pageSize: 12, current: 1 }));
    }
  }, [selectedAttributes, priceRange]);

  // useEffect để gọi lại API sản phẩm khi bộ lọc hoặc trang thay đổi
  // Đã tích hợp debounce cho việc tìm kiếm
  useEffect(() => {
    // Sử dụng debounce để tránh gọi API liên tục khi người dùng gõ
    const handler = setTimeout(() => {
      // Chỉ gọi fetchProducts khi selectedCategoryId đã được thiết lập
      if (selectedCategoryId !== null) {
        fetchProducts(selectedCategoryId, pagination.current, pagination.pageSize, searchTerm);
      }
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(handler); // Hủy bỏ timeout nếu người dùng gõ tiếp
    };
  }, [selectedCategoryId, pagination.current, pagination.pageSize, searchTerm, fetchProducts]);

  // Helper function to extract brand from product name
  const extractBrandFromName = (productName) => {
    if (!productName) return null;
    const brands = ['Samsung', 'LG', 'Sharp', 'Toshiba', 'Panasonic', 'Fujitsu', 'Electrolux', 'Hitachi', 'Daikin', 'Aqua', 'Midea', 'Sunhouse', 'Philips', 'Kangaroo', 'Xiaomi'];
    for (const brand of brands) {
      if (productName.includes(brand)) {
        return brand;
      }
    }
    return null;
  };

  // useEffect để lọc sản phẩm ở client-side khi thuộc tính thay đổi
  useEffect(() => {
    const hasAttributeFilter = Object.keys(selectedAttributes).length > 0;
    const hasPriceFilter = priceRange.min !== null || priceRange.max !== null;
    const hasSortOrder = !!sortOrder;

    if (!hasAttributeFilter && !hasPriceFilter && !hasSortOrder) {
      setFilteredProducts(products);
      return;
    }

    let tempFilteredProducts = [...products]; // Tạo bản sao để sắp xếp không ảnh hưởng state gốc

    // Lọc theo giá
    if (hasPriceFilter) {
      tempFilteredProducts = tempFilteredProducts.filter(product => {
        // Try to get price from variants first (new products), then fallback to direct price field (old products)
        const price = product.variants && product.variants.length > 0 
          ? parseFloat(product.variants[0].price) 
          : parseFloat(product.price);
        const min = priceRange.min !== null ? priceRange.min : 0;
        const max = priceRange.max !== null ? priceRange.max : Infinity;
        return !isNaN(price) && price >= min && price <= max;
      });
    }

    // Lọc theo thuộc tính (Brand/Hãng)
    if (hasAttributeFilter) {
      tempFilteredProducts = tempFilteredProducts.filter(product => {
        console.log(`\n🔍 Filtering product: ${product.name}`);
        console.log(`   Selected attributes:`, selectedAttributes);
        
        // Extract the actual brand from product name (e.g., "Tủ Lạnh Samsung 300L" -> "Samsung")
        const productBrand = extractBrandFromName(product.name);
        console.log(`   Product brand (from name): ${productBrand}`);
        
        // Check each selected attribute
        for (const [attrName, selectedValue] of Object.entries(selectedAttributes)) {
          console.log(`   Checking ${attrName} = ${selectedValue}`);
          
          // For brand attributes, compare the extracted brand with selected value
          if (slugify(attrName) === 'hang' || attrName === 'Hãng' || attrName === 'Thương Hiệu') {
            // If product brand matches selected brand, keep the product
            if (productBrand === selectedValue) {
              console.log(`   ✅ MATCH! Product brand ${productBrand} matches selected ${selectedValue}`);
              return true;
            }
          }
        }
        
        console.log(`   ❌ NO MATCH`);
        return false;
      });
    }

    // Sắp xếp sản phẩm
    if (hasSortOrder) {
      tempFilteredProducts.sort((a, b) => {
        // Try to get price from variants first (new products), then fallback to direct price field (old products)
        const priceA = a.variants && a.variants.length > 0 
          ? parseFloat(a.variants[0].price) 
          : parseFloat(a.price || 0);
        const priceB = b.variants && b.variants.length > 0 
          ? parseFloat(b.variants[0].price) 
          : parseFloat(b.price || 0);
        
        if (sortOrder === 'price_asc') {
          return priceA - priceB;
        }
        return priceB - priceA; // 'price_desc'
      });
    }

    setFilteredProducts(tempFilteredProducts);

  }, [products, selectedAttributes, priceRange, sortOrder]);

  const handleCategorySelect = (categoryId) => {
    console.log(`🔄 Category changed to: ${categoryId}`);
    setSelectedCategoryId(categoryId);
    setSelectedAttributes({}); // Reset bộ lọc các attribute khi đổi danh mục
    setAttributeTree(null);
    setPagination(prev => ({ ...prev, current: 1 }));
    setPriceRange({ min: null, max: null });
    setSortOrder(null);
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };
  
  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleAttributeChange = (selectedAttrs) => {
    console.log(`🎯 Attributes changed:`, selectedAttrs);
    setSelectedAttributes(selectedAttrs);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <Layout>
      <Content style={{ padding: '16px 24px' }}>
        {/* Category Header - Poster Banner */}
        <CategoryPoster 
          categoryName={categoryName} 
          categoryIcon={categoryIcon}
          categoryId={selectedCategoryId}
        />

        {/* Horizontal Filters - Below Poster */}
        <HorizontalFilters
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          categoryName={categoryName} // ★ ADDED: Pass categoryName so Select displays name instead of ID
          onCategorySelect={handleCategorySelect}
          
          brands={brands}
          selectedBrand={selectedAttributes.brandAttrName}
          onBrandSelect={(brand) => console.log('Brand selected:', brand)}
          
          categoryAttributes={categoryAttributes}
          selectedAttributes={selectedAttributes}
          onAttributeChange={handleAttributeChange}
          
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
        />

        {/* Main Content Section - Products Full Width */}
        <Row gutter={[16, 16]}>
          {/* Center - Products Full Width */}
          <Col xs={24} md={18}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>Sản phẩm</Title>
              <Select
                placeholder="Sắp xếp"
                style={{ width: 180 }}
                onChange={handleSortChange}
                value={sortOrder}
                size="middle"
                options={[
                  { label: 'Mặc định', value: null },
                  { label: 'Giá: Thấp → Cao', value: 'price_asc' },
                  { label: 'Giá: Cao → Thấp', value: 'price_desc' }
                ]}
              />
            </div>
            {error ? (
              <Alert message="Lỗi" description={error} type="error" showIcon />
            ) : (
              <ProductList
                loading={loading}
                products={filteredProducts}
                pagination={pagination}
                onPageChange={handlePageChange}
                selectedAttributes={selectedAttributes}
              />
            )}
          </Col>

          {/* Right - Cart (Desktop only) */}
          {isDesktop && (
            <Col lg={6}>
              <SideCart />
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default ProductsPage;