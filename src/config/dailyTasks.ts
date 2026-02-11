// Конфигурация ежедневных заданий
// Соответствует требованиям из FR-ARCH-005 и PRD v2.0
// Правила доступности использую общую конфигурацию из exerciseAvailability.ts

import type { DailyTaskConfig } from '@/store/dailyTasks/types';
import { EXERCISE_AVAILABILITY } from './exerciseAvailability';

/**
 * Конфигурация всех ежедневных заданий
 * 100% заданий определены в конфиге (FR-ARCH-005)
 *
 * Правила доступности (из exerciseAvailability.ts):
 * - counting: 1 кл (Q1-Q4), 2 кл (Q1-Q2)
 * - firstGradeDecomposition: 1 кл (Q2-Q4)
 * - decomposition: 2-4 кл (Q1-Q4)
 * - multiplication: 2-4 кл (Q3-Q4)
 * - equations: 2 кл (Q1-Q2)
 * - columnSubtraction: 2-4 кл (Q2-Q4)
 * - equationsWholePart: 2-4 кл (Q2-Q4)
 */
export const DAILY_TASKS_CONFIG: DailyTaskConfig[] = [
  // ============================================
  // Задания на счёт (обязательные)
  // ============================================
  {
    id: 'counting_3',
    type: 'counting',
    exerciseType: 'counting',
    description: 'Посчитать 3 раза',
    target: 3,
    reward: { coins: 6, experience: 12 },
    priority: 1,
    required: true,
    grade: EXERCISE_AVAILABILITY.counting.grades,
    quarter: EXERCISE_AVAILABILITY.counting.quarters,
  },
  {
    id: 'counting_5',
    type: 'counting',
    exerciseType: 'counting',
    description: 'Посчитать 5 раз',
    target: 5,
    reward: { coins: 10, experience: 20 },
    priority: 2,
    required: true,
    grade: EXERCISE_AVAILABILITY.counting.grades,
    quarter: EXERCISE_AVAILABILITY.counting.quarters,
  },

  // ============================================
  // Задания на разложение чисел (1 класс, Q2-Q4)
  // ============================================
  {
    id: 'decomposition_easy_3',
    type: 'decomposition_easy',
    exerciseType: 'firstGradeDecomposition',
    description: 'Разложить 3 числа (просто)',
    target: 3,
    reward: { coins: 5, experience: 10 },
    priority: 3,
    required: false,
    grade: EXERCISE_AVAILABILITY.firstGradeDecomposition.grades,
    quarter: EXERCISE_AVAILABILITY.firstGradeDecomposition.quarters,
  },
  {
    id: 'decomposition_easy_5',
    type: 'decomposition_easy',
    exerciseType: 'firstGradeDecomposition',
    description: 'Разложить 5 чисел (просто)',
    target: 5,
    reward: { coins: 10, experience: 20 },
    priority: 4,
    required: false,
    grade: EXERCISE_AVAILABILITY.firstGradeDecomposition.grades,
    quarter: EXERCISE_AVAILABILITY.firstGradeDecomposition.quarters,
  },

  // ============================================
  // Задания на простые уравнения (2 класс, Q1-Q2)
  // ============================================
  {
    id: 'equations_5',
    type: 'equations',
    exerciseType: 'equations',
    description: 'Решить 5 примеров на сложение/вычитание',
    target: 5,
    reward: { coins: 5, experience: 10 },
    priority: 5,
    required: false,
    grade: EXERCISE_AVAILABILITY.equations.grades,
    quarter: EXERCISE_AVAILABILITY.equations.quarters,
  },
  {
    id: 'equations_15',
    type: 'equations',
    exerciseType: 'equations',
    description: 'Решить 15 примеров на сложение/вычитание',
    target: 15,
    reward: { coins: 12, experience: 25 },
    priority: 6,
    required: false,
    grade: EXERCISE_AVAILABILITY.equations.grades,
    quarter: EXERCISE_AVAILABILITY.equations.quarters,
  },

  // ============================================
  // Задания на разложение чисел (2-4 классы, все четверти)
  // ============================================
  {
    id: 'decomposition_3',
    type: 'decomposition',
    exerciseType: 'decomposition',
    description: 'Разложить 3 числа',
    target: 3,
    reward: { coins: 8, experience: 15 },
    priority: 7,
    required: false,
    grade: EXERCISE_AVAILABILITY.decomposition.grades,
    quarter: EXERCISE_AVAILABILITY.decomposition.quarters,
  },
  {
    id: 'decomposition_5',
    type: 'decomposition',
    exerciseType: 'decomposition',
    description: 'Разложить 5 чисел',
    target: 5,
    reward: { coins: 14, experience: 28 },
    priority: 8,
    required: false,
    grade: EXERCISE_AVAILABILITY.decomposition.grades,
    quarter: EXERCISE_AVAILABILITY.decomposition.quarters,
  },

  // ============================================
  // Задания на умножение (2-4 классы, Q3-Q4)
  // ============================================
  {
    id: 'multiplication_5',
    type: 'multiplication',
    exerciseType: 'multiplication',
    description: 'Решить 5 примеров на умножение',
    target: 5,
    reward: { coins: 7, experience: 15 },
    priority: 9,
    required: false,
    grade: EXERCISE_AVAILABILITY.multiplication.grades,
    quarter: EXERCISE_AVAILABILITY.multiplication.quarters,
  },
  {
    id: 'multiplication_10',
    type: 'multiplication',
    exerciseType: 'multiplication',
    description: 'Решить 10 примеров на умножение',
    target: 10,
    reward: { coins: 15, experience: 30 },
    priority: 10,
    required: false,
    grade: EXERCISE_AVAILABILITY.multiplication.grades,
    quarter: EXERCISE_AVAILABILITY.multiplication.quarters,
  },

  // ============================================
  // Задания на вычитание в столбик (2-4 классы, Q2-Q4)
  // ============================================
  {
    id: 'column_subtraction_3',
    type: 'columnSubtraction',
    exerciseType: 'columnSubtraction',
    description: 'Реши 3 примера на вычитание в столбик',
    target: 3,
    reward: { coins: 8, experience: 15 },
    priority: 11,
    required: false,
    grade: EXERCISE_AVAILABILITY.columnSubtraction.grades,
    quarter: EXERCISE_AVAILABILITY.columnSubtraction.quarters,
  },
  {
    id: 'column_subtraction_5',
    type: 'columnSubtraction',
    exerciseType: 'columnSubtraction',
    description: 'Реши 5 примеров на вычитание в столбик',
    target: 5,
    reward: { coins: 14, experience: 28 },
    priority: 12,
    required: false,
    grade: EXERCISE_AVAILABILITY.columnSubtraction.grades,
    quarter: EXERCISE_AVAILABILITY.columnSubtraction.quarters,
  },

  // ============================================
  // Задания на уравнения: целое и части (2-4 классы, Q2-Q4)
  // ============================================
  {
    id: 'equations_whole_part_3',
    type: 'equationsWholePart',
    exerciseType: 'equationsWholePart',
    description: 'Реши 3 уравнения (целое и части)',
    target: 3,
    reward: { coins: 7, experience: 15 },
    priority: 13,
    required: false,
    grade: EXERCISE_AVAILABILITY.equationsWholePart.grades,
    quarter: EXERCISE_AVAILABILITY.equationsWholePart.quarters,
  },
  {
    id: 'equations_whole_part_5',
    type: 'equationsWholePart',
    exerciseType: 'equationsWholePart',
    description: 'Реши 5 уравнений (целое и части)',
    target: 5,
    reward: { coins: 12, experience: 25 },
    priority: 14,
    required: false,
    grade: EXERCISE_AVAILABILITY.equationsWholePart.grades,
    quarter: EXERCISE_AVAILABILITY.equationsWholePart.quarters,
  },
];
