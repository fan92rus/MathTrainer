import { getAvailableMultiplicationLevels } from '../math';
import type { MultiplicationLevel } from '../math';

describe('Math Helpers  - Multiplication Levels', () => {
  describe('getAvailableMultiplicationLevels', () => {
    test('возвращает правильную структуру уровней', () => {
      const levels: MultiplicationLevel[] = getAvailableMultiplicationLevels(100);

      // Проверяем, что вернулся массив
      expect(Array.isArray(levels)).toBe(true);

      // Проверяем, что каждый уровень имеет необходимые поля
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

      // Уровень 2 всегда доступен
      const level2 = levels.find((l: MultiplicationLevel) => l.maxMultiplier === 2);
      expect(level2?.requiredScore).toBe(0);

      // Уровень 3 доступен после 30 очков
      const level3 = levels.find((l: MultiplicationLevel) => l.maxMultiplier === 3);
      expect(level3?.requiredScore).toBe(30);

      // Уровень 4 доступен после 60 очков
      const level4 = levels.find((l: MultiplicationLevel) => l.maxMultiplier === 4);
      expect(level4?.requiredScore).toBe(60);
    });

    test('правильно определяет количество уровней', () => {
      const levels: MultiplicationLevel[] = getAvailableMultiplicationLevels(100);

      // Должно быть 9 уровней (от 2 до 10)
      expect(levels).toHaveLength(9);
    });
  });
});
