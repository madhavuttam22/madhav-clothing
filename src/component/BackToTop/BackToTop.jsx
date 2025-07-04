// components/BackToTop.jsx
import useBackToTop from '../Customhook/useBackToTop';
import styles from './BackToTop.module.css';

const BackToTop = () => {
  const { isVisible, scrollPercentage, scrollToTop } = useBackToTop();
  
  if (!isVisible) return null;

  const strokeDasharray = 283;
  const strokeDashoffset = 283 - (283 * scrollPercentage / 100);

  return (
    <button
      className={styles.backToTop}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <div className={styles.progressRing}>
        <svg className={styles.ringSvg} viewBox="0 0 100 100">
          <circle className={styles.ringTrack} cx="50" cy="50" r="45" />
          <circle 
            className={styles.ringFill} 
            cx="50" 
            cy="50" 
            r="45"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className={styles.arrowContainer}>
          <svg viewBox="0 0 24 24" className={styles.arrowIcon}>
            <path d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
      <span className={styles.tooltip}>Back to Top</span>
    </button>
  );
};

export default BackToTop;