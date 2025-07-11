export const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value :
             typeof value === 'string' ? parseFloat(value) : 0;
  return '₹' + num.toFixed(2);
};


export const getProductImage = (item) => {
  if (item.image) {
    return item.image;
  }
  
  // Fallback placeholder based on color
  if (item.color_name) {
    return `https://via.placeholder.com/150/cccccc/000000?text=${encodeURIComponent(item.color_name)}`;
  }
  
  return "https://via.placeholder.com/150?text=No+Image";
};