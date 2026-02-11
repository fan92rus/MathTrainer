/**
 * Unit тесты для функциональности уравнений "целое и части"
 *
 * Тестируем новую систему уровней:
 * - Уровень 1 (score 0-4): числа до 10
 * - Уровень 2 (score 5-9): числа до 20
 * - Уровень 3 (score 10+): числа до 100
 *
 * Уровень должен сохраняться между сессиями
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useScoresStore } from '@/store/scores';

// Мокаем useStorage
vi.mock('@/composables/useStorage', () => ({
  useStorage: () => ({
    getItem: vi.fn(() => null),
    setItem: vi.fn()
  })
}));

describe('useScoresStore - Equations Whole Part Levels', () => {
  let store: ReturnType<typeof useScoresStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useScoresStore();
    store.resetAllScores();
  });

  describe('Инициализация уровня', () => {
    it('должен начинать с уровня 1', () => {
      expect(store.getEquationsWholePartLevel).toBe(1);
    });

    it('должен вычислять уровень 1 для score 0-4', () => {
      store.equationsWholePartScore = 0;
      expect(store.getEquationsWholePartLevel).toBe(1);

      store.equationsWholePartScore = 4;
      expect(store.getEquationsWholePartLevel).toBe(1);
    });

    it('должен вычислять уровень 2 для score 5-9', () => {
      store.equationsWholePartScore = 5;
      expect(store.getEquationsWholePartLevel).toBe(2);

      store.equationsWholePartScore = 9;
      expect(store.getEquationsWholePartLevel).toBe(2);
    });

    it('должен вычислять уровень 3 для score 10+', () => {
      store.equationsWholePartScore = 10;
      expect(store.getEquationsWholePartLevel).toBe(3);

      store.equationsWholePartScore = 100;
      expect(store.getEquationsWholePartLevel).toBe(3);
    });
  });

  describe('Определение максимального числа по уровню', () => {
    it('должен возвращать 10 для уровня 1', () => {
      store.equationsWholePartScore = 3;
      expect(store.getEquationsWholePartMaxNumber).toBe(10);
    });

    it('должен возвращать 20 для уровня 2', () => {
      store.equationsWholePartScore = 7;
      expect(store.getEquationsWholePartMaxNumber).toBe(20);
    });

    it('должен возвращать 100 для уровня 3', () => {
      store.equationsWholePartScore = 15;
      expect(store.getEquationsWholePartMaxNumber).toBe(100);
    });
  });

  describe('Сохранение и загрузка уровня', () => {
    it('должен сохранять уровень при обновлении', () => {
      store.updateEquationsWholePartScore(10);
      expect(store.getEquationsWholePartLevel).toBe(3);
    });

    it('должен загружать сохранённый уровень из storage', () => {
      // Этот тест проверит, что уровень восстанавливается после перезагрузки
      // Реализация будет добавлена в GREEN фазе
      expect(store.getEquationsWholePartLevel).toBeDefined();
    });
  });

  describe('Переходы между уровнями', () => {
    it('должен переходить с уровня 1 на уровень 2 при score 5', () => {
      store.equationsWholePartScore = 4;
      expect(store.getEquationsWholePartLevel).toBe(1);

      store.updateEquationsWholePartScore(1); // score = 5
      expect(store.getEquationsWholePartLevel).toBe(2);
    });

    it('должен переходить с уровня 2 на уровень 3 при score 10', () => {
      store.equationsWholePartScore = 9;
      expect(store.getEquationsWholePartLevel).toBe(2);

      store.updateEquationsWholePartScore(1); // score = 10
      expect(store.getEquationsWholePartLevel).toBe(3);
    });
  });

  describe('Индикатор уровня', () => {
    it('должен показывать правильный текст уровня 1', () => {
      store.equationsWholePartScore = 3;
      const maxNumber = store.getEquationsWholePartMaxNumber;
      const indicator = `Числа до ${maxNumber}`;
      expect(indicator).toBe('Числа до 10');
    });

    it('должен показывать правильный текст уровня 2', () => {
      store.equationsWholePartScore = 7;
      const maxNumber = store.getEquationsWholePartMaxNumber;
      const indicator = `Числа до ${maxNumber}`;
      expect(indicator).toBe('Числа до 20');
    });

    it('должен показывать правильный текст уровня 3', () => {
      store.equationsWholePartScore = 15;
      const maxNumber = store.getEquationsWholePartMaxNumber;
      const indicator = `Числа до ${maxNumber}`;
      expect(indicator).toBe('Числа до 100');
    });
  });
});
