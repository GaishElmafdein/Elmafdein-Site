// eslint.config.mjs (grouped simple-import-sort strategy)
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import ts from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  react.configs.flat.recommended,
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
  'react-hooks/exhaustive-deps': 'warn',
  // Fast Refresh integrity: only export components (escalated to error)
  // Allow required Next.js metadata export while still preventing utility exports
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'metadata',
            'generateMetadata',
            'generateStaticParams',
            'viewport',
            'dynamic',
            'revalidate',
            'fetchCache',
            'runtime',
            'preferredRegion',
            'config'
          ]
        }
      ]
    }
  }
];
