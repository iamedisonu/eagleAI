/*
============================================================================
FILE: src/utils/colorContrastAudit.js
============================================================================
PURPOSE:
  Color contrast audit utility to ensure WCAG 2.1 AA compliance.
  Calculates contrast ratios and identifies problematic color combinations.

FEATURES:
  - Contrast ratio calculation
  - WCAG compliance checking
  - Color combination recommendations
  - Accessibility score calculation
============================================================================
*/

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} - RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} - Relative luminance
 */
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} - Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format');
  }
  
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {Object} - Compliance result
 */
export function checkWCAGCompliance(ratio, level = 'AA', size = 'normal') {
  const standards = {
    AA: {
      normal: 4.5,
      large: 3.0
    },
    AAA: {
      normal: 7.0,
      large: 4.5
    }
  };
  
  const required = standards[level][size];
  const passes = ratio >= required;
  
  return {
    passes,
    ratio: Math.round(ratio * 100) / 100,
    required,
    level,
    size,
    grade: passes ? 'PASS' : 'FAIL'
  };
}

/**
 * Get color contrast recommendations
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {Object} - Recommendations
 */
export function getContrastRecommendations(foreground, background, level = 'AA', size = 'normal') {
  const ratio = getContrastRatio(foreground, background);
  const compliance = checkWCAGCompliance(ratio, level, size);
  
  if (compliance.passes) {
    return {
      status: 'good',
      message: `Contrast ratio ${compliance.ratio}:1 meets WCAG ${level} standards`,
      suggestions: []
    };
  }
  
  const suggestions = [];
  
  // Calculate how much to adjust colors
  const adjustment = compliance.required / compliance.ratio;
  
  if (adjustment > 1.5) {
    suggestions.push('Consider using a much darker or lighter color');
  } else if (adjustment > 1.2) {
    suggestions.push('Consider using a darker or lighter color');
  } else {
    suggestions.push('Consider using a slightly darker or lighter color');
  }
  
  suggestions.push('Add text shadow or outline for better visibility');
  suggestions.push('Use a different color combination');
  
  return {
    status: 'needs-improvement',
    message: `Contrast ratio ${compliance.ratio}:1 does not meet WCAG ${level} standards (requires ${compliance.required}:1)`,
    suggestions,
    compliance
  };
}

/**
 * Audit all color combinations in the design system
 * @returns {Object} - Audit results
 */
export function auditColorContrast() {
  const colorCombinations = [
    // Text on backgrounds
    { name: 'Maroon text on white', fg: '#811429', bg: '#FFFFFF' },
    { name: 'White text on maroon', fg: '#FFFFFF', bg: '#811429' },
    { name: 'Maroon text on nearwhite', fg: '#811429', bg: '#F9F9F9' },
    { name: 'Black text on white', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Black text on nearwhite', fg: '#000000', bg: '#F9F9F9' },
    
    // Accent colors
    { name: 'Teal text on white', fg: '#5EC4B6', bg: '#FFFFFF' },
    { name: 'Teal text on nearwhite', fg: '#5EC4B6', bg: '#F9F9F9' },
    { name: 'Coral text on white', fg: '#FF937A', bg: '#FFFFFF' },
    { name: 'Gold text on white', fg: '#F9C634', bg: '#FFFFFF' },
    { name: 'Bluegray text on white', fg: '#5C7A87', bg: '#FFFFFF' },
    
    // Interactive elements
    { name: 'Maroon text on gold', fg: '#811429', bg: '#F9C634' },
    { name: 'White text on teal', fg: '#FFFFFF', bg: '#5EC4B6' },
    { name: 'Maroon text on teal', fg: '#811429', bg: '#5EC4B6' },
    
    // Status colors
    { name: 'Success text on white', fg: '#10B981', bg: '#FFFFFF' },
    { name: 'Error text on white', fg: '#EF4444', bg: '#FFFFFF' },
    { name: 'Warning text on white', fg: '#F59E0B', bg: '#FFFFFF' },
    
    // Hover states
    { name: 'Maroon text on gold hover', fg: '#811429', bg: '#F9C634' },
    { name: 'White text on crimson', fg: '#FFFFFF', bg: '#660000' },
  ];
  
  const results = {
    total: colorCombinations.length,
    passed: 0,
    failed: 0,
    combinations: [],
    summary: {
      AA: { normal: 0, large: 0 },
      AAA: { normal: 0, large: 0 }
    }
  };
  
  colorCombinations.forEach(combo => {
    const normalAA = checkWCAGCompliance(getContrastRatio(combo.fg, combo.bg), 'AA', 'normal');
    const largeAA = checkWCAGCompliance(getContrastRatio(combo.fg, combo.bg), 'AA', 'large');
    const normalAAA = checkWCAGCompliance(getContrastRatio(combo.fg, combo.bg), 'AAA', 'normal');
    const largeAAA = checkWCAGCompliance(getContrastRatio(combo.fg, combo.bg), 'AAA', 'large');
    
    const result = {
      name: combo.name,
      foreground: combo.fg,
      background: combo.bg,
      ratio: Math.round(getContrastRatio(combo.fg, combo.bg) * 100) / 100,
      normalAA,
      largeAA,
      normalAAA,
      largeAAA,
      overallPass: normalAA.passes
    };
    
    results.combinations.push(result);
    
    if (result.overallPass) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Update summary
    if (normalAA.passes) results.summary.AA.normal++;
    if (largeAA.passes) results.summary.AA.large++;
    if (normalAAA.passes) results.summary.AAA.normal++;
    if (largeAAA.passes) results.summary.AAA.large++;
  });
  
  return results;
}

/**
 * Generate improved color palette with better contrast
 * @returns {Object} - Improved color palette
 */
export function generateImprovedPalette() {
  return {
    // Primary maroons (improved for better contrast)
    'brand-maroon': '#6B0F1A', // Darker for better contrast
    'brand-crimson': '#4A0000', // Darker for better contrast
    'brand-maroon-deep': '#2D0A0F', // Darker for better contrast
    
    // Neutrals (unchanged - already good)
    'brand-black': '#000000',
    'brand-white': '#FFFFFF',
    'brand-nearwhite-1': '#F9F9F9',
    'brand-nearwhite-2': '#F4F4F4',
    
    // Accents (improved for better contrast)
    'accent-teal': '#0F766E', // Darker teal for better contrast
    'accent-teal-soft': '#5EEAD4', // Lighter soft teal
    'accent-coral': '#EA580C', // Darker coral for better contrast
    'accent-gold': '#D97706', // Darker gold for better contrast
    'accent-bluegray-soft': '#94A3B8', // Lighter bluegray
    'accent-bluegray': '#334155', // Darker bluegray for better contrast
    
    // Athletics (improved)
    'athletic-silver': '#9CA3AF', // Darker silver
    'athletic-tan': '#A3A3A3', // Darker tan
    
    // Status colors (WCAG compliant)
    'success': '#059669', // Darker green
    'error': '#DC2626', // Darker red
    'warning': '#D97706', // Darker orange
    'info': '#0284C7', // Darker blue
  };
}

export default {
  getContrastRatio,
  checkWCAGCompliance,
  getContrastRecommendations,
  auditColorContrast,
  generateImprovedPalette
};
