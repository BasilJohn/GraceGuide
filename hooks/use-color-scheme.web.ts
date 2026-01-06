/**
 * Force dark mode for the entire app regardless of system settings
 * Web version - always returns 'dark'
 */
export function useColorScheme(): 'dark' {
  return 'dark';
}
