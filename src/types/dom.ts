// DOM types for better TypeScript support

export interface HTMLCanvasElement {
  width: number;
  height: number;
  getContext(contextId: string): unknown;
  toDataURL(type?: string, quality?: unknown): string;
  toBlob(callback: (blob: unknown | null) => void, type?: string, quality?: unknown): void;
  addEventListener(type: string, listener: (...args: unknown[]) => void, options?: boolean | unknown): void;
  removeEventListener(type: string, listener: (...args: unknown[]) => void, options?: boolean | unknown): void;
}

export interface HTMLAudioElement {
  src: string;
  volume: number;
  muted: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  addEventListener(type: string, listener: (...args: unknown[]) => void, options?: boolean | unknown): void;
  removeEventListener(type: string, listener: (...args: unknown[]) => void, options?: boolean | unknown): void;
}

declare global {
  interface OscillatorType {
    readonly sine: 'sine';
    readonly square: 'square';
    readonly sawtooth: 'sawtooth';
    readonly triangle: 'triangle';
  }
}