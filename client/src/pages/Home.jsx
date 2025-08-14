
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { valideURLConvert } from '../utils/valideURLConvert';
import { useNavigate } from 'react-router-dom';
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay';

// Desktop banners
import banner1Desktop from "../assets/banner1-desktop.png";
import banner2Desktop from "../assets/banner2-desktop.png";
import banner3Desktop from "../assets/banner3-deskto.png";

// Mobile banners
import banner1Mobile from "../assets/banner1-mobile.png";
import banner2Mobile from "../assets/banner2-mobile.png";
import banner3Mobile from "../assets/banner3-mobile.png";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const desktopBanners = [banner1Desktop, banner2Desktop, banner3Desktop];
const mobileBanners = [banner1Mobile, banner2Mobile, banner3Mobile];

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory);
  const categoryData = useSelector(state => state.product.allCategory);
  const subCategoryData = useSelector(state => state.product.allSubCategory);
  const navigate = useNavigate();

  // Track screen size for responsive slider
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRedirectProductListpage = (id, cat) => {
    const subcategory = subCategoryData.find(sub => {
      const match = sub.category.some(c => c._id === id);
      return match ? true : null;
    });

    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`;
    navigate(url);
  };

  return (
    <section className="bg-white">
      {/* Banner Slider */}
      <div className="container mx-auto">
        <Swiper
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full min-h-48 rounded"
        >
          {(isMobile ? mobileBanners : desktopBanners).map((banner, index) => (
            <SwiperSlide key={index}>
              <img
                src={banner}
                alt={`banner-${index}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Category Section */}
      <div className="container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {loadingCategory ? (
          new Array(12).fill(null).map((_, index) => (
            <div
              key={index + "loadingcategory"}
              className="bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse"
            >
              <div className="bg-blue-100 min-h-24 rounded"></div>
              <div className="bg-blue-100 h-8 rounded"></div>
            </div>
          ))
        ) : (
          categoryData.map(cat => (
            <div
              key={cat._id + "displayCategory"}
              className="w-full h-full"
              onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            >
              <img
                src={cat.image}
                className="w-full h-full object-scale-down"
                alt={cat.name}
              />
            </div>
          ))
        )}
      </div>

      {/* Display category products */}
      {categoryData?.map(c => (
        <CategoryWiseProductDisplay
          key={c?._id + "CategorywiseProduct"}
          id={c?._id}
          name={c?.name}
        />
      ))}
    </section>
  );
};

export default Home;

