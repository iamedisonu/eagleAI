/*
============================================================================
FILE: .eslintrc.js
============================================================================
PURPOSE:
  ESLint configuration for the EagleAI project to enforce code quality,
  consistency, and best practices across the entire codebase.

FEATURES:
  - React-specific linting rules
  - TypeScript support (if needed)
  - Import/export validation
  - Code formatting consistency
  - Accessibility checks
  - Performance optimizations
  - Security best practices

RULES:
  - React Hooks rules for proper hook usage
  - Import ordering and organization
  - Unused variable detection
  - Code complexity limits
  - Consistent naming conventions
  - Error handling requirements

EXTENSIONS:
  - eslint-plugin-react: React-specific rules
  - eslint-plugin-react-hooks: Hook usage rules
  - eslint-plugin-import: Import/export rules
  - @typescript-eslint: TypeScript support
============================================================================
*/

module.exports = {
  // Environment configuration
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },

  // Parser options
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },

  // Parser for TypeScript files (if using TypeScript)
  parser: '@typescript-eslint/parser',

  // Plugin configuration
  plugins: [
    'react',
    'react-hooks',
    'import',
    '@typescript-eslint'
  ],

  // Extend base configurations
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    '@typescript-eslint/recommended'
  ],

  // Settings
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },

  // Rules configuration
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off', // Not needed with React 17+
    'react/jsx-uses-vars': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unsafe': 'warn',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-default-export': 'off', // Allow default exports for components

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // General JavaScript rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'func-call-spacing': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'semi': ['error', 'always'],
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', 'never'],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': 'error',

    // Code quality rules
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 300],
    'max-lines-per-function': ['warn', 50],
    'max-params': ['warn', 4],
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': 'error',
    'no-useless-return': 'error',
    'no-useless-constructor': 'error',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'prefer-destructuring': 'warn',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',

    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Best practices
    'curly': 'error',
    'eqeqeq': 'error',
    'no-caller': 'error',
    'no-empty-function': 'warn',
    'no-eq-null': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': ['warn', { 
      ignore: [0, 1, -1], 
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true 
    }],
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'warn',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'radix': 'error',
    'wrap-iife': 'error',
    'yoda': 'error'
  },

  // Override rules for specific file types
  overrides: [
    {
      // Configuration for test files
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true
      },
      rules: {
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off'
      }
    },
    {
      // Configuration for configuration files
      files: ['*.config.js', '*.config.ts', 'vite.config.js', 'tailwind.config.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      // Configuration for backend files
      files: ['backend/**/*.js', 'backend/**/*.ts'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off', // Allow console in backend
        'react/react-in-jsx-scope': 'off' // No React in backend
      }
    }
  ],

  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'public/',
    'backend_python/',
    'logs/'
  ]
};