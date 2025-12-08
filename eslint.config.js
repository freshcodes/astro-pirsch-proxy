import eslintPluginAstro from 'eslint-plugin-astro'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist',
      '*.json',
      '*.md',
      '.astro/**',
      'example/.astro/**',
      'example/dist/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  eslintConfigPrettier,
  {
    files: ['**/*.astro', '**/*.ts'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
