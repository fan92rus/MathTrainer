/**
 * Утилиты для упражнений на разложение чисел
 * Конвейерный подход: детерминированная генерация без циклов с проверками
 */

import type { MathProblem, MathOperation } from '@/types';
import { shuffleArray } from '../common';

// Вспомогательная функция для генерации случайного числа в диапазоне
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


// Типы для разложения
interface DecompositionResult {
  num1: number;
  num2: number;
  expression: string;
  correctOption: string;
  wrongOptions: string[];
}

/**
 * Конвейер для сложения: детерминированно генерирует числа с переходом через десяток
 */
function generateAdditionPipeline(maxNumber: number, twoDigitProbability: number): DecompositionResult | null {
  // Шаг 1: Генерируем первое число (с единицами от 1 до 8)
  const tens1 = randomInt(1, Math.floor(maxNumber / 10) - 1);
  const ones1 = randomInt(1, 8);
  const num1 = tens1 * 10 + ones1;

  // Шаг 2: Решаем, будет ли второе число двузначным
  const useTwoDigit = Math.random() < twoDigitProbability;

  let num2: number;

  if (useTwoDigit) {
    // Двузначное число: сумма не должна превышать maxNumber
    const maxTwoDigit = Math.min(99, maxNumber - num1 - 1);
    if (maxTwoDigit < 11) {
      return null; // Не можем создать двузначное число
    }
    num2 = randomInt(11, maxTwoDigit);
  } else {
    // Однозначное число: гарантируем переход через десяток
    const needed = 10 - ones1; // сколько нужно до круглого десятка
    if (needed >= 9) {
      return null; // Не можем создать подходящее число
    }
    num2 = randomInt(needed + 1, 9);
  }

  // Проверяем сумму
  if (num1 + num2 > maxNumber) {
    return null;
  }

  // Шаг 3: Строим правильный вариант
  const correctOption = buildCorrectAdditionOption(num1, num2);

  // Шаг 4: Строим неправильные варианты
  const wrongOptions = buildWrongAdditionOptions(num1, num2, correctOption);

  return {
    num1,
    num2,
    expression: `${num1} + ${num2}`,
    correctOption,
    wrongOptions
  };
}

/**
 * Строит правильный вариант для сложения (без проверок - данные уже валидны)
 */
function buildCorrectAdditionOption(num1: number, num2: number): string {
  if (num2 <= 9) {
    // Однозначное - дополняем до круглого десятка
    const ones1 = num1 % 10;
    const needed = 10 - ones1;
    return `${num1} + ${needed} + ${num2 - needed}`;
  } else {
    // Двузначное - раскладываем на десятки и единицы
    const tens = Math.floor(num2 / 10) * 10;
    const remainder = num2 - tens;
    return `${num1} + ${tens} + ${remainder}`;
  }
}

/**
 * Строит неправильные варианты для сложения (детерминированно)
 * Гарантирует наличие вариантов с разложением (с переходом через десяток)
 */
function buildWrongAdditionOptions(num1: number, num2: number, correctOption: string): string[] {
  const wrongOptions: string[] = [];

  if (num2 <= 9) {
    // Для однозначного числа генерируем разложенные варианты с неправильной точкой перехода
    const ones1 = num1 % 10;
    const needed = 10 - ones1;

    // Стратегия 1: Сдвиг точки разложения в меньшую сторону
    if (needed > 1) {
      const newPart1 = needed - 1;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} + ${newPart1} + ${newPart2}`);
      }
    }

    // Стратегия 2: Сдвиг точки разложения в большую сторону
    if (needed < num2 - 1) {
      const newPart1 = needed + 1;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} + ${newPart1} + ${newPart2}`);
      }
    }

    // Стратегия 3: Двойной сдвиг
    if (needed > 2 && num2 >= needed + 2) {
      const newPart1 = needed - 2;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} + ${newPart1} + ${newPart2}`);
      }
    }

    // Стратегия 4: Не раскладывать (для разнообразия)
    wrongOptions.push(`${num1} + ${num2}`);

  } else {
    // Для двузначного числа генерируем варианты с разложением
    const tens = Math.floor(num2 / 10) * 10;
    const remainder = num2 - tens;

    // Стратегия 1: Перенести часть единиц в десятки
    if (remainder > 0 && remainder < 9 && tens > 0) {
      wrongOptions.push(`${num1} + ${tens - 10} + ${remainder + 10}`);
    }

    // Стратегия 2: Изменить точку между десятками и единицами
    if (remainder > 1) {
      wrongOptions.push(`${num1} + ${tens} + ${remainder - 1} + 1`);
    }

    // Стратегия 3: Другое распределение единиц
    if (remainder >= 2) {
      wrongOptions.push(`${num1} + ${tens} + 1 + ${remainder - 1}`);
    }

    // Стратегия 4: Не раскладывать
    wrongOptions.push(`${num1} + ${num2}`);
  }

  // Фильтруем дубликаты и правильный ответ
  const unique = [...new Set(wrongOptions)].filter(x => x !== correctOption);

  // Если меньше 3 вариантов, добавляем fallback-варианты
  const result = [...unique];
  for (const offset of [-2, -1, 1, 2, 3]) {
    if (result.length >= 3) break;
    const modifiedNum2 = num2 + offset;
    if (modifiedNum2 > 0 && modifiedNum2 !== num2) {
      // Для fallback тоже пробуем создать разложенный вариант
      const option = num2 <= 9
        ? `${num1} + ${modifiedNum2}`
        : `${num1} + ${Math.floor(modifiedNum2 / 10) * 10} + ${modifiedNum2 % 10}`;
      if (option !== correctOption && !result.includes(option)) {
        result.push(option);
      }
    }
  }

  return result.slice(0, 3);
}

/**
 * Конвейер для вычитания: детерминированно генерирует числа с переходом через десяток
 */
function generateSubtractionPipeline(maxNumber: number, twoDigitProbability: number): DecompositionResult | null {
  // Шаг 1: Генерируем первое число
  const tens1 = randomInt(1, Math.floor(maxNumber / 10) - 1);
  const ones1 = randomInt(1, 8);
  const num1 = tens1 * 10 + ones1;

  // Шаг 2: Решаем, будет ли второе число двузначным
  const useTwoDigit = Math.random() < twoDigitProbability;

  let num2: number;

  if (useTwoDigit) {
    // Двузначное: должно быть меньше num1
    const maxTwoDigit = num1 - 1;
    if (maxTwoDigit < 11) {
      return null;
    }
    num2 = randomInt(11, maxTwoDigit);
  } else {
    // Однозначное: гарантируем переход через десяток (вычитаем больше чем единиц)
    const maxPossible = Math.min(9, num1 - 1);
    if (ones1 >= maxPossible) {
      return null; // Не будет перехода через десяток
    }
    num2 = randomInt(ones1 + 1, maxPossible);
  }

  // Шаг 3: Строим правильный вариант
  const correctOption = buildCorrectSubtractionOption(num1, num2);

  // Шаг 4: Строим неправильные варианты
  const wrongOptions = buildWrongSubtractionOptions(num1, num2, correctOption);

  return {
    num1,
    num2,
    expression: `${num1} - ${num2}`,
    correctOption,
    wrongOptions
  };
}

/**
 * Строит правильный вариант для вычитания (без проверок)
 */
function buildCorrectSubtractionOption(num1: number, num2: number): string {
  if (num2 <= 9) {
    const ones1 = num1 % 10;
    return `${num1} - ${ones1} - ${num2 - ones1}`;
  } else {
    const tens = Math.floor(num2 / 10) * 10;
    const remainder = num2 - tens;
    return `${num1} - ${tens} - ${remainder}`;
  }
}

/**
 * Строит неправильные варианты для вычитания (детерминированно)
 * Гарантирует наличие вариантов с разложением (с переходом через десяток)
 */
function buildWrongSubtractionOptions(num1: number, num2: number, correctOption: string): string[] {
  const wrongOptions: string[] = [];

  if (num2 <= 9) {
    // Для однозначного числа генерируем разложенные варианты с неправильной точкой перехода
    const ones1 = num1 % 10;

    // Стратегия 1: Сдвиг точки разложения в меньшую сторону
    if (ones1 > 1 && num2 > ones1) {
      const newPart1 = ones1 - 1;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} - ${newPart1} - ${newPart2}`);
      }
    }

    // Стратегия 2: Сдвиг точки разложения в большую сторону
    if (ones1 < num2 - 1) {
      const newPart1 = ones1 + 1;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} - ${newPart1} - ${newPart2}`);
      }
    }

    // Стратегия 3: Двойной сдвиг
    if (ones1 > 2 && num2 > ones1 + 1) {
      const newPart1 = ones1 - 2;
      const newPart2 = num2 - newPart1;
      if (newPart2 > 0) {
        wrongOptions.push(`${num1} - ${newPart1} - ${newPart2}`);
      }
    }

    // Стратегия 4: Для граничных случаев - другой способ разложения
    // Если основные стратегии не сработали, добавляем альтернативные варианты
    if (wrongOptions.length < 2) {
      if (ones1 >= 2 && num2 > ones1) {
        // 4a: Разложить через другой первый компонент
        const newPart1 = ones1 - 1;
        const newPart2 = num2 - newPart1;
        if (newPart2 > 0 && newPart2 !== num2 - ones1) {
          wrongOptions.push(`${num1} - ${newPart1} - ${newPart2}`);
        }
      }
      if (ones1 <= num2 - 2) {
        // 4b: Разложить через больший первый компонент
        const newPart1 = ones1 + 2;
        const newPart2 = num2 - newPart1;
        if (newPart2 > 0 && newPart2 !== num2 - ones1) {
          wrongOptions.push(`${num1} - ${newPart1} - ${newPart2}`);
        }
      }
    }

    // Стратегия 5: Не раскладывать
    wrongOptions.push(`${num1} - ${num2}`);

  } else {
    // Для двузначного числа генерируем варианты с разложением
    const tens = Math.floor(num2 / 10) * 10;
    const remainder = num2 - tens;

    // Стратегия 1: Изменить порядок вычитания (сначала десятки, потом единицы)
    if (remainder > 0) {
      wrongOptions.push(`${num1} - ${remainder} - ${tens}`);
    }

    // Стратегия 2: Перенести часть единиц в десятки
    if (remainder > 0 && remainder < 9 && tens >= 20) {
      wrongOptions.push(`${num1} - ${tens - 10} - ${remainder + 10}`);
    }

    // Стратегия 3: Изменить распределение единиц
    if (remainder >= 2) {
      wrongOptions.push(`${num1} - ${tens} - 1 - ${remainder - 1}`);
    }

    // Стратегия 4: Не раскладывать
    wrongOptions.push(`${num1} - ${num2}`);
  }

  // Фильтруем и дополняем
  const unique = [...new Set(wrongOptions)].filter(x => x !== correctOption);
  const result = [...unique];

  // Если меньше 3, добавляем fallback-варианты
  for (const offset of [-2, -1, 1, 2, 3]) {
    if (result.length >= 3) break;
    const modifiedNum2 = num2 + offset;
    if (modifiedNum2 > 0 && modifiedNum2 < num1 && modifiedNum2 !== num2) {
      // Для fallback тоже пробуем создать разложенный вариант
      const option = num2 <= 9
        ? `${num1} - ${modifiedNum2}`
        : `${num1} - ${Math.floor(modifiedNum2 / 10) * 10} - ${modifiedNum2 % 10}`;
      if (option !== correctOption && !result.includes(option)) {
        result.push(option);
      }
    }
  }

  return result.slice(0, 3);
}

/**
 * Генерирует неправильные варианты для сложения
 * Экспортируется для использования в тестах
 */
export function generateWrongAdditionOptions(num1: number, num2: number, correctOption: string): string[] {
  return buildWrongAdditionOptions(num1, num2, correctOption);
}

/**
 * Генерирует неправильные варианты для вычитания
 * Экспортируется для использования в тестах
 */
export function generateWrongSubtractionOptions(num1: number, num2: number, correctOption: string): string[] {
  return buildWrongSubtractionOptions(num1, num2, correctOption);
}

/**
 * Генерирует задачу на разложение чисел
 * @param maxNumber - максимальное число (по умолчанию 100)
 * @param level - уровень сложности (1-9), влияет на вероятность двузначного второго числа
 */
export function generateDecompositionProblem(
  maxNumber: number | null = null,
  level: number = 1
): MathProblem {
  const effectiveMax = maxNumber || 100;

  // Вероятность двузначного второго числа на основе уровня
  const twoDigitProbabilities: Record<number, number> = {
    1: 0.05,
    2: 0.1,
    3: 0.15,
    4: 0.2,
    5: 0.25,
    6: 0.35,
    7: 0.45,
    8: 0.55,
    9: 0.65
  };
  const twoDigitProbability = twoDigitProbabilities[level] || 0.05;

  // Пробуем генерировать (максимум несколько попыток для разнообразия)
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const isAddition = Math.random() > 0.5;

    let result: DecompositionResult | null;

    if (isAddition) {
      result = generateAdditionPipeline(effectiveMax, twoDigitProbability);
    } else {
      result = generateSubtractionPipeline(effectiveMax, twoDigitProbability);
    }

    if (result) {
      // Проверяем отсутствие нулей (единственная оставшаяся проверка)
      const allOptions = [result.correctOption, ...result.wrongOptions];
      const hasNoZeros = allOptions.every(
        opt => !opt.includes('+ 0') && !opt.includes(' - 0')
      );

      if (hasNoZeros) {
        const shuffled = shuffleArray(allOptions);
        const correctIndex = shuffled.indexOf(result.correctOption);
        const operation: MathOperation = isAddition ? 'addition' : 'subtraction';

        return {
          expression: result.expression,
          operation,
          num1: result.num1,
          num2: result.num2,
          correctAnswer: isAddition ? result.num1 + result.num2 : result.num1 - result.num2,
          options: shuffled,
          correctIndex,
          difficulty: 2
        };
      }
    }
  }

  // Fallback - гарантированно рабочий пример
  const num1 = 19;
  const num2 = 3;
  const correctOption = `${num1} + 1 + 2`;
  const wrongOptions = [`${num1} + 2 + 1`, `${num1} + 3`, `${num1} + 2 + 2`];
  const allOptions = [correctOption, ...wrongOptions];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(correctOption);

  return {
    expression: `${num1} + ${num2}`,
    operation: 'addition',
    num1,
    num2,
    correctAnswer: num1 + num2,
    options: shuffled,
    correctIndex,
    difficulty: 2
  };
}
