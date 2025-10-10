/*
============================================================================
FILE: .prettierrc.js
============================================================================
PURPOSE:
  Prettier configuration for the EagleAI project to ensure consistent
  code formatting across the entire codebase.

FEATURES:
  - Consistent code formatting
  - Automatic code style enforcement
  - Integration with ESLint
  - Support for multiple file types
  - Team collaboration consistency

CONFIGURATION:
  - Semi-colons: Always use
  - Quotes: Single quotes for strings
  - Trailing commas: None
  - Tab width: 2 spaces
  - Print width: 80 characters
  - Bracket spacing: Always
  - Arrow function parentheses: Always

INTEGRATION:
  - Works with ESLint via eslint-config-prettier
  - Integrates with VS Code and other editors
  - Can be run via npm scripts
  - Supports pre-commit hooks
============================================================================
*/

module.exports = {
  // Basic formatting options
  semi: true,                    // Always use semicolons
  singleQuote: true,            // Use single quotes instead of double quotes
  trailingComma: 'none',        // No trailing commas
  tabWidth: 2,                  // Use 2 spaces for indentation
  useTabs: false,               // Use spaces instead of tabs
  printWidth: 80,               // Wrap lines at 80 characters
  endOfLine: 'lf',              // Use LF line endings

  // Object and array formatting
  bracketSpacing: true,         // Add spaces inside object brackets
  bracketSameLine: false,       // Put > on new line for JSX
  arrowParens: 'always',        // Always include parens around arrow function params

  // JSX formatting
  jsxSingleQuote: true,         // Use single quotes in JSX
  jsxBracketSameLine: false,    // Put > on new line for JSX

  // Other formatting options
  quoteProps: 'as-needed',      // Only add quotes around object properties when needed
  rangeStart: 0,                // Start range for formatting
  rangeEnd: Infinity,           // End range for formatting
  requirePragma: false,         // Don't require @prettier pragma
  insertPragma: false,          // Don't insert @prettier pragma
  proseWrap: 'preserve',        // Don't wrap prose
  htmlWhitespaceSensitivity: 'css', // Respect CSS display property
  vueIndentScriptAndStyle: false,   // Don't indent script and style tags in Vue
  embeddedLanguageFormatting: 'auto', // Format embedded languages

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 100
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 100,
        proseWrap: 'always'
      }
    },
    {
      files: '*.yml',
      options: {
        parser: 'yaml',
        tabWidth: 2
      }
    },
    {
      files: '*.html',
      options: {
        parser: 'html',
        printWidth: 100
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        printWidth: 100
      }
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        printWidth: 100
      }
    }
  ]
};
