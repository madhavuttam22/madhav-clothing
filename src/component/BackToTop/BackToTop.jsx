// components/BackToTop.jsx
import useBackToTop from '../hooks/useBackToTop';
import styles from '../styles/BackToTop.module.css';

const BackToTop = () => {
  const { isVisible, scrollPercentage, scrollToTop } = useBackToTop();
  
  const strokeDasharray = 307.919;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * scrollPercentage / 100);

  return (
    <div 
      className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <div className={styles.circle}>
        <svg 
          className={styles.progressCircle} 
          viewBox="-1 -1 102 102"
        >
          <path 
            className={styles.progressPath}
            d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
            style={{
              strokeDasharray: strokeDasharray,
              strokeDashoffset: strokeDashoffset
            }}
          />
        </svg>
        <svg 
          className={styles.arrow} 
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path 
            stroke="#000000" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M10 18V2m0 0l7 7m-7-7L3 9" 
          />
        </svg>
      </div>
    </div>
  );
};

export default BackToTop;