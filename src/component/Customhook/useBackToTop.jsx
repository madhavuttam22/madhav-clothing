// hooks/useBackToTop.js
import { useState, useEffect } from 'react';

const useBackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.pageYOffset;
      const percentage = Math.min(100, (scrollPosition / scrollHeight) * 100);
      
      setScrollPercentage(percentage);
      setIsVisible(scrollPosition > 300);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    isVisible,
    scrollPercentage,
    scrollToTop
  };
};

export default useBackToTop;