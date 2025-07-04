import React from 'react'
import Header from '../../component/Header/Header'
import Hero from '../../component/Hero/Hero'
import ProductItem from '../../component/ProductItems/ProductItems'
import CommunitySection from '../../component/ComunityHeroSection/CommunitySection'
import GallerySlider from '../../component/GallerySlider/GallerySlider'
import BestSeller from '../../component/BestSeller/BestSeller'
import Footer from '../../component/Footer/Footer'
import BackToTop from '../../component/BackToTop/BackToTop'

const Homepage = () => {
  return (
    <>
        <Header/>
        <Hero/>
        <ProductItem/>
        <CommunitySection/>
        <GallerySlider/>
        <BestSeller/>
        <Footer/>
        <BackToTop/>
    </>
  )
}

export default Homepage