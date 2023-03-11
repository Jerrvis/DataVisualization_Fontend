import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import postcssNested from 'postcss-nested'

const resolve = dir => path.resolve(process.cwd(), dir)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 666
  },
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  css: {
    postcss: {
      plugins: [postcssNested]
    },
    preprocessorOptions: {
      less: {
        additionalData: ''
      }
    }
  }
})
