import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-saving data after changes
 * @param value The value to be saved
 * @param saveFunction The function that performs the save operation
 * @param delay Delay in milliseconds before saving (default: 2000ms)
 */
export function useAutoSave<T>(
  value: T,
  saveFunction: (value: T) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);
  const isSavingRef = useRef<boolean>(false);

  useEffect(() => {
    // Skip on first render or if value hasn't changed
    if (JSON.stringify(previousValueRef.current) === JSON.stringify(value)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      if (!isSavingRef.current) {
        try {
          isSavingRef.current = true;
          await saveFunction(value);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          isSavingRef.current = false;
        }
      }
    }, delay);

    // Update previous value
    previousValueRef.current = value;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFunction, delay]);

  return {
    isSaving: isSavingRef.current
  };
}