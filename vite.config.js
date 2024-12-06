import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  css: {
    postcss: './postcss.config.js', // PostCSS 설정 파일 경로 지정
  },
  server: {
    proxy: {
      '/users': {
        target: 'https://riku-server.shop',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
