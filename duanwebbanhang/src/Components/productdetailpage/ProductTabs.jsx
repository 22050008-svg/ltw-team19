import React, { useMemo } from 'react';
import { Tabs, Card, Table, Typography } from 'antd';
import './styles/ProductTabs.css';

const { Title, Paragraph, Text } = Typography;

/**
 * ProductTabs - Hiển thị thông tin sản phẩm trong các tabs
 * - Mô tả sản phẩm (HTML)
 * - Thông số kỹ thuật (Bảng specs)
 * - Hướng dẫn sử dụng (Text/HTML)
 */
const ProductTabs = ({ product }) => {
  // Xử lý HTML description
  const processedDescription = useMemo(() => {
    if (!product.htmlDescription) {
      return product.description || 'Không có mô tả sản phẩm';
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
    const parser = new DOMParser();
    const doc = parser.parseFromString(product.htmlDescription, 'text/html');

    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const currentSrc = img.getAttribute('src');
      if (currentSrc && !/^(https?:)?\/\//.test(currentSrc)) {
        const newSrc = currentSrc.startsWith('/') ? currentSrc : `/${currentSrc}`;
        img.src = `${baseUrl}${newSrc}`;
      }
    });
    return doc.body.innerHTML;
  }, [product.htmlDescription, product.description]);

  // Xử lý HTML usage guide
  const processedUsageGuide = useMemo(() => {
    if (!product.usageGuide) {
      return 'Không có hướng dẫn sử dụng';
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4321';
    const parser = new DOMParser();
    const doc = parser.parseFromString(product.usageGuide, 'text/html');

    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const currentSrc = img.getAttribute('src');
      if (currentSrc && !/^(https?:)?\/\//.test(currentSrc)) {
        const newSrc = currentSrc.startsWith('/') ? currentSrc : `/${currentSrc}`;
        img.src = `${baseUrl}${newSrc}`;
      }
    });
    return doc.body.innerHTML;
  }, [product.usageGuide]);

  // Xử lý specifications data
  const getSpecificationsData = () => {
    console.log('[ProductTabs] Debug specs:', {
      hasSpecifications: !!product.specifications,
      specificationsType: typeof product.specifications,
      specifications: product.specifications,
      isArray: Array.isArray(product.specifications)
    });

    if (!product.specifications) {
      console.warn('[ProductTabs] No specifications found');
      return [];
    }

    // Nếu là array thông thường
    if (Array.isArray(product.specifications)) {
      // Kiểm tra nếu có sections
      if (product.specifications.length > 0 && product.specifications[0].section) {
        // Format: [{ section: "...", items: [{ label: "...", value: "..." }] }]
        console.log('[ProductTabs] Using grouped specifications');
        return product.specifications;
      } else {
        // Format: [{ label: "...", value: "..." }]
        console.log('[ProductTabs] Using flat specifications');
        return [{ section: 'Thông số chung', items: product.specifications }];
      }
    }

    return [];
  };

  const specificationsData = getSpecificationsData();

  // Cấu trúc tabs
  const tabItems = [
    {
      key: 'description',
      label: 'Mô Tả Sản Phẩm',
      children: (
        <div className="product-description-tab">
          <div
            className="prose max-w-none product-html-content"
            dangerouslySetInnerHTML={{ __html: processedDescription }}
          />
        </div>
      ),
    },
    {
      key: 'specifications',
      label: 'Thông Số Kỹ Thuật',
      children: (
        <div className="product-specifications-tab">
          {specificationsData.length > 0 ? (
            <div className="specifications-container">
              {specificationsData.map((section, idx) => (
                <div key={idx} className="specifications-section">
                  {section.section && (
                    <Title level={4} className="specifications-section-title">
                      {section.section}
                    </Title>
                  )}
                  <table className="specifications-table">
                    <tbody>
                      {section.items && section.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="spec-row">
                          <td className="spec-label">
                            <Text strong>{item.label}</Text>
                          </td>
                          <td className="spec-value">
                            <div style={{ 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontFamily: 'inherit',
                              lineHeight: '1.6',
                              color: '#262626',
                              fontSize: '14px'
                            }}>
                              {item.value}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <Paragraph>Chưa có thông số kỹ thuật cho sản phẩm này.</Paragraph>
          )}
        </div>
      ),
    },
  ];

  // Thêm tab hướng dẫn sử dụng nếu có dữ liệu
  if (product.usageGuide) {
    tabItems.push({
      key: 'usage-guide',
      label: 'Hướng Dẫn Sử Dụng',
      children: (
        <div className="product-usage-guide-tab">
          <div
            className="prose max-w-none product-html-content"
            dangerouslySetInnerHTML={{ __html: processedUsageGuide }}
          />
        </div>
      ),
    });
  }

  return (
    <Card 
      className="product-tabs-card" 
      variant="borderless"
      styles={{
        body: { padding: '0px' }
      }}
    >
      <Tabs 
        items={tabItems} 
        defaultActiveKey="description"
        size="large"
        className="product-info-tabs"
      />
    </Card>
  );
};

export default ProductTabs;
