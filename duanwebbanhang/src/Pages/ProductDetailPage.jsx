// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Row, Col, Spin, Alert, message } from 'antd';
// import productService from '../Services/ProductService';
// import ProductImageGallery from '../Components/productdetailpage/ProductImageGallery';
// import ProductInfo from '../Components/productdetailpage/ProductInfo';
// import ProductDescription from '../Components/productdetailpage/ProductDescription';
// import { useCart } from '../Context/CartContext';

// const ProductDetailPage = () => {
//   const { id } = useParams(); // Lấy ID sản phẩm từ URL
//   const navigate = useNavigate();
//   const { addOrUpdateItem } = useCart();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [addingToCart, setAddingToCart] = useState(false);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       setLoading(true);
//       try {
//         const response = await productService.getProductById(id);
//         if (response.data && response.data.data) {
//           setProduct(response.data.data);
//         } else {
//           setError('Không tìm thấy sản phẩm.');
//         }
//       } catch (err) {
//         console.error("Lỗi khi tải chi tiết sản phẩm:", err);
//         setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
//         message.error('Lỗi kết nối đến máy chủ!');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//     // Cuộn lên đầu trang mỗi khi ID thay đổi
//     window.scrollTo(0, 0);
//   }, [id]);

//   const handleAddToCart = async (quantity) => {
//     setAddingToCart(true);
//     try {
//       await addOrUpdateItem(product.id, quantity);
//       message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
//     } catch (error) {
//       message.error('Thêm sản phẩm thất bại, vui lòng thử lại.');
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleBuyNow = async (quantity) => {
//     await handleAddToCart(quantity);
//     navigate('/checkout');
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
//   }

//   if (error) {
//     return <Alert message="Lỗi" description={error} type="error" showIcon className="m-4" />;
//   }

//   if (!product) {
//     return <Alert message="Thông báo" description="Không tìm thấy sản phẩm." type="warning" showIcon className="m-4" />;
//   }

//   return (
//     <div className="container mx-auto p-4 md:p-8">
//       <Row gutter={[{ xs: 16, sm: 24, md: 32, lg: 48 }, { xs: 16, sm: 24, md: 32, lg: 48 }]}>
//         <Col xs={24} lg={12}>
//           <ProductImageGallery images={product.images} productName={product.name} />
//         </Col>
//         <Col xs={24} lg={12}>
//           <ProductInfo product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} loading={addingToCart} />
//         </Col>
//       </Row>
//       <Row className="mt-8">
//         <Col span={24}>
//           <ProductDescription product={product} />
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default ProductDetailPage;




import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Alert, message } from 'antd';
import productService from '../Services/ProductService';
import ProductImageGallery from '../Components/productdetailpage/ProductImageGallery';
import ProductInfo from '../Components/productdetailpage/ProductInfo';
import ProductTabs from '../Components/productdetailpage/ProductTabs';
import ProductReviews from '../Components/products/ProductReviews';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';

/**
 * Hàm trợ giúp (helper function) để trích xuất tất cả các URL hình ảnh từ đối tượng sản phẩm thô.
 * Nó thu thập ảnh từ:
 * 1. Thuộc tính `imageUrl` chính.
 * 2. Các thẻ `<img>` bên trong chuỗi `htmlDescription`.
 * 3. Các thuộc tính `image_url` lồng nhau bên trong `attributes`.
 * @param {object} product - Đối tượng sản phẩm nhận từ API.
 * @returns {Array<{id: number, url: string}>} - Một mảng các đối tượng ảnh đã được chuẩn hóa.
 */
const extractImagesFromProduct = (product) => {
  // Sử dụng Set để đảm bảo mỗi URL chỉ được thêm một lần, tránh trùng lặp.
  const imageUrls = new Set();

  // 1. Lấy ảnh từ ProductImage array trước tiên (ưu tiên cao nhất)
  if (product.productImages && Array.isArray(product.productImages)) {
    product.productImages.forEach(img => {
      if (img.imageUrl) imageUrls.add(img.imageUrl);
      if (img.image_url) imageUrls.add(img.image_url);
    });
  }

  // 2. Lấy ảnh từ variants nếu có
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach(variant => {
      if (variant.image_url) {
        imageUrls.add(variant.image_url);
      } else if (variant.imageUrl) {
        imageUrls.add(variant.imageUrl);
      }
    });
  }

  // 3. Lấy ảnh đại diện chính từ thuộc tính 'imageUrl' hoặc 'image_url'.
  if (product.imageUrl) {
    imageUrls.add(product.imageUrl);
  }
  if (product.image_url) {
    imageUrls.add(product.image_url);
  }
  
  // 4. Lấy ảnh từ mảng images nếu có (legacy)
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img.url) imageUrls.add(img.url);
      if (img.image_url) imageUrls.add(img.image_url);
    });
  }

  // 5. ★ REMOVED: Do NOT extract images from htmlDescription
  // Only use images from productImages, variants, and imageUrl fields
  // if (product.htmlDescription) {
  //   const regex = /<img[^>]+src="([^">]+)"/g;
  //   let match;
  //   while ((match = regex.exec(product.htmlDescription)) !== null) {
  //     imageUrls.add(match[1]);
  //   }
  // }
  
  // 6. (Nâng cao) Lấy ảnh từ các thuộc tính lồng nhau (attributes).
  // Đây là một hàm đệ quy để duyệt qua cấu trúc cây của các thuộc tính.
  const findImageUrlsInAttributes = (node) => {
    if (!node) return;
    // Nếu node có một mảng 'options'.
    if (node.options && Array.isArray(node.options)) {
      node.options.forEach(option => {
        // Lấy image_url nếu có.
        if (option.image_url) {
          imageUrls.add(option.image_url);
        }
        // Nếu option có các thuộc tính con, gọi lại hàm đệ quy.
        if (option.sub_attributes) {
          option.sub_attributes.forEach(sub => findImageUrlsInAttributes(sub));
        }
      });
    }
  };

  // Bắt đầu quá trình duyệt đệ quy từ gốc của cây thuộc tính.
  if (product.attributes?.attribute_tree) {
    findImageUrlsInAttributes(product.attributes.attribute_tree);
  }

  // 7. Chuyển đổi Set các URL đã thu thập được thành một mảng các đối tượng
  // theo định dạng mà component `ProductImageGallery` yêu cầu: [{ id, url }].
  console.log('Extracted images from product:', Array.from(imageUrls));
  return Array.from(imageUrls).map((url, index) => ({
    id: index + 1, // Tạo một ID duy nhất đơn giản dựa trên chỉ số.
    url: url,
  }));
};


const ProductDetailPage = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate();
  const { addOrUpdateItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get current user from AuthContext instead of localStorage
  const { user: currentUser, token } = useAuth();
  const isAuthenticated = !!currentUser && !!token;

  useEffect(() => {
    console.log('[ProductDetailPage] Auth Status:', { 
      isAuthenticated, 
      userId: currentUser?.id,
      userName: currentUser?.fullName,
      hasToken: !!token 
    });
  }, [isAuthenticated, currentUser, token]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null); // Reset lỗi mỗi khi fetch sản phẩm mới
      try {
        const response = await productService.getProductById(id);
        
        // Kiểm tra xem dữ liệu nằm ở response.data.data hay response.data
        const productData = response.data?.data || response.data; 

        if (productData && typeof productData === 'object') {
          // **Bước xử lý chính:**
          // Gọi hàm trợ giúp để trích xuất và tập hợp tất cả các hình ảnh.
          const extractedImages = extractImagesFromProduct(productData);
          
          console.log('[DEBUG] Product Data:', {
            hasProductImages: !!productData.productImages,
            productImagesCount: productData.productImages?.length || 0,
            extractedImagesCount: extractedImages.length,
            firstProductImage: productData.productImages?.[0],
            firstExtractedImage: extractedImages[0],
            hasSpecifications: !!productData.specifications,
            specifications: productData.specifications,
            hasHtmlDescription: !!productData.htmlDescription,
            hasUsageGuide: !!productData.usageGuide
          });

          // Tạo một đối tượng sản phẩm mới hoàn chỉnh bằng cách sao chép dữ liệu cũ
          // và thêm vào thuộc tính `images` mà chúng ta vừa tạo.
          const productWithImages = { 
            ...productData, 
            images: extractedImages,
            productImages: productData.productImages // Pass raw productImages
          };
          
          // Cập nhật state với đối tượng sản phẩm đã được làm giàu dữ liệu.
          setProduct(productWithImages);
        } else {
          setError('Không tìm thấy sản phẩm.');
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        message.error('Lỗi kết nối đến máy chủ!');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Cuộn lên đầu trang mỗi khi ID sản phẩm thay đổi
    window.scrollTo(0, 0);
  }, [id]); // Effect sẽ chạy lại mỗi khi `id` trên URL thay đổi

  const handleAddToCart = async (quantity) => {
    setAddingToCart(true);
    try {
      // ★ THAY ĐỔI: gửi productVariantId (variant[0].id) thay vì product.id
      const productVariantId = product.variants?.[0]?.id;
      if (!productVariantId) {
        message.error('Sản phẩm này không có variant nào');
        setAddingToCart(false);
        return;
      }

      console.log('[ProductDetailPage] Adding to cart:', { productVariantId, quantity });
      await addOrUpdateItem(productVariantId, quantity);
      message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (error) {
      message.error('Thêm sản phẩm thất bại, vui lòng thử lại.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async (quantity) => {
    // Luôn thêm vào giỏ hàng trước khi chuyển hướng
    await handleAddToCart(quantity);
    // Chỉ chuyển hướng nếu việc thêm vào giỏ thành công (có thể kiểm tra thêm nếu cần)
    navigate('/checkout');
  };

  // Trạng thái đang tải
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  // Trạng thái có lỗi
  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon className="m-4" />;
  }

  // Trạng thái không tìm thấy sản phẩm
  if (!product) {
    return <Alert message="Thông báo" description="Không tìm thấy sản phẩm." type="warning" showIcon className="m-4" />;
  }

  // Trạng thái hiển thị thành công
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Row gutter={[{ xs: 16, sm: 24, md: 32, lg: 48 }, { xs: 16, sm: 24, md: 32, lg: 48 }]}>
        <Col xs={24} lg={12}>
          {/* Component này giờ sẽ nhận được `product.images` như nó mong muốn, cùng variants */}
          <ProductImageGallery images={product.images} productImages={product.productImages} productName={product.name} variants={product.variants} />
        </Col>
        <Col xs={24} lg={12}>
          <ProductInfo product={product} productImages={product.productImages || []} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} loading={addingToCart} />
        </Col>
      </Row>
      <Row className="mt-8">
        <Col span={24}>
          <ProductTabs product={product} />
        </Col>
      </Row>
      <Row className="mt-8">
        <Col span={24}>
          <ProductReviews 
            productId={product.id} 
            isAuthenticated={isAuthenticated}
            userId={currentUser?.id}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;