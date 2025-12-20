/**
 * Утилиты для упражнений на разложение чисел
 */

import type { MathProblem, MathOperation } from '@/types';
import { shuffleArray } from '../common';

/**
 * Генерирует правильный вариант для сложения с разложением
 */
function generateAdditionOption(num1: number, num2: number): string {
  // Раскладываем только если есть переход через десяток
  // Проверяем, будет ли переход через десяток при сложении
  const sum = num1 + num2;
  const tensBefore = Math.floor(num1 / 10);
  const tensAfter = Math.floor(sum / 10);

  // Если количество десятков изменилось, значит был переход через десяток
  // Это включает как переход с 9 единиц на следующий десяток, так и переход между десятками
  if (tensAfter > tensBefore) {
    // Есть переход через десяток - раскладываем
    if (num2 <= 9) {
      // Однозначное число - раскладываем чтобы дополнить до круглого десятка
      const lastDigit1 = num1 % 10;
      const neededForRound = 10 - lastDigit1;

      // Проверяем, не будет ли нулевого компонента при разложении
      if (neededForRound === 0 || neededForRound === num2 || num2 - neededForRound === 0) {
        // Если будет нулевой компонент, не раскладываем
        return `${num1} + ${num2}`;
      }

      // Раскладываем, чтобы дополнить до круглого десятка
      const part1 = neededForRound;
      const part2 = num2 - neededForRound;

      return `${num1} + ${part1} + ${part2}`;
    } else {
      // Двузначное число - раскладываем на десятки и единицы
      const tens = Math.floor(num2 / 10) * 10;
      const remainder = num2 - tens;

      // Проверяем, чтобы оба компонента были ненулевыми
      if (tens === 0 || remainder === 0) {
        // Если один из компонентов нулевой, не раскладываем
        return `${num1} + ${num2}`;
      }

      return `${num1} + ${tens} + ${remainder}`;
    }
  } else {
    // Нет перехода через десяток - не раскладываем
    return `${num1} + ${num2}`;
  }
}

/**
 * Генерирует правильный вариант для вычитания с разложением
 */
function generateSubtractionOption(num1: number, num2: number): string {
  const difference = num1 - num2;
  const tensBefore = Math.floor(num1 / 10);
  const tensAfter = Math.floor(difference / 10);

  // Если количество десятков уменьшилось, есть переход через десяток
  if (tensAfter < tensBefore) {
    // Есть переход через десяток - раскладываем
    if (num2 <= 9) {
      // Однозначное второе число
      const lastDigit1 = num1 % 10;

      // Проверяем, не будет ли нулевого компонента при разложении
      if (lastDigit1 === 0 || num2 - lastDigit1 <= 0 || num2 === lastDigit1) {
        // Если будет нулевой компонент, не раскладываем
        return `${num1} - ${num2}`;
      }

      const roundPart = lastDigit1;
      const remainder = num2 - roundPart;

      return `${num1} - ${roundPart} - ${remainder}`;
    } else {
      // Двузначное второе число - раскладываем на десятки и единицы (сначала вычитаем десятки, потом единицы)
      const tens = Math.floor(num2 / 10) * 10;
      const remainder = num2 - tens;

      // Проверяем, чтобы оба компонента были ненулевыми
      if (tens === 0 || remainder === 0) {
        // Если один из компонентов нулевой, не раскладываем
        return `${num1} - ${num2}`;
      }

      return `${num1} - ${tens} - ${remainder}`;
    }
  }

  // Если нет перехода через десяток - не раскладываем
  return `${num1} - ${num2}`;
}

/**
 * Генерирует неправильные варианты для сложения
 */
function generateWrongAdditionOptions(num1: number, num2: number, correctOption: string): string[] {
  const wrongOptions: string[] = [];
  const parts = correctOption.split(' + ');
  const mainNum = parseInt(parts[0]);

  // Стратегия 1: Разделить второе число на неравные части
  if (num2 > 4) {
    // Используем соотношение 30%/70% чтобы избежать нулей
    const part1 = Math.max(1, Math.floor(num2 * 0.3));
    const part2 = num2 - part1;

    // Убеждаемся, что оба компонента положительные и не равны нулю
    if (part1 > 0 && part2 > 0 && part1 !== num2 && part2 !== num2) {
      const option = `${mainNum} + ${part1} + ${part2}`;
      if (option !== correctOption && !wrongOptions.includes(option)) {
        wrongOptions.push(option);
      }
    }
  }

  // Стратегия 2: Если правильный ответ разложен, изменяем пропорции
  if (parts.length === 3) {
    const part1 = parseInt(parts[1]);
    const part2 = parseInt(parts[2]);

    if (part1 > 0 && part2 > 0) {
      const combined = part1 + part2;

      // Создаем новое разложение с соотношением 25%/75%
      const newPart1 = Math.max(1, Math.floor(combined * 0.25));
      const newPart2 = combined - newPart1;

      if (newPart1 > 0 && newPart2 > 0 && newPart1 !== part1 && newPart2 !== part2) {
        const option = `${mainNum} + ${newPart1} + ${newPart2}`;
        if (option !== correctOption && !wrongOptions.includes(option)) {
          wrongOptions.push(option);
        }
      }
    }
  }

  // Стратегия 3: Используем другие числа близкие к правильным
  if (num2 > 2) {
    // Создаем варианты с небольшими изменениями
    for (let offset of [-1, 1, 2]) {
      const modifiedNum2 = num2 + offset;
      if (modifiedNum2 > 0 && modifiedNum2 !== num2) {
        // Проверяем, не создает ли это переход через десяток
        const sum = num1 + modifiedNum2;
        const tensBefore = Math.floor(num1 / 10);
        const tensAfter = Math.floor(sum / 10);

        if (tensAfter === tensBefore || (tensAfter > tensBefore && modifiedNum2 <= 9)) {
          const option = `${num1} + ${modifiedNum2}`;
          if (option !== correctOption && !wrongOptions.includes(option)) {
            wrongOptions.push(option);
            break; // Добавляем только один такой вариант
          }
        }
      }
    }
  }

  // Фильтруем и возвращаем до 3 уникальных вариантов
  let filtered = wrongOptions.filter((opt, index, arr) => arr.indexOf(opt) === index);

  // Если вариантов меньше 3, добавляем простые варианты
  while (filtered.length < 3) {
    const simpleOption = `${num1} + ${num2 + filtered.length + 1}`;
    if (simpleOption !== correctOption && !filtered.includes(simpleOption)) {
      filtered.push(simpleOption);
    }
  }

  return filtered.slice(0, 3);
}

/**
 * Генерирует неправильные варианты для вычитания
 */
export function generateWrongSubtractionOptions(
  num1: number,
  num2: number,
  correctOption: string
): string[] {
  const wrongOptions: string[] = [];

  // Стратегия 1: Использовать неправильный способ разложения
  if (num1 % 10 !== 0 && num2 > 0 && num2 <= 9) {
    const lastDigit = num1 % 10;

    // Попытка разложить неправильно, но избегая нулей
    if (num2 >= lastDigit + 1) {
      const remainder = num2 - lastDigit + 1;
      if (remainder > 0 && remainder !== num2 && lastDigit > 0 && remainder !== lastDigit) {
        wrongOptions.push(`${num1} - ${lastDigit} - ${remainder}`);
      }
    }
  }

  // Стратегия 2: Разложить на десятки иначе (для двузначных чисел)
  if (num2 >= 10) {
    const tens = Math.floor(num2 / 10) * 10;
    const remainder = num2 - tens;
    const lastDigit = num1 % 10;

    // Убеждаемся, что все компоненты ненулевые
    if (tens > 0 && remainder > 0 && tens !== num2) {
      // Изменим способ разложения
      if (lastDigit > remainder && lastDigit - remainder > 0) {
        const newRemainder = lastDigit - remainder;
        if (newRemainder > 0 && newRemainder !== tens) {
          wrongOptions.push(`${num1} - ${newRemainder} - ${tens}`);
        }
      }

      // Также можно изменить порядок
      wrongOptions.push(`${num1} - ${remainder} - ${tens}`);
    }
  }

  // Стратегия 3: Не разложить, если нужно разложить
  if (correctOption.split(' - ').length > 2) {
    const option = `${num1} - ${num2}`;
    if (!wrongOptions.includes(option)) {
      wrongOptions.push(option);
    }
  }

  // Стратегия 4: Разделить на неравные части (для четных чисел)
  if (num2 > 4 && num2 % 2 === 0) {
    // Используем соотношение 40%/60% вместо 50%/50%
    const part1 = Math.max(1, Math.floor(num2 * 0.4));
    const part2 = num2 - part1;
    if (part1 > 0 && part2 > 0 && part1 !== part2) {
      const option = `${num1} - ${part1} - ${part2}`;
      if (!wrongOptions.includes(option)) {
        wrongOptions.push(option);
      }
    }
  }

  // Стратегия 5: Изменить вычитаемое на небольшую величину
  if (num2 > 1) {
    for (let offset of [1, -1, 2]) {
      const modifiedNum2 = num2 + offset;
      if (modifiedNum2 > 0 && modifiedNum2 < num1 && modifiedNum2 !== num2) {
        const option = `${num1} - ${modifiedNum2}`;
        if (!wrongOptions.includes(option)) {
          wrongOptions.push(option);
          break; // Добавляем только один такой вариант
        }
      }
    }
  }

  // Фильтруем и возвращаем до 3 уникальных вариантов
  let filtered = wrongOptions.filter((opt, index, arr) => arr.indexOf(opt) === index);

  // Если вариантов меньше 3, добавляем простые варианты
  while (filtered.length < 3) {
    const simpleOption = `${num1} + ${num2 + filtered.length + 1}`;
    if (simpleOption !== correctOption && !filtered.includes(simpleOption)) {
      filtered.push(simpleOption);
    }
  }

  return filtered.slice(0, 3);
}

/**
 * Генерирует задачу на разложение чисел
 */
export function generateDecompositionProblem(maxNumber: number | null = null): MathProblem {
  // Если maxNumber не указан, используем 99 для двузначных чисел
  const effectiveMax = maxNumber || 99;
  const minNumber = 10; // Минимум 10 для двузначных чисел
  const maxAttempts = 50; // Увеличим количество попыток для нахождения подходящих чисел

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Выбираем операцию
    const isAddition = Math.random() > 0.5;

    let num1: number, num2: number, correctOption: string, wrongOptions: string[];

    if (isAddition) {
      // Генерируем сложение с переходом через десяток
      // Создаем число с последней цифрой > 0
      num1 = Math.floor(Math.random() * (effectiveMax - minNumber)) + minNumber;
      const lastDigit = num1 % 10;

      if (lastDigit === 0) {
        // Если последняя цифра 0, делаем её случайной от 1 до 8
        num1 = Math.floor(num1 / 10) * 10 + Math.floor(Math.random() * 8) + 1;
      }

      // Генерируем num2 такое, чтобы был переход через десяток
      const minNeeded = 10 - (num1 % 10) + 1; // Минимальное число для перехода через десяток
      const maxPossible = Math.min(9, effectiveMax - num1); // Максимальное однозначное число

      if (minNeeded <= maxPossible) {
        num2 = Math.floor(Math.random() * (maxPossible - minNeeded + 1)) + minNeeded;
      } else {
        // Если не можем найти однозначное число, пробуем двузначное
        num2 = Math.floor(Math.random() * 9) + 11; // от 11 до 19
      }

      // Убедимся, что сумма не превышает максимум
      while (num1 + num2 > effectiveMax) {
        num2 = Math.max(1, num2 - 1);
      }

      correctOption = generateAdditionOption(num1, num2);
      wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption);
    } else {
      // Генерируем вычитание с переходом через десяток
      num1 = Math.floor(Math.random() * (effectiveMax - minNumber)) + minNumber;
      const lastDigit = num1 % 10;

      if (lastDigit === 0) {
        // Если последняя цифра 0, делаем её случайной от 1 до 8
        num1 = Math.floor(num1 / 10) * 10 + Math.floor(Math.random() * 8) + 1;
      }

      // Генерируем num2 такое, чтобы был переход через десяток при вычитании
      const maxForTransition = num1 % 10; // Максимальное число для перехода через десяток

      if (maxForTransition > 0) {
        num2 = Math.floor(Math.random() * maxForTransition) + 1;
      } else {
        num2 = Math.floor(Math.random() * (num1 - 11)) + 11; // Двузначное число
      }

      correctOption = generateSubtractionOption(num1, num2);
      wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption);
    }

    // Проверяем, что есть разложение и нет нулей
    const hasDecomposition = correctOption.split(isAddition ? ' + ' : ' - ').length > 2;
    const hasNoZeros = !correctOption.includes('+ 0') && !correctOption.includes(' - 0');
    const wrongOptionsHaveNoZeros = wrongOptions.every(
      opt => !opt.includes('+ 0') && !opt.includes(' - 0')
    );

    if (hasDecomposition && hasNoZeros && wrongOptionsHaveNoZeros) {
      const allOptions = [correctOption, ...wrongOptions];
      const shuffled = shuffleArray(allOptions);
      const correctIndex = shuffled.indexOf(correctOption);
      const operation: MathOperation = isAddition ? 'addition' : 'subtraction';

      return {
        expression: isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`,
        operation,
        num1,
        num2,
        correctAnswer: isAddition ? num1 + num2 : num1 - num2,
        options: shuffled,
        correctIndex,
        difficulty: 2
      };
    }
  }

  // Если не удалось сгенерировать, используем гарантированный пример с переходом через десяток
  const num1 = 19;
  const num2 = 3;
  const correctOption = `${num1} + 1 + 2`;
  const wrongOptions = [`${num1} + 1 + ${num2 + 1}`, `${num1} + 2 + 1`, `${num1} + ${num2}`];
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