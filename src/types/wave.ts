// Типы для паттерна "Волна примеров" (Pattern 6 — Wave Runner)

/**
 * Конфигурация волны
 */
export interface WaveConfig {
  /** Базовая скорость (мс на карточку) */
  baseSpeed: number
  /** Минимальная скорость */
  minSpeed: number
  /** Максимальная скорость */
  maxSpeed: number
  /** Коэффициент ускорения при правильном ответе */
  speedUpFactor: number
  /** Коэффициент замедления при ошибке */
  slowDownFactor: number
  /** Максимальное количество карточек на экране */
  maxCards: number
}

/**
 * Позиция карточки в волне
 */
export type CardPosition = 'hidden-left' | 'leaving' | 'current' | 'entering' | 'hidden-right'

/**
 * Одна карточка-пример в волне
 */
export interface WaveCard {
  id: number
  problem: import('./index').MathProblem
  position: CardPosition
  answered: boolean
  isCorrect: boolean | null
}

/**
 * Состояние волны
 */
export interface WaveState {
  cards: WaveCard[]
  currentIndex: number
  speed: number
  streak: number
  bestStreak: number
  totalCorrect: number
  totalAnswered: number
  isPaused: boolean
  isRunning: boolean
}
