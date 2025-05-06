import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve:{
    alias:{
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3080,
    // proxy: {
    //   '/apis': {
    //     target: 'http://192.168.3.162:7860',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '/apis': ''
    //     }
    //   }
    // },
    hmr: {
      overlay: true
    }
  }
})
