/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    // Используем happy-dom вместо jsdom (быстрее)
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        // Минимализируем функции happy-dom
        disableJavaScriptEvaluation: false,
        disableCSSRendering: true,
      }
    },
    setupFiles: ['./src/test/setup.ts'],
    // Параллельный запуск тестов
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    // Лимит на количество тестов для быстрых итераций
    testTimeout: 10000,
    hookTimeout: 10000,
    // isolate: false может вызывать проблемы с тестами, оставляем true
    isolate: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    },
    // Уменьшаем логирование
    reporters: ['default'],
    outputTruncateLength: 80,
    // Silence console в тестах (можно переопределить через --silent=false)
    silent: false,
  }
})