// eslint.config.mjs (grouped simple-import-sort strategy)
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import path from 'node:path';
import ts from 'typescript-eslint';

// Re-enable Next.js recommended rules (lightweight) using FlatCompat adapter
const compat = new FlatCompat({
  baseDirectory: path.resolve(process.cwd())
});

const config = [
  js.configs.recommended,
  ...ts.configs.recommended,
  react.configs.flat.recommended,
  // Next.js core web vitals & recommended (using legacy config bridge)
  ...compat.config({ extends: ['next', 'next/core-web-vitals'] }),
  {
    ignores: ['.next', 'public/sw.js']
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React / Next first
            ['^react$', '^next', '^next/(.*)'],
            // Third-party packages (npm)
            ['^@?\\w'],
            // Styles (css/scss)
            ['^.+\\.s?css$'],
            // Absolute alias imports
            ['^@/(.*)$'],
            // Relative imports
            ['^\\./', '^\\../'],
            // Type side-effect or virtual imports
            ['^\\u0000']
          ]
        }
      ],
      'simple-import-sort/exports': 'error',
  'no-duplicate-imports': 'error',
  // React 17+ (automatic runtime) & TypeScript project: these legacy requirements are unnecessary
  'react/react-in-jsx-scope': 'off',
  'react/jsx-uses-react': 'off',
  'react/prop-types': 'off',
  // Enforce Hooks rules
  'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  // Apply react-refresh rule only to component / hook source files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  }
];

export default config;
