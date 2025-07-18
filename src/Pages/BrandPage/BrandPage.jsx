import React, { useEffect } from 'react';
import './BrandPage.css';

/**
 * BrandPage Component - Displays the brand story, features, and values
 * 
 * Features:
 * - Hero section with animated wave effect
 * - Three feature cards highlighting unique selling points
 * - Values section with numbered value cards
 * - Responsive design for all screen sizes
 * - Smooth hover animations and transitions
 */
const BrandPage = () => {
  useEffect(()=>{
    document.title = 'BrandPage | RS Clothing'
  },[])
  return (
    <>
      
      {/* Main Brand Page Content */}
      <div className="brand-page">
        {/* Hero Section with gradient background and wave effect */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Our Brand Story</h1>
            <p className="hero-subtitle">Where Tradition Meets Innovation</p>
          </div>
          {/* Animated wave SVG at bottom of hero section */}
          <div className="hero-wave">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>

        {/* Features Section with three highlight cards */}
        <section className="features-section">
          <div className="section-header">
            <h2>Why Choose Us?</h2>
            <p>Discover what makes us different</p>
          </div>

          {/* Features Grid with three cards */}
          <div className="features-grid">
            {/* Color Feature Card */}
            <div className="feature-card color-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <h3>Unique Colors</h3>
              <p>
                India has always been an epitome of rich culture and vibrant colors. 
                Taking this inspiration forward we make sure to provide our consumers 
                with a diverse mix of fabric colors to suit the fashion sense of every 
                individual. With over 50 new colors introduced every season we ensure 
                a Fashion First approach.
              </p>
              {/* Color swatches visual element */}
              <div className="color-swatches">
                <div className="swatch" style={{backgroundColor: '#FF6B6B'}}></div>
                <div className="swatch" style={{backgroundColor: '#4ECDC4'}}></div>
                <div className="swatch" style={{backgroundColor: '#45B7D1'}}></div>
                <div className="swatch" style={{backgroundColor: '#FFBE0B'}}></div>
                <div className="swatch" style={{backgroundColor: '#8338EC'}}></div>
              </div>
            </div>

            {/* Packaging Feature Card */}
            <div className="feature-card packaging-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <h3>Reusable Packaging</h3>
              <p>
                Whether you need a stationary pouch for college or a gym shaker, 
                our creative team designs packaging you can reuse. Our apparel 
                packaging transforms into toiletry pouches, stationary boxes or 
                water bottles - saving you money while being eco-friendly.
              </p>
              {/* Packaging examples */}
              <div className="packaging-examples">
                <div className="example">Stationary Pouch</div>
                <div className="example">Toiletry Bag</div>
                <div className="example">Water Bottle</div>
              </div>
            </div>

            {/* Factory Feature Card */}
            <div className="feature-card factory-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3>Straight from Manufacturer</h3>
              <p>
                We're vertically integrated to deliver perfect quality at the right price 
                by eliminating middlemen. With 25+ years in garment design, manufacturing 
                and distribution, we offer the ideal mix of quality and price with 
                nominal margins.
              </p>
              {/* Stats visualization */}
              <div className="stats">
                <div className="stat">
                  <span>25+</span>
                  <p>Years Experience</p>
                </div>
                <div className="stat">
                  <span>0</span>
                  <p>Middlemen</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section with three core values */}
        <section className="values-section">
          <div className="value-cards">
            <div className="value-card">
              <div className="value-number">01</div>
              <h3>Heritage</h3>
              <p>Rooted in India's rich textile traditions</p>
            </div>
            <div className="value-card">
              <div className="value-number">02</div>
              <h3>Innovation</h3>
              <p>Constantly evolving with new designs</p>
            </div>
            <div className="value-card">
              <div className="value-number">03</div>
              <h3>Sustainability</h3>
              <p>Eco-friendly materials and processes</p>
            </div>
          </div>
        </section>
      </div>
      
    </>
  );
};

export default BrandPage;