import {
  generateDecompositionProblem,
  generateFirstGradeDecompositionProblem,
  shuffleArray
} from '../math';
import type { MathProblem } from '../math';

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values: number[]): void => {
  let index = 0;
  Math.random = vi.fn(() => values[index++ % values.length]) as any;
};

describe('Math Helpers - Decomposition', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDecompositionProblem', () => {
    test('первое число должно быть не меньше 10', () => {
      mockMathRandom([0.1, 0.1, 0.5]); // Генерируем минимальные значения

      for (let i = 0; i < 10; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);
        const expression = problem.expression;
        const match = expression.match(/(\d+)\s*[+-]\s*(\d+)/);

        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          const largerNum = Math.max(num1, num2);

          expect(largerNum).toBeGreaterThanOrEqual(10);
        }
      }
    });

    test('сложение с переходом через десяток должно раскладываться', () => {
      // Пример: 28 + 5 = 33 (переход с 2 десятков к 3)
      mockMathRandom([0.8, 0.8, 0.9]); // num1=28, num2=25, isAddition=true

      const problem: MathProblem = generateDecompositionProblem(50);
      const expression = problem.expression;
      const correctOption = problem.options[problem.correctIndex];

      // Проверяем, что это сложение
      expect(expression).toContain('+');

      // Проверяем, что есть переход через десяток
      const match = expression.match(/(\d+)\s*\+\s*(\d+)/);
      if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        const sum = num1 + num2;
        const tensBefore = Math.floor(num1 / 10);
        const tensAfter = Math.floor(sum / 10);

        if (tensAfter > tensBefore) {
          // Если есть переход через десяток, должен быть разложенный ответ
          expect(correctOption.split('+').length).toBeGreaterThan(2);
        }
      }
    });

    test('генерируются только задачи с переходом через десяток', () => {
      // Теперь генерируем только задачи, которые требуют разложения
      for (let i = 0; i < 10; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);
        const correctOption = problem.options[problem.correctIndex];

        // Все сгенерированные задачи должны иметь разложение
        if (correctOption.includes('+')) {
          expect(correctOption.split('+').length).toBeGreaterThan(2);
        } else if (correctOption.includes('-')) {
          expect(correctOption.split('-').length).toBeGreaterThan(2);
        }
      }
    });

    test('все сгенерированные задачи должны иметь разложение', () => {
      // Проверяем, что все задачи имеют разложение (и сложение, и вычитание)
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(99);
        const correctOption = problem.options[problem.correctIndex];

        // Все задачи должны быть разложены
        if (problem.expression.includes('+')) {
          expect(correctOption.split('+').length).toBeGreaterThan(2);
        } else if (problem.expression.includes('-')) {
          expect(correctOption.split('-').length).toBeGreaterThan(2);
        }

        // И не содержать нулей
        expect(correctOption).not.toContain('+ 0');
        expect(correctOption).not.toContain(' - 0');
      }
    });

    test('проверка отсутствия нулей в разложении', () => {
      // Генерируем несколько задач и проверяем, что нет нулевых компонентов
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(99);
        const correctOption = problem.options[problem.correctIndex];

        // Правильный ответ не должен содержать нулей
        expect(correctOption).not.toContain('+ 0');
        expect(correctOption).not.toContain(' - 0');

        // Неправильные ответы тоже не должны содержать нулей
        problem.options.forEach((option) => {
          expect(option).not.toContain('+ 0');
          expect(option).not.toContain(' - 0');
        });
      }
    });

    test('двузначное число в сложении должно раскладываться на десятки и единицы', () => {
      // Пример: 22 + 11 = 33 (должно быть 22 + 10 + 1)
      mockMathRandom([0.2, 0.2, 0.5]); // num1=22, num2=11, isAddition=true

      const problem: MathProblem = generateDecompositionProblem(50);
      const correctOption = problem.options[problem.correctIndex];

      // Проверяем, что это сложение с двузначным вторым числом
      const match = problem.expression.match(/(\d+)\s*\+\s*(\d+)/);
      if (match && parseInt(match[2]) >= 10) {
        const num2 = parseInt(match[2]);
        const tens = Math.floor(num2 / 10) * 10;
        const remainder = num2 - tens;

        // Двузначное число должно раскладываться на десятки и единицы
        if (remainder > 0) {
          expect(correctOption).toContain(`${tens}`);
          expect(correctOption).toContain(`${remainder}`);
        }
      }
    });

    test('двузначное число в вычитании должно раскладываться на десятки и единицы', () => {
      // Пример: 69 - 49 = 20 (должно быть 69 - 40 - 9)
      mockMathRandom([0.5, 0.8, 0.2]); // num1=69, num2=49, isAddition=false

      const problem: MathProblem = generateDecompositionProblem(70);
      const correctOption = problem.options[problem.correctIndex];

      // Проверяем, что это вычитание с двузначным вторым числом
      const match = problem.expression.match(/(\d+)\s*-\s*(\d+)/);
      if (match && parseInt(match[2]) >= 10) {
        const num2 = parseInt(match[2]);
        const tens = Math.floor(num2 / 10) * 10;
        const remainder = num2 - tens;

        // Двузначное число должно раскладываться на десятки и единицы
        if (remainder > 0) {
          expect(correctOption).toContain(`${tens}`);
          expect(correctOption).toContain(`${remainder}`);
        }
      }
    });
  });

  describe('Проверка отсутствия нулевых компонентов в разложении', () => {
    test('в разложении сложения не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);
        const correctOption = problem.options[problem.correctIndex];

        // Проверяем, что это сложение
        if (problem.expression.includes('+')) {
          // Если есть разложение, проверяем отсутствие нулевых компонентов
          if (correctOption.split('+').length > 2) {
            const parts = correctOption.split('+').map((part: string) => parseInt(part.trim()));

            // Все компоненты должны быть положительными числами
            parts.forEach((part: number) => {
              expect(part).toBeGreaterThan(0);
            });
          }
        }
      }
    });

    test('в разложении вычитания не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);
        const correctOption = problem.options[problem.correctIndex];

        // Проверяем, что это вычитание
        if (problem.expression.includes('-')) {
          // Если есть разложение, проверяем отсутствие нулевых компонентов
          if (correctOption.split('-').length > 2) {
            const parts = correctOption.split('-').map((part: string) => parseInt(part.trim()));

            // Все компоненты должны быть положительными числами
            parts.forEach((part: number) => {
              expect(part).toBeGreaterThan(0);
            });
          }
        }
      }
    });

    test('в неправильных вариантах разложения сложения не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);

        // Проверяем, что это сложение
        if (problem.expression.includes('+')) {
          // Проверяем все варианты
          problem.options.forEach((option: string) => {
            // Если вариант содержит разложение
            if (option.split('+').length > 2) {
              const parts = option.split('+').map((part: string) => parseInt(part.trim()));

              // Все компоненты должны быть положительными числами
              parts.forEach((part: number) => {
                expect(part).toBeGreaterThan(0);
              });
            }
          });
        }
      }
    });

    test('в неправильных вариантах разложения вычитания не должно быть нулевых компонентов', () => {
      // Прогоняем несколько раз, чтобы проверить разные случаи
      for (let i = 0; i < 20; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);

        // Проверяем, что это вычитание
        if (problem.expression.includes('-')) {
          // Проверяем все варианты
          problem.options.forEach((option: string) => {
            // Если вариант содержит разложение
            if (option.split('-').length > 2) {
              const parts = option.split('-').map((part: string) => parseInt(part.trim()));

              // Все компоненты должны быть положительными числами
              parts.forEach((part: number) => {
                expect(part).toBeGreaterThan(0);
              });
            }
          });
        }
      }
    });
  });

  describe('Неправильные варианты должны содержать разложение', () => {
    test('для сложения с однозначным числом неправильные варианты содержат разложение', () => {
      // Генерируем несколько задач на сложение и проверяем неправильные варианты
      let foundOneDigitAddition = false;

      for (let i = 0; i < 30; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);

        // Ищем сложение с однозначным вторым числом
        const match = problem.expression.match(/(\d+)\s*\+\s*(\d+)/);
        if (!match) continue;

        const num2 = parseInt(match[2]);
        if (num2 <= 9) {
          foundOneDigitAddition = true;

          // Находим неправильные варианты (кроме правильного ответа)
          const wrongOptions = problem.options.filter((_, idx) => idx !== problem.correctIndex);

          // Проверяем, что хотя бы один неправильный вариант разложен
          const hasDecomposedOption = wrongOptions.some(option => option.split('+').length > 2);
          expect(hasDecomposedOption).toBe(true);

          break;
        }
      }

      // Убеждаемся, что нашли хотя бы одну подходящую задачу
      expect(foundOneDigitAddition).toBe(true);
    });

    test('для вычитания с однозначным числом неправильные варианты содержат разложение', () => {
      // Генерируем несколько задач на вычитание и проверяем неправильные варианты
      let foundOneDigitSubtraction = false;

      for (let i = 0; i < 30; i++) {
        const problem: MathProblem = generateDecompositionProblem(50);

        // Ищем вычитание с однозначным вторым числом
        const match = problem.expression.match(/(\d+)\s*-\s*(\d+)/);
        if (!match) continue;

        const num2 = parseInt(match[2]);
        if (num2 <= 9) {
          foundOneDigitSubtraction = true;

          // Находим неправильные варианты (кроме правильного ответа)
          const wrongOptions = problem.options.filter((_, idx) => idx !== problem.correctIndex);

          // Проверяем, что хотя бы один неправильный вариант разложен
          const hasDecomposedOption = wrongOptions.some(option => option.split('-').length > 2);
          expect(hasDecomposedOption).toBe(true);

          break;
        }
      }

      // Убеждаемся, что нашли хотя бы одну подходящую задачу
      expect(foundOneDigitSubtraction).toBe(true);
    });
  });

  describe('Граничные значения и fallback', () => {
    test('работает с минимальным maxNumber', () => {
      // Минимальное значение, при котором возможна генерация
      const problem = generateDecompositionProblem(20, 1);
      expect(problem).toBeDefined();
      expect(problem.expression).toBeDefined();
      expect(problem.options).toBeDefined();
      expect(problem.options.length).toBeGreaterThan(0);
    });

    test('работает с очень большим maxNumber', () => {
      const problem = generateDecompositionProblem(1000, 1);
      expect(problem).toBeDefined();
      expect(problem.correctAnswer).toBeLessThanOrEqual(1000);
    });

    test('работает с null maxNumber (использует 100 по умолчанию)', () => {
      const problem = generateDecompositionProblem(null, 1);
      expect(problem).toBeDefined();
      expect(problem.correctAnswer).toBeLessThanOrEqual(100);
    });

    test('все уровни сложности от 1 до 9 генерируют валидные задачи', () => {
      for (let level = 1; level <= 9; level++) {
        const problem = generateDecompositionProblem(50, level);
        expect(problem).toBeDefined();
        expect(problem.options.length).toBeGreaterThanOrEqual(3);
        expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
        expect(problem.correctIndex).toBeLessThan(problem.options.length);
      }
    });

    test('некорректный уровень использует fallback значение', () => {
      // Level 0 или 10 должны использовать fallback (0.05)
      const problem1 = generateDecompositionProblem(50, 0);
      const problem2 = generateDecompositionProblem(50, 10);
      const problem3 = generateDecompositionProblem(50, -5);

      expect(problem1).toBeDefined();
      expect(problem2).toBeDefined();
      expect(problem3).toBeDefined();
    });
  });

  describe('Корректность вариантов ответов', () => {
    test('неправильные варианты отличаются от правильного варианта', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateDecompositionProblem(50, 3);
        const correctOption = problem.options[problem.correctIndex];

        // Проверяем все неправильные варианты
        for (let j = 0; j < problem.options.length; j++) {
          if (j !== problem.correctIndex) {
            // Неправильный вариант должен отличаться от правильного
            expect(problem.options[j]).not.toBe(correctOption);
          }
        }
      }
    });

    test('все варианты имеют корректный формат выражения', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50, 3);

        for (const option of problem.options) {
          // Формат: число (операция число)*
          // Не должно быть лишних пробелов в начале/конце
          expect(option).toBe(option.trim());
          // Должен содержать хотя бы один оператор
          expect(option).toMatch(/[\+\-\×]/);
          // Не должно быть пустых компонентов
          expect(option).not.toMatch(/[\+\-\×]\s*[\+\-\×]/);
          expect(option).not.toMatch(/[\+\-\×]\s*$/);
        }
      }
    });

    test('разложенные варианты дают правильный результат', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateDecompositionProblem(50, 3);
        const correctOption = problem.options[problem.correctIndex];

        // Правильный вариант должен вычисляться в correctAnswer
        const evaluated = eval(correctOption); // eslint-disable-line no-eval
        expect(evaluated).toBe(problem.correctAnswer);
      }
    });
  });

  describe('Стабильность генерации', () => {
    test('многократная генерация не падает', () => {
      // Генерируем 100 задач подряд - не должно быть ошибок или infinite loops
      for (let i = 0; i < 100; i++) {
        const problem = generateDecompositionProblem(50, Math.floor(Math.random() * 9) + 1);
        expect(problem).toBeDefined();
        expect(problem.options.length).toBeGreaterThanOrEqual(3);
      }
    });

    test('генерирует разнообразные выражения', () => {
      const expressions = new Set<string>();

      // Генерируем задачи с разными maxNumber для разнообразия
      for (let max = 20; max <= 100; max += 10) {
        for (let level = 1; level <= 9; level += 2) {
          const problem = generateDecompositionProblem(max, level);
          expressions.add(problem.expression);
        }
      }

      // Должно быть несколько разных выражений
      expect(expressions.size).toBeGreaterThan(5);
    });
  });

  describe('Влияние уровня сложности', () => {
    test('более высокий уровень даёт больше двузначных вторых чисел', () => {
      const countTwoDigitAtLevel1 = 100;
      const countTwoDigitAtLevel9 = 100;
      let twoDigitAtLevel1 = 0;
      let twoDigitAtLevel9 = 0;

      // Генерируем задачи на уровне 1
      for (let i = 0; i < countTwoDigitAtLevel1; i++) {
        const problem = generateDecompositionProblem(50, 1);
        const match = problem.expression.match(/(\d+)\s*([\+\-])\s*(\d+)/);
        if (match) {
          const num2 = parseInt(match[3]);
          if (num2 >= 10) twoDigitAtLevel1++;
        }
      }

      // Генерируем задачи на уровне 9
      for (let i = 0; i < countTwoDigitAtLevel9; i++) {
        const problem = generateDecompositionProblem(50, 9);
        const match = problem.expression.match(/(\d+)\s*([\+\-])\s*(\d+)/);
        if (match) {
          const num2 = parseInt(match[3]);
          if (num2 >= 10) twoDigitAtLevel9++;
        }
      }

      // На уровне 9 должно быть больше двузначных вторых чисел
      expect(twoDigitAtLevel9).toBeGreaterThan(twoDigitAtLevel1);
    });
  });

  describe('generateFirstGradeDecompositionProblem', () => {
    test('генерирует числа от 2 до 10', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem();
        expect(problem.targetNumber).toBeGreaterThanOrEqual(2);
        expect(problem.targetNumber).toBeLessThanOrEqual(10);
      }
    });

    test('правильное разложение дает в сумме целевое число', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem();
        const [part1, part2] = problem.correctDecomposition;
        expect(part1 + part2).toBe(problem.targetNumber);
      }
    });

    test('варианты ответов содержат правильный ответ', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateFirstGradeDecompositionProblem();
        const correctAnswer = `${problem.correctDecomposition[0]} и ${problem.correctDecomposition[1]}`;
        expect(problem.options).toContain(correctAnswer);
      }
    });
  });

  describe('shuffleArray', () => {
    test('перемешивает массив', () => {
      const originalArray = [1, 2, 3, 4, 5];
      const shuffledArray = shuffleArray(originalArray);

      // Массив должен быть того же размера
      expect(shuffledArray).toHaveLength(originalArray.length);

      // Массив должен содержать те же элементы
      expect(shuffledArray.sort()).toEqual(originalArray.sort());
    });

    test('не изменяет исходный массив', () => {
      const originalArray = [1, 2, 3, 4, 5];
      const originalCopy = [...originalArray];
      shuffleArray(originalArray);

      expect(originalArray).toEqual(originalCopy);
    });
  });
});
