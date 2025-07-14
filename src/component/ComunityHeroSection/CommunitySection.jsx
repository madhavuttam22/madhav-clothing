// CommunitySection.jsx
import React from "react";
import "./CommunitySection.css";

/**
 * CommunitySection Component
 * 
 * Displays a community section with an image and promotional text
 * Used to showcase community testimonials and encourage user engagement
 * 
 * Features:
 * - Responsive layout with flexbox
 * - Animated image slide-in effect
 * - Gradient background
 * - Call-to-action button
 */
const CommunitySection = () => {
  return (
    // Main section container with gradient background
    <section className="community-section my-5">
      {/* Flex container for image and content */}
      <div className="feature-text">
        {/* Image container - takes 50% width on larger screens */}
        <div className="feature-image">
          <img
            src="communitybg.png"  // Community showcase image
            alt="Community"        // Accessibility description
            className="slide-in-image"  // Animation class
          />
        </div>
        
        {/* Text content container - takes 45% width on larger screens */}
        <div className="feature-content">
          <header className="section-header">
            {/* Subheading with uppercase styling */}
            <h3 className="subheading">HEAR FROM THE ZU CLOTHING COMMUNITY</h3>
            
            {/* Description paragraph with call-to-action link */}
            <div className="description">
              <p>
                Where Unity Sparks Growth, Support Inspires Flourishing, and Connections Ignite Possibilities
                <br />
                <br />
                {/* Call-to-action link */}
                <a href="" title="Contact Us">
                  JOIN THE COMMUNITY
                </a>
              </p>
            </div>
          </header>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;