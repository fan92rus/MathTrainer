import {
  generateDecompositionProblem,
  generateFirstGradeDecompositionProblem,
  generateCountingProblem,
  generateMultiplicationProblem,
  generateWrongCountingAnswers,
  generateWrongSubtractionOptions,
  getAvailableMultiplicationLevels,
  shuffleArray
} from '../mathHelpers';
import type { FirstGradeDecompositionProblem, MultiplicationLevel } from '../mathHelpers';

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values: number[]): void => {
  let index = 0;
  Math.random = jest.fn(() => values[index++ % values.length]);
};

describe('Math Helpers  - Simple Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateDecompositionProblem', () => {
    test('первое число должно быть не меньше 10', () => {
      mockMathRandom([0.1, 0.1, 0.5]); // Генерируем минимальные значения

      const problem = generateDecompositionProblem(50);
      const expression: string = problem.expression;
      const match = expression.match(/(\d+)\s*[+-]\s*(\d+)/);

      if (match) {
        const num1: number = parseInt(match[1]);
        const num2: number = parseInt(match[2]);
        const largerNum: number = Math.max(num1, num2);

        expect(largerNum).toBeGreaterThanOrEqual(10);
      }
    });

    test('генерирует правильную структуру ответа', () => {
      const problem = generateDecompositionProblem(50);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(Array.isArray(problem.options)).toBe(true);
      expect(problem.options.length).toBe(4);
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });
  });

  describe('generateFirstGradeDecompositionProblem', () => {
    test('генерирует числа от 2 до 10', () => {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();
      expect(problem.targetNumber).toBeGreaterThanOrEqual(2);
      expect(problem.targetNumber).toBeLessThanOrEqual(10);
    });

    test('правильное разложение дает в сумме целевое число', () => {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();
      const [part1, part2] = problem.correctDecomposition;
      expect(part1 + part2).toBe(problem.targetNumber);
    });
  });

  describe('generateCountingProblem', () => {
    test('генерирует правильную структуру ответа', () => {
      const problem = generateCountingProblem(100, 1, 20);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(Array.isArray(problem.options)).toBe(true);
      expect(problem.options.length).toBe(4);
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });
  });

  describe('generateMultiplicationProblem', () => {
    test('генерирует правильную структуру ответа', () => {
      const problem = generateMultiplicationProblem(5);

      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(Array.isArray(problem.options)).toBe(true);
      expect(problem.options.length).toBe(4);
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });
  });

  describe('generateWrongCountingAnswers', () => {
    test('генерирует уникальные неправильные ответы', () => {
      const correctAnswer: number = 25;
      const wrongAnswers: number[] = generateWrongCountingAnswers(correctAnswer, true);

      expect(wrongAnswers).toHaveLength(3);
      const uniqueAnswers: number[] = [...new Set(wrongAnswers)];
      expect(uniqueAnswers).toHaveLength(3);
      expect(wrongAnswers).not.toContain(correctAnswer);
    });
  });

  describe('generateWrongSubtractionOptions', () => {
    test('генерирует уникальные неправильные варианты', () => {
      const num1: number = 69;
      const num2: number = 49;
      const correctOption: string = `${num1}  - 40  - 9`;
      const wrongOptions: string[] = generateWrongSubtractionOptions(num1, num2, correctOption);

      expect(wrongOptions).toHaveLength(3);
      const uniqueOptions: string[] = [...new Set(wrongOptions)];
      expect(uniqueOptions).toHaveLength(3);
      expect(wrongOptions).not.toContain(correctOption);
    });
  });

  describe('getAvailableMultiplicationLevels', () => {
    test('возвращает правильную структуру уровней', () => {
      const levels: MultiplicationLevel[] = getAvailableMultiplicationLevels(100);

      expect(Array.isArray(levels)).toBe(true);
      expect(levels.length).toBeGreaterThan(0);

      levels.forEach((level: MultiplicationLevel) => {
        expect(level).toHaveProperty('multiplier');
        expect(level).toHaveProperty('requiredScore');
        expect(level).toHaveProperty('available');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('pointsPerCorrect');
      });
    });
  });

  describe('shuffleArray', () => {
    test('перемешивает массив', () => {
      const originalArray: number[] = [1, 2, 3, 4, 5];
      const shuffledArray: number[] = shuffleArray(originalArray);

      expect(shuffledArray).toHaveLength(originalArray.length);
      expect(shuffledArray.sort()).toEqual(originalArray.sort());
    });

    test('не изменяет исходный массив', () => {
      const originalArray: number[] = [1, 2, 3, 4, 5];
      const originalCopy: number[] = [...originalArray];
      shuffleArray(originalArray);

      expect(originalArray).toEqual(originalCopy);
    });
  });
});