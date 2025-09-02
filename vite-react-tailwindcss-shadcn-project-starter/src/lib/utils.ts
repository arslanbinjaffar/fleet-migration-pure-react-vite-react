import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions
export const formatDate = (dateString?: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!dateString) return 'N/A';
  
  try {
    const dateObj = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString?: string | Date): string => {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (dateString?: string | Date): string => {
  return formatDate(dateString, 'HH:mm');
};

// Currency utility functions
export const formatCurrency = (amount?: number, currency = 'USD'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// String utility functions
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Validation utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Async utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
