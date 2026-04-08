export const isValidRating = (value: string): boolean => {
  if (!value) return true;
  const match = value.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (!match) return false;
  const [_, num, max] = match;
  return parseFloat(num) <= parseFloat(max);
};

export const isValidPrice = (value: string): boolean => {
  if (!value) return true;
  return /^[\d.,₫đ\s]+$/.test(value);
};

export const isValidSold = (value: string): boolean => {
  if (!value) return true;
  return /^[\d.,kKmMbB+\s]+$/.test(value);
};
