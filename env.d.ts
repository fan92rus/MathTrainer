/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Глобальные декларации для DOM API
interface Document {
  documentElement: {
    style: {
      setProperty: (property: string, value: string) => void;
    };
  };
}

interface HTMLElement {
  getBoundingClientRect: () => {
    top: number;
  };
  focus: () => void;
}

interface Window {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  scrollY: number;
  scrollTo: (options: { top: number; behavior: string }) => void;
  visualViewport?: {
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
}

interface Screen {
  orientation?: {
    lock: (orientation: string) => Promise<void>;
  };
}

interface Navigator {
  userAgent?: string;
  maxTouchPoints?: number;
}