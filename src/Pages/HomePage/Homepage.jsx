/**
 * Homepage Component - The main landing page of the application
 * 
 * This component serves as the container for all homepage sections including:
 * - Header navigation
 * - Hero banner
 * - Product listings
 * - Community section
 * - Image gallery slider
 * - Best seller products
 * - Footer
 * - Back to top button
 * 
 * Each section is implemented as a separate component for modularity and reusability.
 */

import React from 'react'

// Import all section components
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
    /**
     * Fragment used to group multiple components without adding extra nodes to the DOM
     * 
     * Component Order:
     * 1. Header - Top navigation bar
     * 2. Hero - Main banner/hero section
     * 3. ProductItem - Featured product listings
     * 4. CommunitySection - Community engagement section
     * 5. GallerySlider - Image gallery/carousel
     * 6. BestSeller - Best selling products showcase
     * 7. Footer - Page footer with links and information
     * 8. BackToTop - Floating button to scroll to top
     */
    <>
        {/* Main site header with navigation */}
        <Header/>
        
        {/* Hero banner section - typically contains a large image and call-to-action */}
        <Hero/>
        
        {/* Product listings/grid section */}
        <ProductItem/>
        
        {/* Community engagement/features section */}
        <CommunitySection/>
        
        {/* Image gallery slider/carousel component */}
        <GallerySlider/>
        
        {/* Best selling products showcase */}
        <BestSeller/>
        
        {/* Main site footer with links and information */}
        <Footer/>
        
        {/* Floating back-to-top button that appears when scrolling down */}
        <BackToTop/>
    </>
  )
}

export default Homepage