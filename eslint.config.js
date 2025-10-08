// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules'],
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended, // TS 전용 추천 규칙
      react.configs['jsx-runtime'], // React 18 이상용
      reactHooks.configs['recommended-latest'], // 최신 Hook 규칙
      reactRefresh.configs.vite, // Vite HMR 관련 규칙
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      sourceType: 'module',
    },
    settings: {
      react: { version: 'detect' }, // 자동 감지 설정
    },
    rules: {
      // ⚙️ 프로젝트별 커스터마이징
      'react/prop-types': 'off', // TS 환경에서는 필요 없음
      'react/jsx-no-target-blank': 'off', // 보안 경고 완화 (Vite 기본 처리)
      '@typescript-eslint/no-unused-vars': ['warn'], // TS 기반 unused 검사
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // 상황에 따라 허용
    },
  },
]);
