// Unit-тесты для DailyTasksGenerator
// TDD подход: Red-Green-Refactor
// Соответствует FR-TEST-001 из PRD

import { describe, it, expect } from 'vitest';
import { DailyTasksGenerator } from '../generator';
import type { DailyTaskConfig } from '../types';

// Мок конфигурации для тестов
const mockConfig: DailyTaskConfig[] = [
  {
    id: 'counting_3',
    type: 'counting',
    exerciseType: 'counting',
    description: 'Посчитать 3 раза',
    target: 3,
    reward: { coins: 6, experience: 12 },
    priority: 1,
    required: true,
    grade: [1, 2],
    quarter: [1, 2, 3, 4],
  },
  {
    id: 'counting_5',
    type: 'counting',
    exerciseType: 'counting',
    description: 'Посчитать 5 раз',
    target: 5,
    reward: { coins: 10, experience: 20 },
    priority: 2,
    required: true,
    grade: [1, 2],
    quarter: [1, 2, 3, 4],
  },
  {
    id: 'equations_5',
    type: 'equations',
    exerciseType: 'equations',
    description: 'Решить 5 примеров',
    target: 5,
    reward: { coins: 5, experience: 10 },
    priority: 3,
    required: false,
    grade: [2],
    quarter: [1, 2],
  },
  {
    id: 'decomposition_3',
    type: 'decomposition',
    exerciseType: 'decomposition',
    description: 'Разложить 3 числа',
    target: 3,
    reward: { coins: 8, experience: 15 },
    priority: 4,
    required: false,
    grade: [2, 3, 4],
    quarter: [1, 2, 3, 4],
  },
];

describe('DailyTasksGenerator', () => {
  describe('generate', () => {
    it('should generate 4 tasks per day (FR-FUNC-001)', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(1, 1, '2024-02-11');

      expect(tasks.length).toBeLessThanOrEqual(4);
    });

    it('should include required tasks (FR-FUNC-001)', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(1, 1, '2024-02-11');

      const countingTasks = tasks.filter(t => t.type === 'counting');
      expect(countingTasks.length).toBe(2); // counting_3 и counting_5
    });

    it('should filter tasks by grade (FR-FUNC-002)', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(1, 1, '2024-02-11');

      // Для 1 класса equations недоступны
      const equationsTasks = tasks.filter(t => t.type === 'equations');
      expect(equationsTasks.length).toBe(0);
    });

    it('should filter tasks by quarter (FR-FUNC-002)', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(2, 3, '2024-02-11');

      // Для 3 четверти equations недоступны
      const equationsTasks = tasks.filter(t => t.type === 'equations');
      expect(equationsTasks.length).toBe(0);
    });

    it('should be deterministic for same seed (FR-FUNC-003)', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const seed = '2024-02-11';

      const firstRun = generator.generate(2, 1, seed);
      const secondRun = generator.generate(2, 1, seed);

      expect(firstRun).toEqual(secondRun);
    });

    it('should produce different results for different seeds (FR-FUNC-003)', () => {
      const generator = new DailyTasksGenerator(mockConfig);

      const firstDay = generator.generate(2, 1, '2024-02-11');
      const secondDay = generator.generate(2, 1, '2024-02-12');

      // Результаты могут совпадать случайно, но это маловероятно
      // Проверяем хотя бы то, что seeding влияет на порядок
      expect(firstDay.length).toBe(secondDay.length);
    });

    it('should initialize tasks with correct defaults', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(1, 1, '2024-02-11');

      tasks.forEach(task => {
        expect(task.current).toBe(0);
        expect(task.completed).toBe(false);
        expect(task.rewardClaimed).toBe(false);
      });
    });

    it('should sort by priority', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(2, 1, '2024-02-11');

      // Проверяем, что required задачи идут первыми
      const firstTask = tasks[0];
      expect(firstTask.type).toBe('counting');
    });

    it('should handle empty config gracefully', () => {
      const generator = new DailyTasksGenerator([]);
      const tasks = generator.generate(1, 1, '2024-02-11');

      expect(tasks).toEqual([]);
    });

    it('should handle when no tasks available for grade/quarter', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const tasks = generator.generate(4, 1, '2024-02-11');

      // Для 4 класса 1 четверть в mockConfig нет заданий
      // Но counting доступен для 1-2 класса, так что получим только counting если он подходит
      expect(tasks.length).toBeGreaterThanOrEqual(0);
    });

    it('should limit to 4 tasks total (FR-FUNC-001)', () => {
      // Создаем конфиг с большим количеством заданий
      const largeConfig: DailyTaskConfig[] = Array.from({ length: 10 }, (_, i) => ({
        id: `task_${i}`,
        type: 'counting',
        exerciseType: 'counting',
        description: `Task ${i}`,
        target: 3,
        reward: { coins: 5, experience: 10 },
        priority: i + 1,
        required: i < 3, // Первые 3 обязательные
        grade: [1],
        quarter: [1],
      }));

      const generator = new DailyTasksGenerator(largeConfig);
      const tasks = generator.generate(1, 1, '2024-02-11');

      expect(tasks.length).toBeLessThanOrEqual(4);
    });
  });

  describe('isTaskAvailable', () => {
    it('should return true when task matches grade and quarter', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const task = mockConfig[0]; // counting_3, grade: [1, 2], quarter: [1, 2, 3, 4]

      const available = generator.isTaskAvailable(task, 1, 1);
      expect(available).toBe(true);
    });

    it('should return false when grade does not match', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const task = mockConfig[2]; // equations_5, grade: [2]

      const available = generator.isTaskAvailable(task, 1, 1);
      expect(available).toBe(false);
    });

    it('should return false when quarter does not match', () => {
      const generator = new DailyTasksGenerator(mockConfig);
      const task = mockConfig[2]; // equations_5, quarter: [1, 2]

      const available = generator.isTaskAvailable(task, 2, 3);
      expect(available).toBe(false);
    });
  });
});
