// Типы для паттерна "Строим башню" (Pattern 7 — Tower)

/**
 * Один этаж башни — один решённый пример
 */
export interface TowerFloor {
  /** Уникальный идентификатор этажа */
  id: number
  /** Номер этажа (начиная с 1) */
  level: number
  /** Математическое выражение с ответом (например, "5 + 3 = 8") */
  expression: string
  /** Правильный ответ */
  answer: number
  /** Состояние этажа */
  state: 'completed' | 'waiting'
  /** Timestamp создания этажа */
  timestamp: number
  /** Является ли этаж milestone-этажом (5, 10, 15…) */
  isMilestone: boolean
}

/**
 * Конфигурация башни
 */
export interface TowerConfig {
  /** Сколько этажей нужно построить (8, 10, 12, 15) */
  targetHeight: number
  /** Тематическое оформление башни */
  theme: TowerTheme
  /** Номера milestone-этажей (например, [5, 10]) */
  milestones: number[]
}

/**
 * Тематические стили башни для разных упражнений
 */
export type TowerTheme = 'castle' | 'rocket' | 'tower' | 'tree'

/**
 * Полное состояние башни (для сериализации / persistence)
 */
export interface TowerState {
  /** Массив этажей */
  floors: TowerFloor[]
  /** Целевая высота башни */
  targetHeight: number
  /** Тематическое оформление */
  theme: TowerTheme
  /** Номера milestone-этажей */
  milestones: number[]
  /** Башня достроена */
  completed: boolean
  /** Количество ошибок за сессию */
  errorCount: number
  /** Общее количество построенных этажей */
  totalFloors: number
}
