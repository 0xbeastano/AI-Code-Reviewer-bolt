/**
 * Utility function to merge class names
 * Simple implementation without external dependencies
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim();
}