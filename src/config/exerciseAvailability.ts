import type { GradeLevel } from '@/types';

/**
 * Интерфейс для настроек доступности упражнения
 */
export interface ExerciseAvailabilityConfig {
  /** Правило доступности: функция, возвращающая true если упражнение доступно */
  available: (grade: GradeLevel, quarter: number) => boolean;
  /** Название упражнения */
  title: string;
  /** Описание упражнения */
  description: string;
  /** Классы, в которых упражнение доступно (вычисляется из available) */
  grades: GradeLevel[];
  /** Четверти, в которых упражнение доступно (вычисляется из available) */
  quarters: number[];
}

/**
 * Единичный источник правды для доступности упражнений
 *
 * Правила:
 * - counting: 1 класс (Q1-Q4), 2 класс (Q1-Q2)
 * - firstGradeDecomposition: 1 класс (Q2-Q4)
 * - decomposition: 2-4 классы (Q1-Q4)
 * - multiplication: 2 класс (Q3-Q4), 3-4 классы (Q1-Q4)
 * - equations: 2 класс (Q1-Q2)
 * - columnSubtraction: 2 класс (Q2-Q4), 3-4 классы (Q1-Q4)
 * - equationsWholePart: 2 класс (Q2-Q4), 3-4 классы (Q1-Q4)
 */
export const EXERCISE_AVAILABILITY: Record<string, ExerciseAvailabilityConfig> = {
  counting: {
    available: (grade: GradeLevel, quarter: number) =>
      grade === 1 || (grade === 2 && quarter <= 2),
    title: 'Тренажер счета',
    description: 'Решай примеры на сложение и вычитание',
    grades: [1, 2],
    quarters: [1, 2],
  },
  firstGradeDecomposition: {
    available: (grade: GradeLevel, quarter: number) =>
      grade === 1 && quarter >= 2,
    title: 'Состав числа (1 класс)',
    description: 'Изучи состав чисел до 10',
    grades: [1],
    quarters: [2, 3, 4],
  },
  decomposition: {
    available: (grade: GradeLevel, quarter: number) => grade >= 2,
    title: 'Вычисление удобным способом',
    description: 'Выбирай удобный способ вычисления',
    grades: [2, 3, 4],
    quarters: [1, 2, 3, 4],
  },
  multiplication: {
    available: (grade: GradeLevel, quarter: number) =>
      (grade === 2 && quarter >= 3) || grade > 2,
    title: 'Таблица умножения',
    description: 'Изучай таблицу умножения постепенно',
    grades: [2, 3, 4],
    quarters: [3, 4],
  },
  equations: {
    available: (grade: GradeLevel, quarter: number) =>
      grade === 2 && quarter <= 2,
    title: 'Простые уравнения',
    description: 'Решай простые уравнения с неизвестным',
    grades: [2],
    quarters: [1, 2],
  },
  columnSubtraction: {
    available: (grade: GradeLevel, quarter: number) =>
      (grade === 2 && quarter >= 2) || grade > 2,
    title: 'Вычитание в столбик',
    description: 'Научись вычитать с заимствованием из десятков',
    grades: [2, 3, 4],
    quarters: [2, 3, 4],
  },
  equationsWholePart: {
    available: (grade: GradeLevel, quarter: number) =>
      (grade === 2 && quarter >= 2) || grade > 2,
    title: 'Уравнения: целое и части',
    description: 'Решай уравнения методом частей',
    grades: [2, 3, 4],
    quarters: [2, 3, 4],
  },
};

/**
 * Проверяет, доступно ли упражнение для указанных класса и четверти
 */
export function isExerciseAvailable(
  exerciseType: string,
  grade: GradeLevel,
  quarter: number
): boolean {
  const config = EXERCISE_AVAILABILITY[exerciseType];
  return config?.available(grade, quarter) ?? false;
}

/**
 * Получает конфигурацию доступности для упражнения
 */
export function getExerciseAvailability(exerciseType: string): ExerciseAvailabilityConfig | undefined {
  return EXERCISE_AVAILABILITY[exerciseType];
}

/**
 * Получает все упражнения, доступные для указанных класса и четверти
 */
export function getAvailableExercises(grade: GradeLevel, quarter: number): string[] {
  return Object.entries(EXERCISE_AVAILABILITY)
    .filter(([_, config]) => config.available(grade, quarter))
    .map(([type]) => type);
}
