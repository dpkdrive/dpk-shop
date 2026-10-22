import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format number into Indian Rupee (INR) format (e.g. ₹14,999)
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '₹0';
  const num = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Format ISO date string into readable Indian format
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Generate URL slug from title
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
