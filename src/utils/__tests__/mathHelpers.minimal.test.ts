import { shuffleArray, getAvailableMultiplicationLevels } from '../math';
import type { MultiplicationLevel } from '../math';

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
        expect(level).toHaveProperty('maxMultiplier');
        expect(level).toHaveProperty('requiredScore');
        expect(level).toHaveProperty('level');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('examples');
      });
    });

    test('правильно определяет доступность уровней', () => {
      const levels: MultiplicationLevel[] = getAvailableMultiplicationLevels(100);

      const level2 = levels.find((l: MultiplicationLevel) => l.maxMultiplier === 2);
      expect(level2?.requiredScore).toBe(0);

      const level3 = levels.find((l: MultiplicationLevel) => l.maxMultiplier === 3);
      expect(level3?.requiredScore).toBe(30);
    });
  });
});