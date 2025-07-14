// hooks/useBackToTop.js
import { useState, useEffect } from 'react';

/**
 * useBackToTop Custom Hook
 * 
 * Provides functionality for a "back to top" button that:
 * - Tracks scroll position and visibility state
 * - Calculates scroll percentage
 * - Handles smooth scrolling to top
 * 
 * @returns {Object} Hook API containing:
 * @property {boolean} isVisible - Whether button should be visible
 * @property {number} scrollPercentage - Current scroll percentage (0-100)
 * @property {function} scrollToTop - Function to smoothly scroll to top
 */
const useBackToTop = () => {
  // State for button visibility (shows after 300px scroll)
  const [isVisible, setIsVisible] = useState(false);
  
  // State for tracking scroll percentage (0-100)
  const [scrollPercentage, setScrollPercentage] = useState(0);

  /**
   * Handles scroll events to update visibility and percentage
   * Runs on every scroll event
   */
  const handleScroll = () => {
    // Check for window object (SSR compatibility)
    if (typeof window !== 'undefined') {
      // Calculate total scrollable height
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Get current scroll position
      const scrollPosition = window.pageYOffset;
      // Calculate percentage (capped at 100)
      const percentage = Math.min(100, (scrollPosition / scrollHeight) * 100);
      
      // Update states
      setScrollPercentage(percentage);
      // Show button after 300px scroll
      setIsVisible(scrollPosition > 300);
    }
  };

  /**
   * Smoothly scrolls the page back to top
   * Uses native window.scrollTo with smooth behavior
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Enables smooth scrolling animation
    });
  };

  // Effect to add/remove scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array ensures effect runs once

  return {
    isVisible,
    scrollPercentage,
    scrollToTop
  };
};

export default useBackToTop;