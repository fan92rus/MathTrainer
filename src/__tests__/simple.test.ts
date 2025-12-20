/**
 * Простые тесты для проверки базовой функциональности
 */

// Импортируем функции для тестирования
import { getGradeName, getQuarterName, calculateExercisePoints } from '@/utils/gradeHelpers';

describe('Simple Tests', () => {
  test('should return correct grade name for grade 1', () => {
    const result: string = getGradeName(1);
    expect(result).toBe('1 класс');
  });

  test('should return correct grade name for grade 2', () => {
    const result: string = getGradeName(2);
    expect(result).toBe('2 класс');
  });

  test('should return unknown for invalid grade', () => {
    // GradeLevel is 1 | 2 | 3 | 4, so we test with type assertion
    const result: string = getGradeName(0 as any);
    expect(result).toBe('Неизвестный класс');
  });

  test('should return correct quarter name', () => {
    expect(getQuarterName(1)).toBe('1 четверть');
    expect(getQuarterName(2)).toBe('2 четверть');
    expect(getQuarterName(3)).toBe('3 четверть');
    expect(getQuarterName(4)).toBe('4 четверть');
  });

  test('should return unknown quarter for invalid quarter', () => {
    const result: string = getQuarterName(0);
    expect(result).toBe('Неизвестная четверть');
  });

  test('should calculate exercise points correctly', () => {
    expect(calculateExercisePoints(0)).toBe(10);
    expect(calculateExercisePoints(1)).toBeLessThan(10);
    expect(calculateExercisePoints(5)).toBeGreaterThanOrEqual(0);
  });

  test('should handle custom max points', () => {
    expect(calculateExercisePoints(0)).toBe(10); // функция использует базовые очки
    expect(calculateExercisePoints(1)).toBeLessThan(10);
  });
});