/**
 * Конфигурация прогресс-пути обучения
 *
 * Определяет структуру пути: какие темы в каком порядке,
 * пороги очков для звёзд, иконки.
 */
import type { PathNodeConfig } from '@/types/motivation'

/**
 * Пороги очков для звёзд:
 * [минимум, 1 звезда, 2 звезды, 3 звезды]
 *
 * Звёзды вычисляются по формуле:
 * score >= thresholds[3] → 3★
 * score >= thresholds[2] → 2★
 * score >= thresholds[1] → 1★
 * иначе → 0★
 */
export const PROGRESS_PATH_CONFIG: PathNodeConfig[] = [
  // === 1 класс ===
  // Четверть 1
  { exerciseType: 'counting', title: 'Счёт до 10', description: 'Сложение и вычитание в пределах 10', icon: '🔢', grade: 1, quarter: 1, thresholds: [0, 20, 50, 100] },

  // Четверть 2
  { exerciseType: 'counting', title: 'Счёт до 20', description: 'Сложение и вычитание в пределах 20', icon: '🔢', grade: 1, quarter: 2, thresholds: [0, 30, 60, 120] },
  { exerciseType: 'firstGradeDecomposition', title: 'Состав числа', description: 'Изучи состав чисел до 10', icon: '🧱', grade: 1, quarter: 2, thresholds: [0, 15, 35, 70] },

  // Четверть 3
  { exerciseType: 'firstGradeDecomposition', title: 'Состав числа 2', description: 'Состав чисел до 20', icon: '🧱', grade: 1, quarter: 3, thresholds: [0, 25, 50, 100] },

  // Четверть 4
  { exerciseType: 'counting', title: 'Мастер счёта', description: 'Все виды примеров в пределах 20', icon: '🧮', grade: 1, quarter: 4, thresholds: [0, 40, 80, 150] },

  // === 2 класс ===
  // Четверть 1
  { exerciseType: 'counting', title: 'Счёт до 100', description: 'Сложение и вычитание до 100', icon: '🔢', grade: 2, quarter: 1, thresholds: [0, 30, 70, 150] },
  { exerciseType: 'decomposition', title: 'Удобный способ', description: 'Вычисляй удобным способом', icon: '➕', grade: 2, quarter: 1, thresholds: [0, 20, 50, 100] },
  { exerciseType: 'equations', title: 'Простые уравнения', description: 'Решай простые уравнения', icon: '⚖️', grade: 2, quarter: 1, thresholds: [0, 15, 35, 70] },

  // Четверть 2
  { exerciseType: 'equations', title: 'Уравнения 2', description: 'Уравнения посложнее', icon: '⚖️', grade: 2, quarter: 2, thresholds: [0, 25, 50, 100] },
  { exerciseType: 'equationsWholePart', title: 'Целое и части', description: 'Решай уравнения методом частей', icon: '🧩', grade: 2, quarter: 2, thresholds: [0, 15, 35, 70] },
  { exerciseType: 'columnSubtraction', title: 'Столбик', description: 'Вычитание в столбик', icon: '📝', grade: 2, quarter: 2, thresholds: [0, 15, 35, 70] },

  // Четверть 3
  { exerciseType: 'decomposition', title: 'Мастер разложения', description: 'Сложные разложения', icon: '➕', grade: 2, quarter: 3, thresholds: [0, 30, 60, 120] },
  { exerciseType: 'multiplication', title: 'Умножение', description: 'Начни учить таблицу умножения', icon: '✖️', grade: 2, quarter: 3, thresholds: [0, 20, 50, 100] },

  // Четверть 4
  { exerciseType: 'multiplication', title: 'Таблица умножения', description: 'Освой таблицу умножения', icon: '✖️', grade: 2, quarter: 4, thresholds: [0, 40, 80, 160] },
  { exerciseType: 'columnSubtraction', title: 'Столбик про', description: 'Сложное вычитание в столбик', icon: '📝', grade: 2, quarter: 4, thresholds: [0, 25, 50, 100] },

  // === 3 класс ===
  // Четверть 1
  { exerciseType: 'decomposition', title: 'Разложение', description: 'Вычисление удобным способом', icon: '➕', grade: 3, quarter: 1, thresholds: [0, 25, 60, 120] },
  { exerciseType: 'multiplication', title: 'Умножение 3', description: 'Таблица умножения до 5', icon: '✖️', grade: 3, quarter: 1, thresholds: [0, 30, 70, 140] },

  // Четверть 2
  { exerciseType: 'columnSubtraction', title: 'Вычитание', description: 'Вычитание в столбик', icon: '📝', grade: 3, quarter: 2, thresholds: [0, 20, 50, 100] },
  { exerciseType: 'equationsWholePart', title: 'Уравнения', description: 'Целое и части', icon: '🧩', grade: 3, quarter: 2, thresholds: [0, 20, 50, 100] },

  // Четверть 3-4 (повторение и углубление)
  { exerciseType: 'multiplication', title: 'Мастер умножения', description: 'Вся таблица умножения', icon: '✖️', grade: 3, quarter: 3, thresholds: [0, 50, 100, 200] },
  { exerciseType: 'decomposition', title: 'Эксперт', description: 'Сложные вычисления', icon: '🧠', grade: 3, quarter: 4, thresholds: [0, 40, 80, 160] },

  // === 4 класс ===
  // Четверть 1
  { exerciseType: 'decomposition', title: 'Маэстро', description: 'Мастер вычислений', icon: '🧠', grade: 4, quarter: 1, thresholds: [0, 50, 100, 200] },
  { exerciseType: 'multiplication', title: 'Таблица ×', description: 'Совершенствуй умножение', icon: '✖️', grade: 4, quarter: 1, thresholds: [0, 60, 120, 240] },

  // Четверть 2
  { exerciseType: 'columnSubtraction', title: 'Столбик эксперт', description: 'Многозначные числа', icon: '📝', grade: 4, quarter: 2, thresholds: [0, 30, 70, 150] },
  { exerciseType: 'equationsWholePart', title: 'Уравнения +', description: 'Продвинутые уравнения', icon: '🧩', grade: 4, quarter: 2, thresholds: [0, 30, 70, 150] },

  // Четверть 3-4
  { exerciseType: 'multiplication', title: 'Гранд-мастер', description: 'Полное владение таблицей', icon: '👑', grade: 4, quarter: 3, thresholds: [0, 80, 160, 300] },
  { exerciseType: 'decomposition', title: 'Гений', description: 'Высший уровень', icon: '🎓', grade: 4, quarter: 4, thresholds: [0, 70, 140, 280] },
]

/**
 * Вычислить количество звёзд по очкам и порогам
 */
export function calculateStars(score: number, thresholds: number[]): 0 | 1 | 2 | 3 {
  if (score >= thresholds[3]) return 3
  if (score >= thresholds[2]) return 2
  if (score >= thresholds[1]) return 1
  return 0
}

/**
 * Получить заголовок для четверти
 */
export function getQuarterTitle(grade: number, quarter: number): string {
  return `${grade} класс, ${quarter} четверть`
}
