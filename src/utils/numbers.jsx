export const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value :
             typeof value === 'string' ? parseFloat(value) : 0;
  return '₹' + num.toFixed(2);
};
