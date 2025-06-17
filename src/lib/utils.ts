import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, handling conditional classes
 * and merging Tailwind CSS classes properly.
 *
 * @param inputs - Class names or conditional class expressions
 * @returns A merged string of class names
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
