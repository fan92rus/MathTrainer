/**
 * Утилиты для упражнений на уравнения (нахождение X)
 */

import type { MathOperation, EquationsLevelConfig, EquationProblem, NextLevelInfo } from '@/types';
import { shuffleArray } from '../common';

/**
 * Получает конфигурацию уровня на основе счета
 */
export function getEquationsLevelConfig(score: number): EquationsLevelConfig {
  const levelConfigs: Record<number, EquationsLevelConfig> = {
    1: {
      level: 1,
      maxNumber: 10,
      minNumber: 1,
      equationTypes: ['simple'],
      description: 'Простые уравнения (x + a = b)',
      example: 'x + 3 = 7',
      complexity: 1,
      requiredScore: 0
    },
    2: {
      level: 2,
      maxNumber: 20,
      minNumber: 1,
      equationTypes: ['simple'],
      description: 'Уравнения до 20',
      example: 'x + 5 = 12',
      complexity: 1.2,
      requiredScore: 50
    },
    3: {
      level: 3,
      maxNumber: 20,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses'],
      description: 'Уравнения с вычитанием',
      example: 'x - 4 = 8',
      complexity: 1.5,
      requiredScore: 100
    },
    4: {
      level: 4,
      maxNumber: 30,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses'],
      description: 'Сложные уравнения',
      example: '15 + x = 25',
      complexity: 1.8,
      requiredScore: 150
    },
    5: {
      level: 5,
      maxNumber: 50,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses'],
      description: 'Уравнения до 50',
      example: 'x + (12 - 5) = 20',
      complexity: 2,
      requiredScore: 200
    },
    6: {
      level: 6,
      maxNumber: 100,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses', 'with-multiplication'],
      description: 'Уравнения с умножением',
      example: '3 × x = 21',
      complexity: 2.5,
      requiredScore: 250
    },
    7: {
      level: 7,
      maxNumber: 100,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses', 'with-multiplication'],
      description: 'Сложные уравнения',
      example: '2 × (x + 3) = 20',
      complexity: 3,
      requiredScore: 300
    },
    8: {
      level: 8,
      maxNumber: 200,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses', 'with-multiplication'],
      description: 'Продвинутые уравнения',
      example: '4x + 12 = 32',
      complexity: 3.5,
      requiredScore: 350
    },
    9: {
      level: 9,
      maxNumber: 200,
      minNumber: 1,
      equationTypes: ['simple', 'with-parentheses', 'with-multiplication'],
      description: 'Максимальная сложность',
      example: '5x - 15 = 20',
      complexity: 4,
      requiredScore: 400
    }
  };

  // Определяем уровень на основе счета
  let level = 1;
  if (score >= 400) level = 9;
  else if (score >= 350) level = 8;
  else if (score >= 300) level = 7;
  else if (score >= 250) level = 6;
  else if (score >= 200) level = 5;
  else if (score >= 150) level = 4;
  else if (score >= 100) level = 3;
  else if (score >= 50) level = 2;

  return levelConfigs[level];
}

/**
 * Генерирует неправильные ответы для уравнения
 */
function generateWrongEquationAnswers(correctAnswer: number, maxNumber: number): number[] {
  const wrongAnswers: number[] = [];
  let attempts = 0;
  const maxAttempts = 100; // Защита от бесконечного цикла

  // Проверка на валидность входных данных
  if (isNaN(correctAnswer)) {
    return [1, 2, 3]; // Возвращаем значения по умолчанию
  }

  while (wrongAnswers.length < 3 && attempts < maxAttempts) {
    attempts++;
    let wrongAnswer: number;

    // Увеличиваем количество стратегий для уравнений
    const strategy = Math.floor(Math.random() * 5); // Увеличили количество стратегий

    switch (strategy) {
      case 0: {
        // Ответ близкий к правильному (с увеличенным разбросом)
        const offset = Math.floor(Math.random() * 5) + 6; // Увеличили минимальное отклонение
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
        // Ответ с ошибкой в десятках (увеличенный разброс)
        if (correctAnswer >= 10) {
          const tens = Math.floor(correctAnswer / 10);
          // Увеличили разброс десятков
          const newTens = Math.max(1, tens + (Math.random() > 0.5 ? 2 : -2)); // Увеличили разброс
          wrongAnswer = newTens * 10 + (correctAnswer % 10);
        } else {
          // Для чисел меньше 10 просто добавляем/вычитаем
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 10 : -10);
        }
        break;
      }
      case 3: {
        // Ответ в заданном диапазоне (расширенный)
        const minRange = Math.max(0, correctAnswer - 20);
        const maxRange = Math.min(maxNumber, correctAnswer + 20);
        wrongAnswer = Math.floor(Math.random() * (maxRange - minRange)) + minRange;
        break;
      }
      case 4: {
        // Ответ от половины или двойного правильного
        if (correctAnswer % 2 === 0 && correctAnswer / 2 > 0) {
          wrongAnswer = correctAnswer / 2;
        } else if (correctAnswer * 2 <= maxNumber) {
          wrongAnswer = correctAnswer * 2;
        } else {
          // Fallback: добавляем случайное число
          const fallbackAnswer = Math.floor(Math.random() * maxNumber);
          wrongAnswer = fallbackAnswer;
        }
        break;
      }
      default: {
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 15) + 1;
        break;
      }
    }

    // Проверяем, что ответ в допустимых пределах и не дублируется
    if (
      wrongAnswer >= 0 &&
      wrongAnswer <= maxNumber &&
      !wrongAnswers.includes(wrongAnswer) &&
      wrongAnswer !== correctAnswer
    ) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // Если не удалось сгенерировать 3 уникальных ответа, добавляем запасные
  while (wrongAnswers.length < 3) {
    const fallbackAnswer = Math.floor(Math.random() * maxNumber);
    if (!wrongAnswers.includes(fallbackAnswer) && fallbackAnswer !== correctAnswer) {
      wrongAnswers.push(fallbackAnswer);
    }
  }

  return wrongAnswers.slice(0, 3);
}

/**
 * Генерирует уравнение для поиска X
 */
export function generateEquationProblem(
  currentScore: number,
  previousX: number | null = null
): EquationProblem {
  // Получаем конфигурацию уровня на основе текущего счета
  const levelConfig = getEquationsLevelConfig(currentScore);

  // Выбираем случайный тип уравнения из доступных для этого уровня
  const equationType =
    levelConfig.equationTypes[
      Math.floor(Math.random() * levelConfig.equationTypes.length)
    ];

  let expression: string;
  let correctAnswer: number;
  let attempts = 0;
  const maxAttempts = 10; // Максимальное количество попыток для генерации уникального X

  do {
    attempts++;
    let x: number, a: number, b: number;

    switch (equationType) {
      case 'simple':
        if (Math.random() > 0.5) {
          // x + a = b
          a = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
          b = Math.floor(Math.random() * (levelConfig.maxNumber - a)) + a;
          x = b - a;
          expression = `x + ${a} = ${b}`;
        } else {
          // a + x = b
          a = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
          b = Math.floor(Math.random() * (levelConfig.maxNumber - a)) + a;
          x = b - a;
          expression = `${a} + x = ${b}`;
        }
        break;

      case 'with-parentheses':
        if (Math.random() > 0.5) {
          // x + (a - b) = c
          x = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
          a = Math.floor(Math.random() * Math.min(10, x)) + 1;
          b = Math.floor(Math.random() * a);
          const parentheses = a - b;
          const c = x + parentheses;
          expression = `x + (${a} - ${b}) = ${c}`;
        } else {
          // (a + x) - b = c
          x = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
          a = Math.floor(Math.random() * Math.min(10, x)) + 1;
          const parentheses = a + x;
          b = Math.floor(Math.random() * Math.min(10, parentheses));
          const c = parentheses - b;
          expression = `(${a} + x) - ${b} = ${c}`;
        }
        correctAnswer = x;
        break;

      case 'with-multiplication':
        if (Math.random() > 0.5) {
          // n × x = result
          const multiplier = Math.floor(Math.random() * Math.min(10, levelConfig.maxNumber / 10)) + 1;
          x = Math.floor(Math.random() * 10) + 1;
          const result = multiplier * x;
          expression = `${multiplier} × x = ${result}`;
        } else {
          // x × n = result
          x = Math.floor(Math.random() * 10) + 1;
          const multiplier = Math.floor(Math.random() * Math.min(10, levelConfig.maxNumber / x)) + 1;
          const result = x * multiplier;
          expression = `x × ${multiplier} = ${result}`;
        }
        correctAnswer = x;
        break;

      default:
        // Простой fallback
        x = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
        const defaultA = Math.floor(Math.random() * (levelConfig.maxNumber - 1)) + 1;
        const defaultB = Math.floor(Math.random() * (levelConfig.maxNumber - defaultA)) + defaultA;
        expression = `x + ${defaultA} = ${defaultB}`;
        correctAnswer = defaultB - defaultA;
    }

    // Извлекаем значение X из выражения для возврата
    const xMatch = expression.match(/x\s*[+\-×]\s*(\d+)|(\d+)\s*[+\-×]\s*x/);
    if (xMatch) {
      const extractedX = xMatch[1] || xMatch[2];
      correctAnswer = parseInt(extractedX);
    } else {
      // Если не удалось извлечь, используем сохраненное значение
      correctAnswer = x;
    }

    // Увеличиваем количество попыток
    if (attempts >= maxAttempts) {
      break;
    }
  } while (previousX !== null && correctAnswer === previousX && attempts < maxAttempts * 2);

  const wrongAnswers = generateWrongEquationAnswers(correctAnswer, levelConfig.maxNumber);

  // Собираем все варианты и перемешиваем
  const allOptions = [correctAnswer, ...wrongAnswers];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(correctAnswer);

  return {
    expression,
    operation: 'equation',
    num1: 0, // Не используется для уравнений
    num2: 0, // Не используется для уравнений
    correctAnswer,
    options: shuffled.map(String),
    correctIndex,
    difficulty: levelConfig.complexity,
    xValue: correctAnswer, // Добавляем значение X для отслеживания
    equationType
  };
}

/**
 * Получает информацию о следующем уровне
 */
export function getNextEquationsLevel(currentScore: number): NextLevelInfo | null {
  const currentLevel = getEquationsLevelConfig(currentScore).level;
  const nextLevel = currentLevel < 9 ? currentLevel + 1 : null;

  if (!nextLevel) {
    return null;
  }

  const nextLevelConfig = getEquationsLevelConfig((nextLevel - 1) * 50 + 1);

  return {
    currentLevel,
    nextLevel,
    scoreNeeded: nextLevelConfig.requiredScore,
    nextLevelConfig
  };
}

/**
 * Возвращает все доступные уровни
 */
export function getAllEquationsLevels(): Array<{
  level: number;
  description: string;
  requiredScore: number;
}> {
  const levels = [];
  for (let i = 1; i <= 9; i++) {
    const config = getEquationsLevelConfig((i - 1) * 50);
    levels.push({
      level: i,
      description: config.description,
      requiredScore: config.requiredScore
    });
  }
  return levels;
}