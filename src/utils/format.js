// Format helper for Indian Rupees
export const formatINR = (num) => {
  if (num === null || num === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
};
