const BackToTop = () => {
  const { isVisible, scrollPercentage } = useBackToTop();
  
  return (
    <div className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.circle}>
        <svg viewBox="0 0 100 100" className={styles.progressCircle}>
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            strokeDasharray={308}
            strokeDashoffset={308 - (308 * scrollPercentage / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.arrow}>↑</div>
      </div>
    </div>
  );
};

export default BackToTop;