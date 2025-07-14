// hooks/useNotification.js
import { useState } from 'react';

/**
 * useNotification Custom Hook
 * 
 * Manages application notification state with:
 * - Message content
 * - Notification type (success, error, etc.)
 * - Show/hide functionality
 * 
 * @returns {Object} Hook API containing:
 * @property {Object|null} notification - Current notification data or null
 * @property {function} showNotification - Displays a notification
 * @property {function} hideNotification - Hides current notification
 */
const useNotification = () => {
  // State for current notification (null when no notification)
  const [notification, setNotification] = useState(null);

  /**
   * Displays a new notification
   * @param {string} message - Notification message content
   * @param {string} [type='success'] - Notification type (for styling)
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  /**
   * Hides the current notification
   */
  const hideNotification = () => {
    setNotification(null);
  };

  return { notification, showNotification, hideNotification };
};

export default useNotification;