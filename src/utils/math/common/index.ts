/**
 * Общие утилиты для всех типов математических заданий
 */

import type { MathOperation } from '@/types';

/**
 * Перемешивает массив случайным образом
 * @param array Массив для перемешивания
 * @returns Перемешанный массив
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

/**
 * Интерфейс для результата стратегии генерации
 */
interface StrategyResult {
  part1: number;
  part2: number;
  isValid: boolean;
}

/**
 * Вспомогательная функция для генерации неправильного варианта по заданной стратегии
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateWrongOptionByStrategy(
  wrongOptions: string[],
  strategyFn: () => StrategyResult,
  _isNotAlreadyAdded: (_part1: number, _part2: number) => boolean,
  maxAttempts: number
): void {
  let attempts = 0;

  while (wrongOptions.length < wrongOptions.length + 1 && attempts < maxAttempts) {
    const result = strategyFn();

    if (result.isValid && _isNotAlreadyAdded(result.part1, result.part2)) {
      wrongOptions.push(`${result.part1} и ${result.part2}`);
    }

    attempts++;
  }
}

/**
 * Генерирует варианты, близкие к правильному ответу
 * @param correctAnswer Правильный ответ
 * @param minDistance Минимальное расстояние до правильного ответа
 * @param maxDistance Максимальное расстояние до правильного ответа
 * @param options Массив для хранения сгенерированных вариантов
 * @param maxAttempts Максимальное количество попыток
 */
export function generateCloseAnswers(
  correctAnswer: number,
  minDistance: number,
  maxDistance: number,
  options: number[],
  maxAttempts: number = 100
): void {
  let attempts = 0;

  while (options.length < 3 && attempts < maxAttempts) {
    attempts++;
    const offset = Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
    const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);

    if (wrongAnswer >= 0 && !options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
      options.push(wrongAnswer);
    }
  }
}

/**
 * Генерирует варианты с ошибкой в последней цифре
 * @param correctAnswer Правильный ответ
 * @param options Массив для хранения сгенерированных вариантов
 * @param maxAttempts Максимальное количество попыток
 */
export function generateLastDigitErrors(
  correctAnswer: number,
  options: number[],
  maxAttempts: number = 100
): void {
  let attempts = 0;

  while (options.length < 3 && attempts < maxAttempts) {
    attempts++;
    const lastDigit = correctAnswer % 10;
    const newLastDigit = (lastDigit + Math.floor(Math.random() * 9) + 1) % 10;
    const wrongAnswer = Math.floor(correctAnswer / 10) * 10 + newLastDigit;

    if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
      options.push(wrongAnswer);
    }
  }
}

/**
 * Генерирует варианты с ошибкой в десятках
 * @param correctAnswer Правильный ответ
 * @param options Массив для хранения сгенерированных вариантов
 * @param maxAttempts Максимальное количество попыток
 */
export function generateTensErrors(
  correctAnswer: number,
  options: number[],
  maxAttempts: number = 100
): void {
  let attempts = 0;

  while (options.length < 3 && attempts < maxAttempts) {
    attempts++;

    if (correctAnswer >= 10) {
      const tens = Math.floor(correctAnswer / 10);
      const newTens = Math.max(1, tens + (Math.random() > 0.5 ? 1 : -1));
      const wrongAnswer = newTens * 10 + (correctAnswer % 10);

      if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
        options.push(wrongAnswer);
      }
    }
  }
}

/**
 * Проверяет, что ответ не слишком близок к другим ответам
 */
export function isTooCloseToOthers(
  answer: number,
  existingAnswers: number[],
  minDistance: number = 2
): boolean {
  return existingAnswers.some(existing => Math.abs(answer - existing) < minDistance);
}

/**
 * Проверяет, что все ответы уникальны
 */
export function ensureUniqueAnswers(answers: number[]): number[] {
  return [...new Set(answers)];
}

/**
 * Создает математическую операцию на основе типа
 */
export function createMathExpression(num1: number, num2: number, operation: MathOperation): string {
  return `${num1} ${operation === 'addition' ? '+' : '-'} ${num2}`;
}

/**
 * Вычисляет результат математической операции
 */
export function calculateMathResult(num1: number, num2: number, operation: MathOperation): number {
  return operation === 'addition' ? num1 + num2 : num1 - num2;
}