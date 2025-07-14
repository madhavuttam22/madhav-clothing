/**
 * BackToTop Component
 * 
 * A floating action button that appears when the user scrolls down the page,
 * showing scroll progress with an animated ring and allowing one-click return to top.
 * Uses a custom hook to track scroll position and visibility.
 */

import useBackToTop from '../Customhook/useBackToTop';
import styles from './BackToTop.module.css';

const BackToTop = () => {
  // Get scroll state from custom hook
  const { isVisible, scrollPercentage, scrollToTop } = useBackToTop();
  
  // Don't render if not visible
  if (!isVisible) return null;

  // SVG circle calculations for progress ring
  const strokeDasharray = 283; // Circumference of the progress ring (2πr)
  const strokeDashoffset = 283 - (283 * scrollPercentage / 100); // Offset based on scroll percentage

  return (
    <button
      className={styles.backToTop}
      onClick={scrollToTop}
      aria-label="Back to top"
      data-testid="back-to-top-button"
    >
      {/* Progress ring container */}
      <div className={styles.progressRing}>
        {/* SVG for the progress ring visualization */}
        <svg className={styles.ringSvg} viewBox="0 0 100 100">
          {/* Background track of the progress ring */}
          <circle 
            className={styles.ringTrack} 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none"
          />
          {/* Animated progress ring fill */}
          <circle 
            className={styles.ringFill} 
            cx="50" 
            cy="50" 
            r="45"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        
        {/* Arrow icon container */}
        <div className={styles.arrowContainer}>
          <svg viewBox="0 0 24 24" className={styles.arrowIcon}>
            {/* Arrow path (upward chevron) */}
            <path 
              d="M5 15l7-7 7 7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Tooltip text shown on hover */}
      <span className={styles.tooltip}>Back to Top</span>
    </button>
  );
};

export default BackToTop;