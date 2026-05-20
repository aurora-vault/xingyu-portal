import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 引入 Node.js 原生的 URL 解析模块
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
