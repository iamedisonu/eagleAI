/*
============================================================================
FILE: tailwind.config.js
============================================================================
PURPOSE:
  Tailwind CSS configuration for the EagleAI application. Defines custom
  colors, spacing, and other design tokens to match the OC branding.

FEATURES:
  - Custom color palette matching OC branding
  - Responsive breakpoints
  - Custom font families
  - Extended spacing and sizing
  - Custom animations and transitions
============================================================================
*/

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OC Brand Colors (Oklahoma Christian University Official)
        // Primary Colors
        'brand-maroon': '#811429',
        'brand-crimson': '#660000',
        'brand-maroon-deep': '#48111C',

        // Neutrals
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
        'brand-nearwhite-1': '#F9F9F9',
        'brand-nearwhite-2': '#F4F4F4',

        // Accents
        'accent-teal': '#5EC4B6',
        'accent-teal-soft': '#BDE3DC',
        'accent-coral': '#FF937A',
        'accent-gold': '#F9C634',
        'accent-bluegray-soft': '#D5DFE7',
        'accent-bluegray': '#5C7A87',

        // Athletics
        'athletic-silver': '#CCCCCC',
        'athletic-tan': '#E2D79B',

        // Special overlay
        'brand-overlay': 'rgba(128, 126, 163, 0.6)',
        
        // Custom color palette
        // Scales derived from brand maroon and neutrals (optional)
        primary: {
          50: '#FBF4F5',
          100: '#F6E9EB',
          200: '#E9C9CF',
          300: '#DAA2AB',
          400: '#C46B76',
          500: '#A8394A',
          600: '#811429', // brand-maroon
          700: '#5F0F1F',
          800: '#48111C', // brand-maroon-deep
          900: '#2A0A10',
          950: '#180609',
        },
        neutral: {
          50: '#FFFFFF',
          100: '#F9F9F9',
          200: '#F4F4F4',
          300: '#E9E9E9',
          400: '#D9D9D9',
          500: '#BFBFBF',
          600: '#999999',
          700: '#666666',
          800: '#333333',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
