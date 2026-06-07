/** Типы для Number Line Hop (Pattern 2) */

/** Диапазон числовой прямой */
export interface NumberLineRange {
  min: number
  max: number
  /** Шаг делений (обычно 1) */
  step: number
  /** Подписывать ли все числа или только круглые */
  labelAll: boolean
}

/** Состояние анимации прыжка */
export type JumpPhase = 'idle' | 'preparing' | 'flying' | 'landing' | 'done'

/** Текущая анимация прыжка — интерполируется Canvas-компонентом */
export interface JumpAnimation {
  from: number
  to: number
  /** performance.now() на момент начала текущей фазы */
  startTime: number
  /** Длительность фазы полёта (ms) */
  duration: number
  /** Текущая фаза */
  phase: 'preparing' | 'flying' | 'landing'
}

/** Один прыжок маркера */
export interface Jump {
  from: number
  to: number
  /** Высота дуги в px */
  arcHeight: number
}

/** Операция для визуализации на прямой */
export interface NumberLineOperation {
  /** Стартовая позиция */
  start: number
  /** Операция: +N, -N, или repeat(+N, count) для умножения */
  type: 'add' | 'subtract' | 'multiply'
  /** Величина шага */
  step: number
  /** Количество шагов (для умножения) */
  steps?: number
  /** Ожидаемый ответ */
  answer: number
  /** Выражение для отображения (например "7 + 5") */
  expression: string
}

/** Уровень визуализации числовой прямой */
export interface NumberLineLevel {
  range: NumberLineRange
  markerSize: number
  tickSize: number
  fontSize: number
}

/** Конфигурация Number Line Hop */
export interface NumberLineConfig {
  range: NumberLineRange
  /** Показывать ли дуги прыжков */
  showArcs: boolean
  /** Длительность одного прыжка (ms) */
  jumpDuration: number
  /** Задержка между прыжками при умножении (ms) */
  jumpDelay: number
}
