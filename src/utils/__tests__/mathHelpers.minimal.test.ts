import { shuffleArray, getAvailableMultiplicationLevels } from '../mathHelpers';
import type { MultiplicationLevel } from '../mathHelpers';

describe('Math Helpers  - Minimal Tests', () => {
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

    test('правильно определяет доступность уровней', () => {
      const levels: MultiplicationLevel[] = getAvailableMultiplicationLevels(100);

      const level2 = levels.find((l: MultiplicationLevel) => l.multiplier === 2);
      expect(level2?.available).toBe(true);

      const level3 = levels.find((l: MultiplicationLevel) => l.multiplier === 3);
      expect(level3?.requiredScore).toBe(50);
    });
  });
});