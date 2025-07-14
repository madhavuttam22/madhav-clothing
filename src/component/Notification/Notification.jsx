import { useEffect } from 'react';
import './Notification.css';

/**
 * Notification Component - Displays temporary alert messages to the user
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The message to be displayed in the notification
 * @param {string} props.type - The type of notification ('success', 'error', 'warning', or default 'info')
 * @param {function} props.onClose - Callback function to close/remove the notification
 * @returns {JSX.Element} - Rendered notification component
 */
const Notification = ({ message, type, onClose }) => {
  // Automatically close the notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Cleanup function to clear the timeout if component unmounts
    return () => clearTimeout(timer);
  }, [onClose]);

  /**
   * Returns the appropriate icon based on notification type
   * @returns {string} - Icon symbol for the notification
   */
  const getIcon = () => {
    switch(type) {
      case 'success':
        return '✓'; // Check mark for success
      case 'error':
        return '✕'; // Cross mark for errors
      case 'warning':
        return '⚠'; // Warning symbol
      default:
        return 'ℹ'; // Info symbol as default
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">
        <p className="notification-message">{message}</p>
      </div>
      {/* Close button with click handler */}
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;