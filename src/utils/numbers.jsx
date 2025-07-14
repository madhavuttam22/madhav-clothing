/**
 * Utility functions for e-commerce application
 */

/**
 * Formats a numeric value into Indian Rupees currency format
 * @param {number|string} value - The value to be formatted (can be number or string)
 * @returns {string} Formatted currency string with ₹ symbol and 2 decimal places
 * @example
 * formatCurrency(1250) // returns "₹1250.00"
 * formatCurrency("1500.5") // returns "₹1500.50"
 */
export const formatCurrency = (value) => {
  // Convert value to number if it's a string, default to 0 if invalid
  const num = typeof value === 'number' ? value :
             typeof value === 'string' ? parseFloat(value) : 0;
  
  // Format as Indian Rupees with 2 decimal places
  return '₹' + num.toFixed(2);
};

/**
 * Gets the product image URL with fallback options
 * @param {Object} item - The product item object
 * @param {string} [item.image] - The primary image URL of the product
 * @param {string} [item.color_name] - The color name of the product (used for fallback)
 * @returns {string} URL of the product image or a placeholder if no image exists
 * @example
 * getProductImage({image: "example.jpg"}) // returns "example.jpg"
 * getProductImage({color_name: "Red"}) // returns color-based placeholder
 * getProductImage({}) // returns generic placeholder
 */
export const getProductImage = (item) => {
  // Return the primary image if available
  if (item.image) {
    return item.image;
  }
  
  // Fallback: Create a color-based placeholder if color name exists
  if (item.color_name) {
    return `https://via.placeholder.com/150/cccccc/000000?text=${encodeURIComponent(item.color_name)}`;
  }
  
  // Final fallback: Generic placeholder image
  return "https://via.placeholder.com/150?text=No+Image";
};