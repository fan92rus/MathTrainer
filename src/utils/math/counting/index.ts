/**
 * Утилиты для упражнений на счет (сложение и вычитание)
 */

import type { MathProblem, MathOperation } from '@/types';
import { shuffleArray } from '../common';

/**
 * Генерирует математическую задачу на счет
 * @param currentScore Текущий счет (не используется)
 * @param minNum Минимальное число
 * @param maxNum Максимальное число
 * @returns Объект математической задачи
 */
export function generateCountingProblem(
  currentScore: number,
  minNum: number = 1,
  maxNum: number = 10
): MathProblem {
  // Генерируем числа с учетом ограничений
  let num1: number, num2: number, correctAnswer: number;
  const isAddition = Math.random() > 0.5;

  if (isAddition) {
    // Для сложения генерируем числа так, чтобы сумма не превышала maxNum
    num1 = Math.floor(Math.random() * (maxNum - 1)) + 1;
    // Второе число генерируем с учетом того, чтобы сумма не превышала maxNum
    const maxNum2 = maxNum - num1;
    num2 = Math.floor(Math.random() * Math.max(1, maxNum2)) + 1;
    correctAnswer = num1 + num2;
  } else {
    // Для вычитания генерируем числа так, чтобы первое число было в пределах maxNum
    num1 = Math.floor(Math.random() * (maxNum - 1)) + 1;
    num2 = Math.floor(Math.random() * num1) + 1;
    correctAnswer = num1 - num2;
  }

  // Вычисляем выражение
  const expression = isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`;
  const operation: MathOperation = isAddition ? 'addition' : 'subtraction';

  // Генерируем неправильные варианты ответов
  const wrongAnswers = generateWrongCountingAnswers(correctAnswer, isAddition);

  // Собираем все варианты и перемешиваем
  const allOptions = [correctAnswer, ...wrongAnswers];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(correctAnswer);

  return {
    expression,
    operation,
    num1,
    num2,
    correctAnswer,
    options: shuffled.map(String),
    correctIndex,
    difficulty: 1
  };
}

/**
 * Генерирует неправильные ответы для упражнения на счет
 * @param correctAnswer Правильный ответ
 * @param _isAddition Является ли операция сложением (не используется)
 * @returns Массив неправильных ответов
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateWrongCountingAnswers(
  correctAnswer: number,
  _isAddition: boolean = true
): number[] {
  const wrongAnswers: number[] = [];
  let attempts = 0;
  const maxAttempts = 100; // Защита от бесконечного цикла

  // Проверка на валидность входных данных
  if (isNaN(correctAnswer)) {
    return [1, 2, 3]; // Возвращаем значения по умолчанию
  }

  // Генерируем три неправильных ответа
  while (wrongAnswers.length < 3 && attempts < maxAttempts) {
    attempts++;
    let wrongAnswer: number;

    // Разные стратегии генерации неправильных ответов
    const strategy = Math.floor(Math.random() * 4);

    switch (strategy) {
      case 0: {
        // Ответ близкий к правильному (±1-5)
        const offset = Math.floor(Math.random() * 5) + 1;
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
        break;
      }
      case 1: {
        // Ответ с ошибкой в последней цифре
        const lastDigit = correctAnswer % 10;
        const newLastDigit = (lastDigit + Math.floor(Math.random() * 9) + 1) % 10;
        wrongAnswer = Math.floor(correctAnswer / 10) * 10 + newLastDigit;
        break;
      }
      case 2: {
        // Ответ с ошибкой в десятках (если возможно)
        if (correctAnswer >= 10) {
          const tens = Math.floor(correctAnswer / 10);
          const newTens = Math.max(1, tens + (Math.random() > 0.5 ? 1 : -1));
          wrongAnswer = newTens * 10 + (correctAnswer % 10);
        } else {
          // Для чисел меньше 10 просто добавляем/вычитаем
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 10 : -10);
        }
        break;
      }
      case 3: {
        // Умножение или деление правильного ответа на 2 (если это дает разумный результат)
        if (correctAnswer % 2 === 0 && correctAnswer / 2 > 0) {
          wrongAnswer = correctAnswer / 2;
        } else if (correctAnswer * 2 < 200) {
          wrongAnswer = correctAnswer * 2;
        } else {
          // Fallback: просто добавляем 1
          wrongAnswer = correctAnswer + 1;
        }
        break;
      }
      default: {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) + 1;
        break;
      }
    }

    // Проверяем, что ответ не отрицательный и не дублируется
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