import React from "react";
import "./GallerySlider.css"; // Import the associated CSS file for styling

/**
 * GallerySlider Component
 * 
 * A horizontal image gallery slider that displays a collection of images in a scrollable container.
 * Features:
 * - Responsive design
 * - Smooth horizontal scrolling
 * - Fixed width items with consistent spacing
 * - Optimized for performance with proper image attributes
 */
const images = [
  "//www.zuclothing.com/cdn/shop/files/USPS-1-01_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-02_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-03_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-04_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-05_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/USPS-1-06_1.webp?v=1703765101",
  "//www.zuclothing.com/cdn/shop/files/free-shipping.jpg?v=1710403069",
  "//www.zuclothing.com/cdn/shop/files/easy-return.jpg?v=1710403068",
];

const GallerySlider = () => (
  // Main section container with overflow hidden to contain the gallery
  <section className="gallery-section">
    {/* Gallery container with horizontal padding */}
    <div className="gallery-container">
      {/* Unordered list for semantic markup and better accessibility */}
      <ul className="gallery-list p-0" type='none'>
        {/* Map through images array to render each gallery item */}
        {images.map((src, idx) => (
          <li key={idx} className="gallery-item">
            {/* Wrapper div for consistent image sizing */}
            <div className="gallery-image-wrapper">
              {/* Image element with proper alt text for accessibility */}
              <img 
                src={src} 
                alt={`gallery-${idx}`} 
                loading="lazy" // Lazy load images for better performance
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default GallerySlider;