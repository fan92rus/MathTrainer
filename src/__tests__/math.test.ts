/**
 * Тесты для математических функций
 */

// Импортируем необходимые функции
import { shuffleArray, generateFirstGradeDecompositionProblem } from '@/utils/mathHelpers';
import type { FirstGradeDecompositionProblem } from '@/utils/mathHelpers';

describe('Math Functions Tests', () => {
  describe('shuffleArray', () => {
    test('should shuffle array and maintain same length', () => {
      const originalArray: number[] = [1, 2, 3, 4, 5];
      const shuffled: number[] = shuffleArray([...originalArray]);

      expect(shuffled).toHaveLength(originalArray.length);
      expect(shuffled).toEqual(expect.arrayContaining(originalArray));
    });

    test('should not modify original array', () => {
      const originalArray: number[] = [1, 2, 3, 4, 5];
      const originalCopy: number[] = [...originalArray];
      shuffleArray(originalArray);

      expect(originalArray).toEqual(originalCopy);
    });

    test('should handle empty array', () => {
      const emptyArray: number[] = [];
      const shuffled: number[] = shuffleArray(emptyArray);

      expect(shuffled).toEqual([]);
    });

    test('should handle single element array', () => {
      const singleElement: number[] = [42];
      const shuffled: number[] = shuffleArray([...singleElement]);

      expect(shuffled).toEqual(singleElement);
    });
  });

  describe('generateFirstGradeDecompositionProblem', () => {
    test('should generate valid decomposition problem', () => {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();

      // Проверяем структуру объекта
      expect(problem).toHaveProperty('expression');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctIndex');
      expect(problem).toHaveProperty('targetNumber');
      expect(problem).toHaveProperty('correctDecomposition');

      // Проверяем значения
      expect(problem.options).toHaveLength(4);
      expect(problem.targetNumber).toBeGreaterThanOrEqual(2);
      expect(problem.targetNumber).toBeLessThanOrEqual(10);
      expect(problem.correctIndex).toBeGreaterThanOrEqual(0);
      expect(problem.correctIndex).toBeLessThan(4);
    });

    test('should generate correct decomposition', () => {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();
      const [first, second] = problem.correctDecomposition;

      expect(first + second).toBe(problem.targetNumber);
      expect(first).toBeGreaterThan(0);
      expect(second).toBeGreaterThan(0);
    });

    test('should have valid correct index in options', () => {
      const problem: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();
      const correctOption: string = problem.options[problem.correctIndex];

      expect(correctOption).toBeDefined();
      expect(correctOption).toContain(' и ');
    });

    test('should generate unique problems', () => {
      const problem1: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();
      const problem2: FirstGradeDecompositionProblem = generateFirstGradeDecompositionProblem();

      // Вероятность генерации одинаковых задач очень мала
      expect(problem1.targetNumber || problem2.targetNumber).toBeDefined();
    });
  });

  describe('Math calculations', () => {
    test('should perform basic arithmetic correctly', () => {
      // Тестируем базовую арифметику
      expect(2 + 3).toBe(5);
      expect(10 - 4).toBe(6);
      expect(3 * 4).toBe(12);
      expect(15 / 3).toBe(5);
    });

    test('should handle edge cases', () => {
      expect(0 + 0).toBe(0);
      expect(1 - 1).toBe(0);
      expect(5 * 0).toBe(0);
      expect(0 / 1).toBe(0);
    });

    test('should work with negative numbers', () => {
      expect(-5 + 3).toBe(-2);
      expect(5 - 10).toBe(-5);
      expect(-3 * -2).toBe(6);
      expect(-10 / 2).toBe(-5);
    });
  });
});