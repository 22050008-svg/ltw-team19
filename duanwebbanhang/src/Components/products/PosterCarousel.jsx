// src/Components/products/PosterCarousel.jsx
import React, { useState, useEffect } from 'react';
import { Carousel, Empty, Spin, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PosterService from '../../Services/PosterService';
import './PosterCarousel.css';

const PosterCarousel = ({ categoryId }) => {
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = React.useRef();

  // Lấy danh sách poster
  useEffect(() => {
    if (!categoryId) return;
    
    const fetchPosters = async () => {
      try {
        setLoading(true);
        const response = await PosterService.getPostersByCategory(categoryId, {
          limit: 100,
          isActive: true
        });
        setPosters(response.data?.data || []);
      } catch (error) {
        console.error('Lỗi tải poster:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="poster-carousel-container">
        <Spin size="large" />
      </div>
    );
  }

  if (posters.length === 0) {
    return null; // Không hiển thị nếu không có poster
  }

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
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
    <div className="poster-carousel-container">
      <div className="poster-carousel-wrapper">
        <Carousel
          ref={carouselRef}
          autoplay
          autoplaySpeed={5000}
          effect="fade"
          dots={posters.length > 1}
          infinite
        >
          {posters.map((poster) => (
            <div 
              key={poster.id} 
              className="poster-slide"
              style={{ cursor: poster.redirectUrl ? 'pointer' : 'default' }}
              onClick={() => handlePosterClick(poster)}
            >
              <img
                src={poster.imageUrl}
                alt={poster.title}
                className="poster-image"
              />
              {/* Title hidden - display image only */}
            </div>
          ))}
        </Carousel>

        {/* Navigation buttons */}
        {posters.length > 1 && (
          <>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<LeftOutlined />}
              className="carousel-nav-btn carousel-prev-btn"
              onClick={handlePrev}
            />
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<RightOutlined />}
              className="carousel-nav-btn carousel-next-btn"
              onClick={handleNext}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PosterCarousel;
