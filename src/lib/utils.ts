import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This allows for conditional classes and resolves Tailwind CSS conflicts
 * 
 * @param inputs - Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Generates a random ID
 * 
 * @param length - Length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length);
  }
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * 
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export function truncateString(
  str: string, 
  length: number, 
  options: { 
    ellipsis?: string; 
    wordBoundary?: boolean;
  } = {}
): string {
  const { 
    ellipsis = '...', 
    wordBoundary = false 
  } = options;

  if (str.length <= length) return str;

  let truncated = str.slice(0, length - ellipsis.length);
  
  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated + ellipsis;
}

/**
 * Debounces a function
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}