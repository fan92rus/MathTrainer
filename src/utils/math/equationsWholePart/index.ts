/**
 * Генератор задач для упражнения "Решение уравнений методом 'целое и части'"
 *
 * Метод "целое и части" основан на визуализации:
 * - Целое = часть₁ + часть₂
 * - Целое - часть₁ = часть₂
 * - Целое - часть₂ = часть₁
 *
 * Три типа уравнений:
 * 1. unknownAddend: x + a = b (найти неизвестное слагаемое)
 * 2. unknownSubtrahend: a - x = b (найти вычитаемое)
 * 3. unknownMinuend: x - a = b (найти уменьшаемое)
 *
 * @author TDD implementation
 * @version 1.0.0
 */

import { shuffleArray } from '../common';
import type {
  EquationWholePartProblem,
  EquationWholePartOptions,
  EquationWholePartType
} from '@/types';

/**
 * Константы генерации
 */
export const TRAINING_QUESTIONS_COUNT = 10;
export const DIAGNOSTIC_PROBLEMS_COUNT = 10;
export const MAX_GENERATION_ATTEMPTS = 100;

/**
 * Диапазоны чисел для уровней сложности
 */
const DIFFICULTY_RANGES = {
  easy: { maxWhole: 10, difficulty: 1 },      // Сложность 1-3: числа до 10
  medium: { maxWhole: 20, difficulty: 5 },    // Сложность 4-6: числа до 20
  hard: { maxWhole: 100, difficulty: 8 },     // Сложность 7-10: числа до 100
} as const;

// Алиас для краткости
type EquationType = EquationWholePartType;

/**
 * Генерирует неправильные варианты ответов
 *
 * Стратегии генерации:
 * 1. Близкие числа (±1, ±2 от правильного)
 * 2. Ошибки в подсчёте (перепутать части)
 * 3. Типичные ошибки детей (использовать неправильную операцию)
 *
 * @param correctAnswer - Правильный ответ
 * @param whole - Целое число (для контекста)
 * @param knownPart - Известная часть
 * @returns Массив из 3 неправильных вариантов ответов
 */
export function generateWrongOptions(
  correctAnswer: number,
  whole: number,
  knownPart: number
): string[] {
  const wrongOptions = new Set<string>();
  const maxAttempts = 50; // Увеличил количество попыток

  // Стратегия 1: Близкие числа (±1, ±2, ±3)
  const closeOffsets = [-3, -2, -1, 1, 2, 3];
  for (const offset of closeOffsets) {
    const wrongValue = correctAnswer + offset;
    if (wrongValue >= 0 && wrongValue <= whole && wrongValue !== correctAnswer) {
      wrongOptions.add(wrongValue.toString());
    }
  }

  // Стратегия 2: Использовать целое или известную часть (типичная ошибка)
  if (whole !== correctAnswer) {
    wrongOptions.add(whole.toString());
  }
  if (knownPart !== correctAnswer) {
    wrongOptions.add(knownPart.toString());
  }

  // Стратегия 3: Разность (другая типичная ошибка)
  const difference = Math.abs(whole - knownPart);
  if (difference !== correctAnswer && difference >= 0 && difference <= whole) {
    wrongOptions.add(difference.toString());
  }

  // Стратегия 4: Коммутативная ошибка (для сложения)
  const commutative = whole - knownPart;
  if (commutative !== correctAnswer && commutative >= 0 && commutative <= whole) {
    wrongOptions.add(commutative.toString());
  }

  // Стратегия 5: Сумма (другая ошибка)
  const sum = correctAnswer + knownPart;
  if (sum !== correctAnswer && sum <= whole * 2) {
    wrongOptions.add(sum.toString());
  }

  // Если недостаточно уникальных вариантов, добавляем случайные
  let attempts = 0;
  while (wrongOptions.size < 3 && attempts < maxAttempts) {
    // Генерируем случайное значение в расширенном диапазоне
    const maxValue = Math.max(whole, correctAnswer + 10);
    const randomValue = Math.floor(Math.random() * (maxValue + 1));
    if (randomValue !== correctAnswer && randomValue >= 0) {
      wrongOptions.add(randomValue.toString());
    }
    attempts++;
  }

  // Преобразуем в массив и перемешиваем
  const result = Array.from(wrongOptions).slice(0, 3);
  return shuffleArray(result);
}

/**
 * Генерирует задачу типа "неизвестное слагаемое" (x + a = b)
 *
 * Пример: x + 5 = 12, где x = 7
 * Инвариант: x + a = b => неизвестная часть + известная часть = целое
 *
 * @param maxWhole - Максимальное значение целого (минимум 2)
 * @returns Задача типа unknownAddend
 */
function generateUnknownAddend(maxWhole: number): EquationWholePartProblem {
  // Генерируем целое от 2 до maxWhole
  // Для maxWhole = 2, получаем диапазон [0, 0] + 2 = 2
  const range = Math.max(0, maxWhole - 2);
  const whole = Math.floor(Math.random() * (range + 1)) + 2;

  // Генерируем известную часть от 0 до whole
  const knownPart = Math.floor(Math.random() * (whole + 1));

  // Неизвестная часть
  const unknownPart = whole - knownPart;

  // Формируем выражение
  const expression = `x + ${knownPart} = ${whole}`;

  // Генерируем варианты ответов
  const wrongOptions = generateWrongOptions(unknownPart, whole, knownPart);
  const allOptions = shuffleArray([...wrongOptions, unknownPart.toString()]);
  const correctIndex = allOptions.indexOf(unknownPart.toString());

  return {
    id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    expression,
    operation: 'equation',
    num1: unknownPart,
    num2: knownPart,
    correctAnswer: unknownPart,
    options: allOptions,
    correctIndex,
    difficulty: 1,
    equationType: 'unknownAddend',
    whole,
    knownPart,
    unknownPart,
    operationSign: '+',
    supportLevel: 1,
  };
}

/**
 * Генерирует задачу типа "неизвестное вычитаемое" (a - x = b)
 *
 * Пример: 12 - x = 5, где x = 7
 * Инвариант: целое - x = известная часть => x = целое - известная часть
 *
 * @param maxWhole - Максимальное значение целого (минимум 2)
 * @returns Задача типа unknownSubtrahend
 */
function generateUnknownSubtrahend(maxWhole: number): EquationWholePartProblem {
  // Генерируем целое от 2 до maxWhole
  const range = Math.max(0, maxWhole - 2);
  const whole = Math.floor(Math.random() * (range + 1)) + 2;

  // Генерируем известную часть (результат) от 0 до whole
  const knownPart = Math.floor(Math.random() * (whole + 1));

  // Неизвестная часть (вычитаемое)
  const unknownPart = whole - knownPart;

  // Формируем выражение
  const expression = `${whole} - x = ${knownPart}`;

  // Генерируем варианты ответов
  const wrongOptions = generateWrongOptions(unknownPart, whole, knownPart);
  const allOptions = shuffleArray([...wrongOptions, unknownPart.toString()]);
  const correctIndex = allOptions.indexOf(unknownPart.toString());

  return {
    id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    expression,
    operation: 'equation',
    num1: whole,
    num2: unknownPart,
    correctAnswer: unknownPart,
    options: allOptions,
    correctIndex,
    difficulty: 1,
    equationType: 'unknownSubtrahend',
    whole,
    knownPart,
    unknownPart,
    operationSign: '-',
    supportLevel: 1,
  };
}

/**
 * Генерирует задачу типа "неизвестное уменьшаемое" (x - a = b)
 *
 * Пример: x - 5 = 7, где x = 12
 * Инвариант: x - известная часть = результат => x = известная часть + результат
 *
 * @param maxWhole - Максимальное значение целого (минимум 2)
 * @returns Задача типа unknownMinuend
 */
function generateUnknownMinuend(maxWhole: number): EquationWholePartProblem {
  // Генерируем целое от 2 до maxWhole
  // Для maxWhole = 2, получаем диапазон [0, 0] + 2 = 2
  const wholeRange = Math.max(0, maxWhole - 2);
  const whole = Math.floor(Math.random() * (wholeRange + 1)) + 2;

  // Генерируем известную часть (вычитаемое) от 1 до whole - 1
  const knownPartRange = Math.max(0, whole - 2);
  const knownPart = Math.floor(Math.random() * (knownPartRange + 1)) + 1;

  // Результат (известная часть после вычитания)
  const result = whole - knownPart;

  // Неизвестная часть (уменьшаемое) = целое
  const unknownPart = whole;

  // Формируем выражение
  const expression = `x - ${knownPart} = ${result}`;

  // Генерируем варианты ответов
  const wrongOptions = generateWrongOptions(unknownPart, whole, knownPart);
  const allOptions = shuffleArray([...wrongOptions, unknownPart.toString()]);
  const correctIndex = allOptions.indexOf(unknownPart.toString());

  return {
    id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    expression,
    operation: 'equation',
    num1: unknownPart,
    num2: knownPart,
    correctAnswer: unknownPart,
    options: allOptions,
    correctIndex,
    difficulty: 1,
    equationType: 'unknownMinuend',
    whole,
    knownPart,
    unknownPart,
    operationSign: '-',
    supportLevel: 1,
  };
}

/**
 * Определяет диапазон чисел на основе сложности
 *
 * @param difficulty - Уровень сложности (1-10)
 * @returns Объект с maxWhole и difficulty
 */
function getDifficultyRange(difficulty: number): { maxWhole: number; difficulty: number } {
  if (difficulty <= 3) return DIFFICULTY_RANGES.easy;
  if (difficulty <= 6) return DIFFICULTY_RANGES.medium;
  return DIFFICULTY_RANGES.hard;
}

/**
 * Основная функция генерации задачи уравнения "целое и части"
 *
 * @param currentScore - Текущий счёт (для генерации разных задач)
 * @param difficulty - Уровень сложности (1-10)
 * @param options - Опции генерации
 * @returns Сгенерированная задача
 */
export function generateEquationWholePartProblem(
  currentScore: number = 0,
  difficulty: number = 1,
  options: EquationWholePartOptions = {}
): EquationWholePartProblem {
  // Определяем диапазон чисел
  const { maxWhole } = getDifficultyRange(difficulty);
  const maxNumber = options.maxNumber ?? maxWhole;

  // Определяем доступные типы уравнений
  const availableTypes: EquationType[] = options.equationTypes ?? [
    'unknownAddend',
    'unknownSubtrahend',
    'unknownMinuend',
  ];

  // Случайно выбираем тип уравнения (используем currentScore для вариативности)
  const typeIndex = (currentScore + Math.floor(Math.random() * availableTypes.length)) % availableTypes.length;
  const equationType = availableTypes[typeIndex];

  // Генерируем задачу соответствующего типа
  let problem: EquationWholePartProblem;

  switch (equationType) {
    case 'unknownAddend':
      problem = generateUnknownAddend(maxNumber);
      break;
    case 'unknownSubtrahend':
      problem = generateUnknownSubtrahend(maxNumber);
      break;
    case 'unknownMinuend':
      problem = generateUnknownMinuend(maxNumber);
      break;
    default:
      problem = generateUnknownAddend(maxNumber);
  }

  // Устанавливаем уровень поддержки
  problem.supportLevel = options.supportLevel ?? 1;
  problem.difficulty = difficulty;

  return problem;
}

/**
 * Генерирует набор диагностических задач
 *
 * Требования из PRD FR-012:
 * - 10 уравнений смешанных типов
 * - Порог прохождения: 5/10 правильных
 * - Уровень 2 (текстовые метки)
 *
 * @returns Массив из 10 диагностических задач
 */
export function generateDiagnosticProblems(): EquationWholePartProblem[] {
  const problems: EquationWholePartProblem[] = [];
  const types: EquationType[] = ['unknownAddend', 'unknownSubtrahend', 'unknownMinuend'];

  // Генерируем 10 задач равномерно по типам
  for (let i = 0; i < DIAGNOSTIC_PROBLEMS_COUNT; i++) {
    const typeIndex = i % types.length;
    const selectedType = types[typeIndex]!;
    const problem = generateEquationWholePartProblem(i, 5, {
      equationTypes: [selectedType],
      supportLevel: 2,
      maxNumber: 20,
    });
    problems.push(problem);
  }

  // Перемешиваем задачи
  return shuffleArray(problems);
}

/**
 * Генерирует набор тренировочных задач
 *
 * @param count - Количество задач (по умолчанию 10)
 * @param difficulty - Уровень сложности (1-10)
 * @param supportLevel - Уровень поддержки (1, 2, 3)
 * @returns Массив тренировочных задач
 */
export function generateTrainingProblems(
  count: number = TRAINING_QUESTIONS_COUNT,
  difficulty: number = 1,
  supportLevel: 1 | 2 | 3 = 1
): EquationWholePartProblem[] {
  const problems: EquationWholePartProblem[] = [];

  for (let i = 0; i < count; i++) {
    const problem = generateEquationWholePartProblem(i, difficulty, {
      supportLevel,
    });
    problems.push(problem);
  }

  return problems;
}
