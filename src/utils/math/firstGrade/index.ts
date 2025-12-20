/**
 * Утилиты для упражнений на разложение чисел (первый класс)
 */

import type { FirstGradeDecompositionProblem } from '@/types';
import { shuffleArray } from '../common';

/**
 * Генерирует задачу на разложение чисел для первого класса
 */
export function generateFirstGradeDecompositionProblem(): FirstGradeDecompositionProblem {
  // Генерируем целевое число от 2 до 10
  const targetNumber = Math.floor(Math.random() * 9) + 2;

  // Генерируем случайное разложение
  const firstPart = Math.floor(Math.random() * (targetNumber - 1)) + 1;
  const secondPart = targetNumber - firstPart;

  const correctOption = `${firstPart} и ${secondPart}`;

  // Генерируем неправильные варианты
  const wrongOptions = generateWrongOptions(targetNumber, firstPart, secondPart);

  // Собираем все варианты и перемешиваем
  const allOptions = [correctOption, ...wrongOptions];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(correctOption);

  return {
    expression: `${targetNumber}`,
    targetNumber,
    correctDecomposition: [firstPart, secondPart],
    options: shuffled,
    correctIndex
  };
}

/**
 * Генерирует неправильные варианты для разложения числа
 */
function generateWrongOptions(
  targetNumber: number,
  correctFirstPart: number,
  correctSecondPart: number
): string[] {
  const wrongOptions: string[] = [];
  const _maxAttempts = 10;

  // Проверяет, что вариант еще не добавлен
  const isNotAlreadyAdded = (part1: number, part2: number): boolean => {
    const option = `${part1} и ${part2}`;
    return (
      !wrongOptions.includes(option) && option !== `${correctFirstPart} и ${correctSecondPart}`
    );
  };

  // Стратегия 1: Неправильная сумма (больше)
  const wrongSum1 = Math.min(targetNumber + Math.floor(Math.random() * 3) + 1, 10);
  const part1_1 = Math.floor(Math.random() * (wrongSum1 - 1)) + 1;
  const part2_1 = wrongSum1 - part1_1;
  if (isNotAlreadyAdded(part1_1, part2_1) && part1_1 > 0 && part2_1 > 0) {
    wrongOptions.push(`${part1_1} и ${part2_1}`);
  }

  // Стратегия 2: Неправильная сумма (меньше)
  if (targetNumber > 3) {
    const wrongSum2 = Math.max(targetNumber - Math.floor(Math.random() * 3) - 1, 2);
    const part1_2 = Math.floor(Math.random() * (wrongSum2 - 1)) + 1;
    const part2_2 = wrongSum2 - part1_2;
    if (isNotAlreadyAdded(part1_2, part2_2) && part1_2 > 0 && part2_2 > 0) {
      wrongOptions.push(`${part1_2} и ${part2_2}`);
    }
  }

  // Стратегия 3: Сохраняем правильную сумму, но меняем части
  if (wrongOptions.length < 3) {
    const part1_3 = Math.floor(Math.random() * (targetNumber - 1)) + 1;
    const part2_3 = targetNumber - part1_3;
    if (isNotAlreadyAdded(part1_3, part2_3) && part1_3 > 0 && part2_3 > 0) {
      wrongOptions.push(`${part1_3} и ${part2_3}`);
    }
  }

  // Если все еще не хватает вариантов, добавляем случайные
  const maxFallbackAttempts = 20;
  for (let i = 0; i < maxFallbackAttempts && wrongOptions.length < 3; i++) {
    const part1 = Math.floor(Math.random() * 9) + 1;
    const part2 = Math.floor(Math.random() * 9) + 1;

    if (part1 + part2 === targetNumber && isNotAlreadyAdded(part1, part2)) {
      wrongOptions.push(`${part1} и ${part2}`);
    }
  }

  // Убедимся, что у нас ровно 3 варианта
  while (wrongOptions.length < 3) {
    const randomNum = Math.floor(Math.random() * targetNumber);
    wrongOptions.push(`${randomNum} и ${targetNumber - randomNum}`);
  }

  return wrongOptions.slice(0, 3);
}
