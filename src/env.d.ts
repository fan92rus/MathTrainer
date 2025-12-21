/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  var clearTimeout: (id: number | NodeJS.Timeout) => void
  var setTimeout: (callback: () => void, delay: number) => NodeJS.Timeout
  interface Window {
    scrollTimeout: number | null
  }
}