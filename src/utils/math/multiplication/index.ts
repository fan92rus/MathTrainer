/**
 * Утилиты для упражнений на умножение
 */

import type { MathOperation, MultiplicationProblem, MultiplicationLevel } from '@/types';
import { shuffleArray } from '../common';

/**
 * Генерирует неправильные ответы для задачи на умножение
 */
function generateWrongMultiplicationAnswers(
  correctAnswer: number,
  multiplier1: number,
  multiplier2: number
): number[] {
  const wrongAnswers: number[] = [];
  let attempts = 0;
  const maxAttempts = 100; // Защита от бесконечного цикла

  while (wrongAnswers.length < 3 && attempts < maxAttempts) {
    attempts++;
    let wrongAnswer: number;

    const strategy = Math.floor(Math.random() * 5);

    switch (strategy) {
      case 0: {
        // Близкий к правильному ответу
        const offset = Math.floor(Math.random() * 5) + 1;
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
        break;
      }
      case 1: {
        // Заменить один из множителей
        const neighborMultiplier = Math.max(1, multiplier1 + (Math.random() > 0.5 ? 1 : -1));
        wrongAnswer = neighborMultiplier * multiplier2;
        break;
      }
      case 2: {
        // Заменить второй множитель
        const neighborMultiplier2 = Math.max(1, multiplier2 + (Math.random() > 0.5 ? 1 : -1));
        wrongAnswer = multiplier1 * neighborMultiplier2;
        break;
      }
      case 3: {
        // Сложение вместо умножения
        wrongAnswer = multiplier1 + multiplier2;
        break;
      }
      case 4: {
        // Деление вместо умножения
        if (multiplier1 !== 0 && multiplier1 % multiplier2 === 0) {
          wrongAnswer = multiplier1 / multiplier2;
        } else if (multiplier2 !== 0 && multiplier2 % multiplier1 === 0) {
          wrongAnswer = multiplier2 / multiplier1;
        } else {
          // Fallback: просто добавим 1
          wrongAnswer = correctAnswer + 1;
        }
        break;
      }
      default: {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) + 1;
        break;
      }
    }

    // Проверяем, что ответ не дублируется и не отрицательный
    if (
      wrongAnswer >= 0 &&
      !wrongAnswers.includes(wrongAnswer) &&
      wrongAnswer !== correctAnswer
    ) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // Если не удалось сгенерировать 3 уникальных ответа, добавляем запасные
  while (wrongAnswers.length < 3) {
    const fallbackAnswer = correctAnswer + wrongAnswers.length + 1;
    if (!wrongAnswers.includes(fallbackAnswer) && fallbackAnswer >= 0) {
      wrongAnswers.push(fallbackAnswer);
    }
  }

  return wrongAnswers.slice(0, 3);
}

/**
 * Генерирует задачу на умножение
 */
export function generateMultiplicationProblem(maxMultiplier: number = 2): MultiplicationProblem {
  const multiplier1 = Math.floor(Math.random() * maxMultiplier) + 1;
  const multiplier2 = Math.floor(Math.random() * 10) + 1;

  const correctAnswer = multiplier1 * multiplier2;
  const wrongAnswers = generateWrongMultiplicationAnswers(correctAnswer, multiplier1, multiplier2);

  // Собираем все варианты и перемешиваем
  const allOptions = [correctAnswer, ...wrongAnswers];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(correctAnswer);

  return {
    expression: `${multiplier1} × ${multiplier2}`,
    operation: 'multiplication',
    num1: multiplier1,
    num2: multiplier2,
    correctAnswer,
    options: shuffled.map(String),
    correctIndex,
    difficulty: 3,
    maxMultiplier
  };
}

/**
 * Возвращает доступные уровни умножения на основе общего счета
 */
export function getAvailableMultiplicationLevels(totalScore: number): MultiplicationLevel[] {
  const levels: MultiplicationLevel[] = [];

  // Define all levels with their properties (one for each multiplier 2-10)
  const levelConfigs = [];

  for (let i = 2; i <= 10; i++) {
    levelConfigs.push({
      multiplier: i,
      maxMultiplier: i,
      requiredScore: (i - 2) * 30, // 0, 30, 60, 90, 120, 150, 180, 210, 240
      level: i - 1, // levels 1-9 for multipliers 2-10
      description: `Умножение на ${i}`,
      examples: [`${i} × 1 = ${i}`, `${i} × 5 = ${i * 5}`, `${i} × 9 = ${i * 9}`],
      name: `Умножение на ${i}`,
      pointsPerCorrect: i
    });
  }

  // Add all levels with appropriate availability flag
  levelConfigs.forEach(config => {
    levels.push({
      ...config,
      available: totalScore >= config.requiredScore
    });
  });

  return levels;
}