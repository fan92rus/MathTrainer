/** Типы для DragonBox Blocks (Pattern 3) */

/** Один блок-«Noom» */
export interface Block {
  id: number
  /** Числовое значение (1-10) */
  value: number
  /** Позиция на canvas */
  x: number
  y: number
  /** Ширина пропорциональна значению */
  width: number
  /** Высота фиксирована */
  height: number
  /** Состояние блока */
  state: 'idle' | 'dragging' | 'snapping' | 'combining'
  /** Цвет по значению (Cuisenaire) */
  color: string
}

/** Результат операции с блоками */
export interface BlockOperation {
  type: 'combine' | 'split'
  /** Блоки-источники */
  sources: number[] // block ids
  /** Результат */
  result: Block
}

/** Конфигурация блочной зоны */
export interface BlockConfig {
  /** Базовая ширина одного модуля (px) */
  unitWidth: number
  /** Высота блока (px) */
  blockHeight: number
  /** Цветовая схема: cuisenaire | dragonbox */
  colorScheme: 'cuisenaire' | 'dragonbox'
}

/** Cuisenaire цветовая кодировка */
export const CUISENAIRE_COLORS: Record<number, string> = {
  1: '#ffffff',
  2: '#e53935',
  3: '#43a047',
  4: '#fdd835',
  5: '#1565c0',
  6: '#7b1fa2',
  7: '#212121',
  8: '#6d4c41',
  9: '#00acc1',
  10: '#ff8f00',
}

/** DragonBox стиль (более яркий, «живой») */
export const DRAGONBOX_COLORS: Record<number, string> = {
  1: '#ff6b6b',
  2: '#feca57',
  3: '#48dbfb',
  4: '#ff9ff3',
  5: '#54a0ff',
  6: '#5f27cd',
  7: '#01a3a4',
  8: '#f368e0',
  9: '#ff6348',
  10: '#2ed573',
}
