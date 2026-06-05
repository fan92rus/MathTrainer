/**
 * Типы для системы мотивации: стрики, прогресс-путь
 */

/** Состояние стрика */
export interface StreakState {
  /** Текущий стрик (дней подряд) */
  currentStreak: number
  /** Лучший стрик за всё время */
  bestStreak: number
  /** Дата последней активности (ISO string или toDateString) */
  lastActiveDate: string | null
  /** Дата последнего обновления стрика (для миграции) */
  updatedAt: string | null
}

/** Веха стрика — достижение за серию дней */
export interface StreakMilestone {
  /** Кол-во дней для вехи */
  days: number
  /** ID ачивки */
  achievementId: string
  /** Название */
  name: string
  /** Описание */
  description: string
  /** CSS-класс анимации огонька */
  flameClass: string
}

/** Узел на прогресс-пути */
export interface PathNode {
  /** Уникальный ID */
  id: string
  /** Тип упражнения (ключ из scores store) */
  exerciseType: string
  /** Заголовок */
  title: string
  /** Описание */
  description: string
  /** Пороги очков для звёзд [0, star1, star2, star3] */
  thresholds: number[]
  /** Количество звёзд (вычисляется) */
  starCount: 0 | 1 | 2 | 3
  /** Заблокирован (не доступен для текущего класса/четверти) */
  locked: boolean
  /** Иконка */
  icon: string
  /** Класс */
  grade: number
  /** Четверть */
  quarter: number
}

/** Группа узлов пути (четверть) */
export interface PathGroup {
  /** Класс */
  grade: number
  /** Четверть */
  quarter: number
  /** Заголовок группы */
  title: string
  /** Узлы в группе */
  nodes: PathNode[]
}

/** Конфигурация узла для progressPath config */
export interface PathNodeConfig {
  exerciseType: string
  title: string
  description: string
  icon: string
  grade: number
  quarter: number
  thresholds: number[]
}
