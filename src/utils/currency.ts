/**
 * Utility functions for formatting amounts in Indian Rupees (₹)
 */

export function formatINR(amount: number, options?: { decimals?: boolean; compact?: boolean }): string {
  const { decimals = false, compact = false } = options || {};

  if (compact && amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });

  return formatter.format(amount);
}

export function parseINRInput(value: string): number {
  const clean = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
