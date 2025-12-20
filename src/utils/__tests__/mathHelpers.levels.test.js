import { getAvailableMultiplicationLevels } from '../mathHelpers.js';

describe('Math Helpers - Multiplication Levels', () => {
  describe('getAvailableMultiplicationLevels', () => {
    test('возвращает правильную структуру уровней', () => {
      const levels = getAvailableMultiplicationLevels(100);

      // Проверяем, что вернулся массив
      expect(Array.isArray(levels)).toBe(true);

      // Проверяем, что каждый уровень имеет необходимые поля
      levels.forEach((level) => {
        expect(level).toHaveProperty('multiplier');
        expect(level).toHaveProperty('requiredScore');
        expect(level).toHaveProperty('available');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('pointsPerCorrect');
      });
    });

    test('правильно определяет доступность уровней', () => {
      const levels = getAvailableMultiplicationLevels(100);

      // Уровень 2 всегда доступен
      const level2 = levels.find((l) => l.multiplier === 2);
      expect(level2.available).toBe(true);

      // Уровень 3 доступен после 50 очков
      const level3 = levels.find((l) => l.multiplier === 3);
      expect(level3.requiredScore).toBe(50);

      // Уровень 4 доступен после 150 очков
      const level4 = levels.find((l) => l.multiplier === 4);
      expect(level4.requiredScore).toBe(150);
    });

    test('правильно определяет количество уровней', () => {
      const levels = getAvailableMultiplicationLevels(100);

      // Должно быть 9 уровней (от 2 до 10)
      expect(levels).toHaveLength(9);
    });
  });
});
