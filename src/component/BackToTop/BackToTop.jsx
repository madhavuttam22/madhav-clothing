// components/BackToTop.jsx
import useBackToTop from '../Customhook/useBackToTop';
import styles from './BackToTop.module.css';

const BackToTop = () => {
  const { isVisible, scrollToTop } = useBackToTop();
  
  if (!isVisible) return null;

  return (
    <button
      className={styles.backToTop}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
      <span className={styles.tooltip}>Back to Top</span>
    </button>
  );
};

export default BackToTop;