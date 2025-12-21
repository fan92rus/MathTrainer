/**
 * Тесты для генерации уравнений
 */

import { generateEquationProblem } from '../math/equations';

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = jest.fn();
Object.defineProperty(global, 'Math', {
  value: {
    ...Math,
    random: mockMathRandom,
  },
  writable: true,
});

describe('generateEquationProblem', () => {
  beforeEach(() => {
    mockMathRandom.mockClear();
  });

  describe('Простые уравнения (simple)', () => {
    test('должен генерировать уравнение x + a = b с правильным ответом', () => {
      // Мокаем random для выбора типа 'simple' и формы 'x + a = b'
      mockMathRandom
        .mockReturnValueOnce(0.1) // выбор типа simple
        .mockReturnValueOnce(0.8) // выбор формы x + a = b
        .mockReturnValueOnce(0.4) // выбор a = 5 (maxNumber=10, a=4+1=5)
        .mockReturnValueOnce(0.3); // выбор b = a + random(10-a) = 5+2=7

      const problem = generateEquationProblem(25); // score для уровня 2 (maxNumber=20)

      expect(problem.expression).toContain('x +');
      expect(problem.correctAnswer).toBe(2); // 7 - 5 = 2
      expect(problem.equationType).toBe('simple');
      expect(problem.operation).toBe('equation');
    });

    test('должен генерировать уравнение a + x = b с правильным ответом', () => {
      mockMathRandom
        .mockReturnValueOnce(0.1) // выбор типа simple
        .mockReturnValueOnce(0.2) // выбор формы a + x = b
        .mockReturnValueOnce(0.3) // выбор a = 4
        .mockReturnValueOnce(0.5); // выбор b = a + random(10-a) = 4+3=7

      const problem = generateEquationProblem(25);

      expect(problem.expression).toContain('+ x');
      expect(problem.correctAnswer).toBe(3); // 7 - 4 = 3
      expect(problem.equationType).toBe('simple');
    });

    test('должен генерировать 4 варианта ответа', () => {
      mockMathRandom
        .mockReturnValueOnce(0.1) // выбор типа simple
        .mockReturnValueOnce(0.8) // выбор формы
        .mockReturnValueOnce(0.2) // a
        .mockReturnValueOnce(0.3); // b

      const problem = generateEquationProblem(25);

      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(String(problem.correctAnswer));
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });
  });

  describe('Уравнения со скобками (with-parentheses)', () => {
    test('должен генерировать уравнение x + (a - b) = c с правильным ответом', () => {
      mockMathRandom
        .mockReturnValueOnce(0.4) // выбор типа with-parentheses
        .mockReturnValueOnce(0.8) // выбор формы x + (a - b) = c
        .mockReturnValueOnce(0.2) // x = 3
        .mockReturnValueOnce(0.1) // a = 2
        .mockReturnValueOnce(0.3); // b = floor(2 * 0.3) = 0

      const problem = generateEquationProblem(150); // score для уровня 4

      expect(problem.expression).toMatch(/x\s*\+\s*\(\d+\s*-\s*\d+\)\s*=\s*\d+/);
      expect(problem.equationType).toBe('with-parentheses');
      // Проверяем что ответ равен X
      expect(problem.correctAnswer).toBe(3);
    });

    test('должен генерировать уравнение (a + x) - b = c с правильным ответом', () => {
      mockMathRandom
        .mockReturnValueOnce(0.4) // выбор типа with-parentheses
        .mockReturnValueOnce(0.2) // выбор формы (a + x) - b = c
        .mockReturnValueOnce(0.2) // x = 5
        .mockReturnValueOnce(0.1) // a = 2
        .mockReturnValueOnce(0.3); // b = floor(min(10, 7) * 0.3) = 2

      const problem = generateEquationProblem(150);

      expect(problem.expression).toMatch(/\(\d+\s*\+\s*x\)\s*-\s*\d+\s*=\s*\d+/);
      expect(problem.equationType).toBe('with-parentheses');
      expect(problem.correctAnswer).toBe(5);
    });
  });

  describe('Уравнения с умножением (with-multiplication)', () => {
    test('должен генерировать уравнение n × x = result с правильным ответом', () => {
      mockMathRandom
        .mockReturnValueOnce(0.7) // выбор типа with-multiplication
        .mockReturnValueOnce(0.8) // выбор формы n × x = result
        .mockReturnValueOnce(0.2) // multiplier = floor(min(10, 20/10) * 0.2) + 1 = 2
        .mockReturnValueOnce(0.4); // x = floor(10 * 0.4) + 1 = 5

      const problem = generateEquationProblem(250); // score для уровня 6 (maxNumber=100)

      expect(problem.expression).toMatch(/\d+\s*×\s*x\s*=\s*\d+/);
      expect(problem.equationType).toBe('with-multiplication');
      expect(problem.correctAnswer).toBe(5);
    });

    test('должен генерировать уравнение x × n = result с правильным ответом', () => {
      mockMathRandom
        .mockReturnValueOnce(0.7) // выбор типа with-multiplication
        .mockReturnValueOnce(0.2) // выбор формы x × n = result
        .mockReturnValueOnce(0.4) // x = floor(10 * 0.4) + 1 = 5
        .mockReturnValueOnce(0.3); // multiplier = floor(min(10, 100/5) * 0.3) + 1 = 7

      const problem = generateEquationProblem(250);

      expect(problem.expression).toMatch(/x\s*×\s*\d+\s*=\s*\d+/);
      expect(problem.equationType).toBe('with-multiplication');
      expect(problem.correctAnswer).toBe(5);
    });
  });

  describe('Проверка граничных случаев', () => {
    test('должен избегать повторения одного и того же X', () => {
      // Первый вызов
      mockMathRandom
        .mockReturnValueOnce(0.1) // simple
        .mockReturnValueOnce(0.8) // x + a = b
        .mockReturnValueOnce(0.2) // a
        .mockReturnValueOnce(0.3); // b

      const problem1 = generateEquationProblem(25);
      const firstX = problem1.correctAnswer;

      // Второй вызов с тем же X
      mockMathRandom
        .mockReturnValueOnce(0.1) // simple
        .mockReturnValueOnce(0.8) // x + a = b
        .mockReturnValueOnce(0.3) // a (другое значение)
        .mockReturnValueOnce(0.4) // b (другое значение)
        // Продолжаем генерировать пока не получим другой X
        .mockReturnValueOnce(0.4) // новая попытка - другое a
        .mockReturnValueOnce(0.5); // новая попытка - другое b

      const problem2 = generateEquationProblem(25, firstX);

      expect(problem2.correctAnswer).not.toBe(firstX);
    });

    test('должен возвращать валидную структуру problem', () => {
      mockMathRandom.mockReturnValue(0.1);

      const problem = generateEquationProblem(25);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('operation', 'equation');
      expect(problem).toHaveProperty('num1', 0);
      expect(problem).toHaveProperty('num2', 0);
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(problem).toHaveProperty('difficulty');
      expect(problem).toHaveProperty('xValue');
      expect(problem).toHaveProperty('equationType');

      expect(typeof problem.expression).toBe('string');
      expect(typeof problem.correctAnswer).toBe('number');
      expect(Array.isArray(problem.options)).toBe(true);
      expect(typeof problem.correctIndex).toBe('number');
      expect(typeof problem.difficulty).toBe('number');
      expect(problem.options).toHaveLength(4);
    });
  });

  describe('Разные уровни сложности', () => {
    test('должен использовать правильные диапазоны чисел для разных уровней', () => {
      mockMathRandom.mockReturnValue(0.1);

      // Уровень 1 (maxNumber: 10)
      const level1Problem = generateEquationProblem(10);
      expect(level1Problem.correctAnswer).toBeLessThanOrEqual(10);

      // Уровень 5 (maxNumber: 50)
      mockMathRandom.mockReturnValue(0.1);
      const level5Problem = generateEquationProblem(200);
      expect(level5Problem.correctAnswer).toBeLessThanOrEqual(50);

      // Уровень 9 (maxNumber: 200)
      mockMathRandom.mockReturnValue(0.1);
      const level9Problem = generateEquationProblem(500);
      expect(level9Problem.correctAnswer).toBeLessThanOrEqual(200);
    });
  });
});