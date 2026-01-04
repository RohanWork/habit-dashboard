/**
 * Color Utility Functions
 * Helper functions for color calculations and contrast
 */

/**
 * Calculate the relative luminance of a color
 * @param {string} hex - Hex color string (e.g., '#FFFFFF' or 'FFFFFF')
 * @returns {number} Luminance value between 0 (dark) and 1 (light)
 */
export const getLuminance = (hex) => {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Determine if a color is light or dark
 * @param {string} hex - Hex color string
 * @returns {boolean} true if light, false if dark
 */
export const isLightColor = (hex) => {
  return getLuminance(hex) > 0.5;
};

/**
 * Get contrasting text color (black or white) based on background
 * @param {string} bgHex - Background hex color
 * @returns {string} '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export const getContrastingTextColor = (bgHex) => {
  return isLightColor(bgHex) ? '#000000' : '#FFFFFF';
};

/**
 * Get a readable text color that works in both light and dark modes
 * For light backgrounds: use dark text
 * For dark backgrounds: use light text
 * This ensures good contrast regardless of the page background
 * @param {string} bgHex - Background hex color
 * @param {boolean} isDarkMode - Whether dark mode is active (optional, auto-detected if not provided)
 * @returns {string} Hex color for text
 */
export const getReadableTextColor = (bgHex, isDarkMode = null) => {
  // Auto-detect dark mode if not provided
  if (isDarkMode === null && typeof window !== 'undefined') {
    isDarkMode = document.documentElement.classList.contains('dark');
  }
  
  const luminance = getLuminance(bgHex);
  
  // Calculate effective background considering opacity and page background
  // Backgrounds with opacity blend with page background
  // In dark mode, even light colors appear darker when blended
  const pageBgLuminance = isDarkMode ? 0.1 : 0.9; // Dark mode: dark bg, Light mode: light bg
  const opacity = 0.15; // Background opacity
  const effectiveLuminance = luminance * opacity + pageBgLuminance * (1 - opacity);
  
  // Use effective luminance to determine text color
  if (effectiveLuminance > 0.6) {
    // Effective background is light - use dark text
    return isDarkMode ? '#E5E7EB' : '#1F2937'; // Lighter in dark mode for better contrast
  } else if (effectiveLuminance < 0.4) {
    // Effective background is dark - use light text
    return isDarkMode ? '#F3F4F6' : '#FFFFFF'; // Always light text
  } else {
    // Medium effective background
    return isDarkMode ? '#D1D5DB' : '#374151'; // Adjusted for theme
  }
};

/**
 * Ensure background color has sufficient opacity for readability
 * @param {string} hex - Hex color string
 * @param {number} opacity - Opacity value (0-1), default 0.15
 * @returns {string} Hex color with alpha channel
 */
export const addOpacity = (hex, opacity = 0.15) => {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${color}${alpha}`;
};

/**
 * Get a darker version of a color for borders
 * @param {string} hex - Hex color string
 * @param {number} amount - Amount to darken (0-1), default 0.2
 * @returns {string} Darker hex color
 */
export const darkenColor = (hex, amount = 0.2) => {
  const color = hex.replace('#', '');
  const r = Math.max(0, parseInt(color.substring(0, 2), 16) * (1 - amount));
  const g = Math.max(0, parseInt(color.substring(2, 4), 16) * (1 - amount));
  const b = Math.max(0, parseInt(color.substring(4, 6), 16) * (1 - amount));
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

