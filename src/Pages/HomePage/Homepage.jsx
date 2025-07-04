import React from 'react'
import Header from '../../component/Header/Header'
import Hero from '../../component/Hero/Hero'
import ProductItem from '../../component/ProductItems/ProductItems'
import CommunitySection from '../../component/ComunityHeroSection/CommunitySection'
import GallerySlider from '../../component/GallerySlider/GallerySlider'
import BestSeller from '../../component/BestSeller/BestSeller'
import Footer from '../../component/Footer/Footer'
import useBackToTop from '../../component/Customhook/useBackToTop'


const Homepage = () => {
  const { isVisible, scrollToTop } = useBackToTop();
  return (
    <>
        <Header/>
        <Hero/>
        <ProductItem/>
        <CommunitySection/>
        <GallerySlider/>
        <BestSeller/>
        <Footer/>
         {isVisible && (
        <button 
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          ↑
        </button>
      )}
    </>
  )
}

export default Homepage