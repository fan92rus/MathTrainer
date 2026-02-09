/**
 * Генератор задач для упражнения "Вычитание в столбик"
 *
 * Генерирует двузначные примеры на вычитание (до 100)
 * с фокусом на случаи с заимствованием из десятков.
 *
 * Основные типы примеров:
 * - С заимствованием из десятков (52-17)
 * - С нулём в единицах уменьшаемого (40-13)
 * - С двузначным результатом (33-18)
 */

import type { ColumnSubtractionProblem } from '@/types';
import { shuffleArray } from '../common';

// Вспомогательная функция для генерации случайного числа в диапазоне
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Проверяет, требуется ли заимствование из десятков
 * @param minuend - уменьшаемое (должен быть >= 0)
 * @param subtrahend - вычитаемое (должен быть >= 0)
 * @returns true, если единицы уменьшаемого меньше единиц вычитаемого
 * @throws {Error} если параметры не валидны
 */
export function needsBorrowing(minuend: number, subtrahend: number): boolean {
  if (!Number.isFinite(minuend) || !Number.isFinite(subtrahend)) {
    throw new Error('minuend and subtrahend must be finite numbers');
  }
  if (minuend < 0 || subtrahend < 0) {
    throw new Error('minuend and subtrahend must be non-negative');
  }
  if (minuend > 99 || subtrahend > 99) {
    throw new Error('minuend and subtrahend must be <= 99 for column subtraction');
  }

  const minuendUnits = minuend % 10;
  const subtrahendUnits = subtrahend % 10;
  return minuendUnits < subtrahendUnits;
}

/**
 * Проверяет, есть ли ноль в единицах уменьшаемого
 * @param minuend - уменьшаемое (должен быть >= 0)
 * @returns true, если уменьшаемое заканчивается на 0
 * @throws {Error} если параметр не валиден
 */
export function hasZeroInUnits(minuend: number): boolean {
  if (!Number.isFinite(minuend)) {
    throw new Error('minuend must be a finite number');
  }
  if (minuend < 0 || minuend > 99) {
    throw new Error('minuend must be between 0 and 99 for column subtraction');
  }

  return minuend % 10 === 0;
}

/**
 * Генерирует неправильные варианты ответов
 * Включает "перевёрнутый" ответ (перестановка цифр результата)
 * как ловушку для типичной ошибки.
 *
 * @param correctAnswer - правильный ответ
 * @param minuend - уменьшаемое
 * @param subtrahend - вычитаемое
 * @returns массив из 3 неправильных вариантов
 */
export function generateWrongOptions(
  correctAnswer: number,
  minuend: number,
  subtrahend: number
): string[] {
  const wrongOptions: string[] = [];

  // Стратегия 1: "Перевёрнутый" ответ (наиболее частая ошибка)
  // Для примера 52-17=35, "перевёрнутый" ответ будет 53
  if (correctAnswer >= 10) {
    const tens = Math.floor(correctAnswer / 10);
    const units = correctAnswer % 10;
    const flipped = units * 10 + tens;
    if (flipped !== correctAnswer && flipped > 0 && flipped < 100) {
      wrongOptions.push(flipped.toString());
    }
  }

  // Стратегия 2: Ошибка в заимствовании (не занияли десяток)
  // Для 52-17: 52-17 -> 5-1=4, 2-7 нельзя, берём 5 (переворот)
  // Или 52-17 -> 5-1=4, 7-2=5 -> 45
  const simpleWrong = minuend - subtrahend + randomInt(-5, 5);
  if (simpleWrong !== correctAnswer && simpleWrong > 0 && simpleWrong < 100) {
    wrongOptions.push(simpleWrong.toString());
  }

  // Стратегия 3: Ошибка на единицу/десять
  for (const offset of [-1, 1, -10, 10, -2, 2]) {
    if (wrongOptions.length >= 3) break;
    const candidate = correctAnswer + offset;
    if (
      candidate !== correctAnswer &&
      candidate > 0 &&
      candidate < 100 &&
      !wrongOptions.includes(candidate.toString())
    ) {
      wrongOptions.push(candidate.toString());
    }
  }

  // Fallback: если не хватает вариантов, добавляем простые ошибки
  while (wrongOptions.length < 3) {
    const fallback = randomInt(1, 99);
    if (
      fallback !== correctAnswer &&
      !wrongOptions.includes(fallback.toString())
    ) {
      wrongOptions.push(fallback.toString());
    }
  }

  return wrongOptions.slice(0, 3);
}

// Константы для генерации задач
export const TRAINING_QUESTIONS_COUNT = 10;
export const DIAGNOSTIC_PROBLEMS_COUNT = 10;
export const DIAGNOSTIC_PASS_THRESHOLD = 5;
export const DIAGNOSTIC_MEDIUM_THRESHOLD = 3;
export const BORROWING_DIFFICULTY_THRESHOLD = 3;
export const HIGH_DIFFICULTY_THRESHOLD = 7;
export const MAX_GENERATION_ATTEMPTS = 100;
export const MIN_RESULT = 10;
export const MAX_RESULT = 99;

/**
 * Генерирует простой пример без заимствования
 */
function generateSimpleProblem(): { minuend: number; subtrahend: number } {
  const minuend = randomInt(20, 99);
  const minuendUnits = minuend % 10;
  const maxSubtrahendUnits = minuendUnits;
  const subtrahendUnits = randomInt(1, maxSubtrahendUnits);
  const subtrahendTens = randomInt(1, Math.floor(minuend / 10));
  const subtrahend = subtrahendTens * 10 + subtrahendUnits;

  return { minuend, subtrahend };
}

/**
 * Генерирует пример с заимствованием из десятков
 */
function generateBorrowingProblem(): { minuend: number; subtrahend: number } {
  const minuend = randomInt(21, 99);
  const minuendUnits = minuend % 10;

  // Вычитаемое должно быть таким, чтобы требовалось заимствование
  const minSubtrahendUnits = minuendUnits + 1;
  const maxSubtrahendUnits = Math.min(minuendUnits + 8, 9);

  const subtrahendUnits = randomInt(minSubtrahendUnits, maxSubtrahendUnits);
  const subtrahendTens = randomInt(1, Math.floor(minuend / 10) - 1);
  const subtrahend = subtrahendTens * 10 + subtrahendUnits;

  return { minuend, subtrahend };
}

/**
 * Генерирует пример с нулём в единицах уменьшаемого
 */
function generateZeroUnitsProblem(): { minuend: number; subtrahend: number } {
  const tens = randomInt(2, 9); // 20, 30, ..., 90
  const minuend = tens * 10;
  const subtrahend = randomInt(11, minuend - 1);

  return { minuend, subtrahend };
}

/**
 * Генерирует задачу на вычитание в столбик
 *
 * @param difficulty - уровень сложности (1-10)
 * @returns задача ColumnSubtractionProblem
 */
export function generateColumnSubtractionProblem(
  difficulty: number = 1
): ColumnSubtractionProblem {
  // Определяем тип примера на основе сложности
  // difficulty 1-3: простые без заимствования
  // difficulty 4-6: с заимствованием
  // difficulty 7-10: смешанные, включая ноль в единицах

  const needsBorrowingFlag = difficulty > BORROWING_DIFFICULTY_THRESHOLD || (difficulty > 2 && Math.random() > 0.5);
  const zeroUnitsFlag = difficulty > HIGH_DIFFICULTY_THRESHOLD && Math.random() > 0.7;

  let minuend: number;
  let subtrahend: number;
  let attempts = 0;

  do {
    attempts++;

    if (zeroUnitsFlag) {
      ({ minuend, subtrahend } = generateZeroUnitsProblem());
    } else if (needsBorrowingFlag) {
      ({ minuend, subtrahend } = generateBorrowingProblem());
    } else {
      ({ minuend, subtrahend } = generateSimpleProblem());
    }

    // Проверяем результат
  } while (
    attempts < MAX_GENERATION_ATTEMPTS &&
    (minuend - subtrahend < MIN_RESULT || minuend - subtrahend > MAX_RESULT)
  );

  const result = minuend - subtrahend;
  const expression = `${minuend} - ${subtrahend}`;
  const correctAnswer = result;

  // Генерируем неправильные варианты
  const wrongOptions = generateWrongOptions(correctAnswer, minuend, subtrahend);
  const allOptions = shuffleArray([correctAnswer.toString(), ...wrongOptions]);
  const correctIndex = allOptions.indexOf(correctAnswer.toString());

  return {
    id: `col-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    minuend,
    subtrahend,
    result,
    needsBorrowing: needsBorrowing(minuend, subtrahend),
    borrowFromTens: needsBorrowing(minuend, subtrahend),
    hasZeroInUnits: hasZeroInUnits(minuend),
    expression,
    correctAnswer,
    options: allOptions,
    correctIndex,
    difficulty,
    operation: 'subtraction',
    num1: minuend,
    num2: subtrahend
  };
}

/**
 * Генерирует набор задач для диагностики
 *
 * @returns массив из 10 задач:
 * - 3 с заимствованием из десятков
 * - 3 с двузначным результатом
 * - 2 с нулём в единицах
 * - 2 смешанных
 */
export function generateDiagnosticProblems(): ColumnSubtractionProblem[] {
  const problems: ColumnSubtractionProblem[] = [];

  // 3 примера с заимствованием
  for (let i = 0; i < 3; i++) {
    let problem: ColumnSubtractionProblem;
    let attempts = 0;
    do {
      problem = generateColumnSubtractionProblem(5);
      attempts++;
    } while (!problem.needsBorrowing && attempts < 20);
    problems.push(problem);
  }

  // 3 примера с двузначным результатом
  for (let i = 0; i < 3; i++) {
    let problem: ColumnSubtractionProblem;
    let attempts = 0;
    do {
      problem = generateColumnSubtractionProblem(4);
      attempts++;
    } while (problem.result < 10 && attempts < 20);
    problems.push(problem);
  }

  // 2 примера с нулём в единицах
  for (let i = 0; i < 2; i++) {
    let problem: ColumnSubtractionProblem;
    let attempts = 0;
    do {
      problem = generateColumnSubtractionProblem(8);
      attempts++;
    } while (!problem.hasZeroInUnits && attempts < 20);
    problems.push(problem);
  }

  // 2 смешанных примера
  for (let i = 0; i < 2; i++) {
    problems.push(generateColumnSubtractionProblem(randomInt(3, 7)));
  }

  return shuffleArray(problems);
}
