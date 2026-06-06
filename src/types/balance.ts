// Типы для паттерна "Весы для уравнений" (Pattern 4 — Balance Beam)

/**
 * Конфигурация весов
 */
export interface BalanceConfig {
  /** Значение на левой чаше (целое) */
  leftValue: number
  /** Известная часть на правой чаше */
  rightKnownPart: number
  /** Операция: + или - */
  operation: '+' | '-'
  /** Правильный ответ (неизвестная часть) */
  correctAnswer: number
  /** Максимальное значение для шкалы наклона */
  maxTilt: number
}

/**
 * Состояние весов
 */
export type BalanceTiltState = 'balanced' | 'left-heavy' | 'right-heavy' | 'preview'

/**
 * Результат попытки уравновесить весы
 */
export interface BalanceAttempt {
  /** Выбранное значение для неизвестной части */
  selectedValue: number
  /** Правильное значение */
  correctValue: number
  /** Пытался ли уравновесить */
  isBalanced: boolean
}
