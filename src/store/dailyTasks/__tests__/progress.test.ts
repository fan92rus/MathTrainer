// Unit-тесты для DailyTasksProgress
// TDD подход: Red-Green-Refactor
// Соответствует FR-TEST-002 из PRD

import { describe, it, expect } from 'vitest';
import { DailyTasksProgress } from '../progress';
import type { DailyTask, DailyTaskType } from '../types';

describe('DailyTasksProgress', () => {
  describe('update', () => {
    const createMockTask = (id: string, type: DailyTaskType, target: number, current: number = 0, completed: boolean = false): DailyTask => ({
      id,
      type,
      description: `Task ${id}`,
      target,
      current,
      reward: { coins: 10, experience: 20 },
      completed,
      rewardClaimed: false,
    });

    it('should update task progress by exercise type (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
        createMockTask('counting_5', 'counting', 5),
        createMockTask('equations_5', 'equations', 5),
      ];

      const result = progress.update(tasks, 'counting', 1);
      const updated = result.tasks;

      const countingTasks = updated.filter(t => t.type === 'counting');
      countingTasks.forEach(task => {
        expect(task.current).toBe(1);
      });

      const equationsTasks = updated.filter(t => t.type === 'equations');
      equationsTasks.forEach(task => {
        expect(task.current).toBe(0);
      });
    });

    it('should not exceed target value (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
      ];

      const result = progress.update(tasks, 'counting', 10);
      const updated = result.tasks;

      expect(updated[0].current).toBe(3);
      expect(updated[0].current).not.toBeGreaterThan(updated[0].target);
    });

    it('should mark task as completed when target reached (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3, 2), // Нужно еще 1
      ];

      const result = progress.update(tasks, 'counting', 1);
      const updated = result.tasks;

      expect(updated[0].current).toBe(3);
      expect(updated[0].completed).toBe(true);
    });

    it('should not update completed tasks (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3, 3, true), // Уже завершено
      ];

      const result = progress.update(tasks, 'counting', 1);
      const updated = result.tasks;

      expect(updated[0].current).toBe(3); // Не изменилось
      expect(updated[0].completed).toBe(true);
    });

    it('should return newly completed tasks for reward granting', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3, 2), // Будет завершено
        createMockTask('counting_5', 'counting', 5, 2), // Не завершится
      ];

      const result = progress.update(tasks, 'counting', 1);

      expect(result.newlyCompleted).toHaveLength(1);
      expect(result.newlyCompleted[0].id).toBe('counting_3');
    });

    it('should handle increment parameter correctly (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_5', 'counting', 5),
      ];

      const result = progress.update(tasks, 'counting', 3);
      const updated = result.tasks;

      expect(updated[0].current).toBe(3);
    });

    it('should handle multiple updates correctly', () => {
      const progress = new DailyTasksProgress();
      let tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
      ];

      // Первое обновление
      let result = progress.update(tasks, 'counting', 1);
      tasks = result.tasks;
      expect(tasks[0].current).toBe(1);
      expect(tasks[0].completed).toBe(false);

      // Второе обновление
      result = progress.update(tasks, 'counting', 1);
      tasks = result.tasks;
      expect(tasks[0].current).toBe(2);
      expect(tasks[0].completed).toBe(false);

      // Третье обновление - завершение
      result = progress.update(tasks, 'counting', 1);
      tasks = result.tasks;
      expect(tasks[0].current).toBe(3);
      expect(tasks[0].completed).toBe(true);
    });

    it('should not affect tasks with different exercise type (FR-FUNC-004)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
        createMockTask('equations_5', 'equations', 5),
        createMockTask('multiplication_5', 'multiplication', 5),
      ];

      const result = progress.update(tasks, 'counting', 1);
      const updated = result.tasks;

      expect(updated[0].current).toBe(1); // counting обновился
      expect(updated[1].current).toBe(0); // equations не изменился
      expect(updated[2].current).toBe(0); // multiplication не изменился
    });

    it('should handle empty task list gracefully', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [];

      const result = progress.update(tasks, 'counting', 1);

      expect(result.tasks).toEqual([]);
      expect(result.newlyCompleted).toEqual([]);
    });

    it('should handle unknown exercise type gracefully', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
      ];

      const result = progress.update(tasks, 'unknown_type' as never, 1);
      const updated = result.tasks;

      // Ничего не должно обновиться
      expect(updated[0].current).toBe(0);
    });

    it('should handle tasks with same type but different targets', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
        createMockTask('counting_5', 'counting', 5),
      ];

      const result = progress.update(tasks, 'counting', 2);
      const updated = result.tasks;

      expect(updated[0].current).toBe(2);
      expect(updated[1].current).toBe(2);
      expect(updated[0].completed).toBe(false);
      expect(updated[1].completed).toBe(false);
    });

    it('should return immutable result (original array not modified)', () => {
      const progress = new DailyTasksProgress();
      const tasks: DailyTask[] = [
        createMockTask('counting_3', 'counting', 3),
      ];
      const originalCurrent = tasks[0].current;

      progress.update(tasks, 'counting', 1);

      // Оригинальный массив не должен измениться
      expect(tasks[0].current).toBe(originalCurrent);
    });
  });
});
