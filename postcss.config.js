/*
============================================================================
FILE: postcss.config.js
============================================================================
PURPOSE:
  PostCSS configuration for Tailwind CSS processing. Enables Tailwind
  directives and autoprefixer for cross-browser compatibility.

FEATURES:
  - Tailwind CSS processing
  - Autoprefixer for vendor prefixes
  - CSS optimization
============================================================================
*/

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
