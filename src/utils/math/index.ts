/**
 * Экспорты всех математических утилит
 */

// Общие утилиты
export * from './common';

// Утилиты по типам заданий
export * from './counting';
export * from './decomposition';
export * from './multiplication';
export * from './equations';
export * from './firstGrade';

// Типы
export type {
  MathProblem,
  FirstGradeDecompositionProblem,
  MultiplicationLevel,
  MultiplicationProblem,
  EquationProblem,
  EquationsLevelConfig,
  NextLevelInfo
} from '@/types';

// Экспорт функции для ручного режима уравнений
export { generateEquationProblemManual } from './equations';
