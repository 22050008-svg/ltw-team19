import React, { useState, useEffect } from 'react';
import { Carousel, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import PosterService from '../../Services/PosterService';

// Backend URL từ axiosConfig
const BACKEND_URL = 'http://localhost:4321';

/**
 * Component hiển thị poster/banner của danh mục sản phẩm
 * @param {string} categoryName - Tên danh mục
 * @param {string} categoryIcon - Icon của danh mục
 * @param {number} categoryId - ID của danh mục
 */
export default function CategoryPoster({ categoryName, categoryIcon, categoryId }) {
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchPosters();
    }
  }, [categoryId]);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const response = await PosterService.getPostersByCategory(categoryId);
      
      // Extract poster array from nested response structure
      const dataWrapper = response.data?.data;
      if (dataWrapper && Array.isArray(dataWrapper.data)) {
        setPosters(dataWrapper.data);
      }
    } catch (error) {
      console.error('❌ Error fetching category posters:', error);
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  // ★ THÊM: Handle poster click - navigate to redirectUrl
  const handlePosterClick = (poster) => {
    if (poster.redirectUrl) {
      // Check if it's an external URL or internal route
      if (poster.redirectUrl.startsWith('http')) {
        window.open(poster.redirectUrl, '_blank');
      } else {
        navigate(poster.redirectUrl);
      }
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Category Header - HIDDEN */}

      {/* Category Posters Carousel */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin />
        </div>
      ) : posters.length > 0 ? (
        <Carousel
          autoplay
          autoplaySpeed={6000}
          effect="fade"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          {posters.map((poster) => (
            <div 
              key={poster.id} 
              style={{ position: 'relative', cursor: poster.redirectUrl ? 'pointer' : 'default' }}
              onClick={() => handlePosterClick(poster)}
            >
              <img
                src={`${BACKEND_URL}${poster.imageUrl}`}
                alt={poster.title}
                style={{
                  width: '100%',
                  height: '340px',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px'
                }}
              />
              {/* Overlay gradient */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                  borderRadius: '12px'
                }}
              />
              
              {/* Content overlay - HIDDEN */}
              {/* Title and description are not displayed */}
            </div>
          ))}
        </Carousel>
      ) : null}
    </div>
  );
}
