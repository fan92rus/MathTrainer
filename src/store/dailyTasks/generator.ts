// DailyTasksGenerator - класс для генерации ежедневных заданий
// Соответствует FR-ARCH-002 из PRD v2.0

import type { DailyTask, DailyTaskConfig } from './types';

/**
 * Класс для генерации ежедневных заданий
 * Детерминирован для одинаковых seed
 * Тестируемый без зависимостей от Vue/Pinia
 */
export class DailyTasksGenerator {
  constructor(private readonly config: DailyTaskConfig[]) {}

  /**
   * Генерирует задания для указанного класса и четверти
   * @param grade - Класс ученика (1-4)
   * @param quarter - Четверть (1-4)
   * @param dateSeed - Сид для детерминированной генерации (обычно дата)
   * @returns Массив сгенерированных заданий
   */
  generate(grade: number, quarter: number, dateSeed: string): DailyTask[] {
    // Фильтруем доступные задания по классу и четверти (FR-FUNC-002)
    const availableTasks = this.config.filter(config =>
      this.isTaskAvailable(config, grade, quarter)
    );

    // Разделяем на обязательные и необязательные
    const requiredTasks = availableTasks.filter(t => t.required);
    const optionalTasks = availableTasks.filter(t => !t.required);

    // Перемешиваем необязательные задания с seed для детерминированности (FR-FUNC-003)
    const shuffledOptional = this.shuffleArray(optionalTasks, dateSeed);

    // Вычисляем сколько необязательных заданий можно добавить
    // Итого должно быть не более 4 заданий (FR-FUNC-001)
    const remainingSlots = Math.max(0, 4 - requiredTasks.length);
    const additionalCount = Math.min(remainingSlots, shuffledOptional.length);

    // Объединяем: обязательные + случайные (итого до 4 заданий)
    const selectedConfigs = [...requiredTasks, ...shuffledOptional.slice(0, additionalCount)];

    // Сортируем по priority
    selectedConfigs.sort((a, b) => a.priority - b.priority);

    // Конвертируем конфиги в задания с начальными значениями
    return selectedConfigs.map(config => this.createTaskFromConfig(config));
  }

  /**
   * Проверяет, доступно ли задание для указанного класса и четверти
   * @param config - Конфигурация задания
   * @param grade - Класс ученика
   * @param quarter - Четверть
   * @returns true, если задание доступно
   */
  isTaskAvailable(config: DailyTaskConfig, grade: number, quarter: number): boolean {
    return config.grade.includes(grade) && config.quarter.includes(quarter);
  }

  /**
   * Перемешивает массив с seed для детерминированной случайности
   * @param array - Массив для перемешивания
   * @param seed - Сид для генерации
   * @returns Перемешанный массив
   */
  private shuffleArray<T>(array: T[], seed: string): T[] {
    const result = [...array];

    // Простой хеш строки в число
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    let random = Math.abs(hash);

    for (let i = result.length - 1; i > 0; i--) {
      // Простой генератор псевдослучайных чисел (LCG)
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      const j = random % (i + 1);
      [result[i], result[j]] = [result[j]!, result[i]!];
    }

    return result;
  }

  /**
   * Создаёт задание из конфигурации с начальными значениями
   * @param config - Конфигурация задания
   * @returns Задание с начальными значениями
   */
  private createTaskFromConfig(config: DailyTaskConfig): DailyTask {
    return {
      id: config.id,
      type: config.type,
      description: config.description,
      target: config.target,
      current: 0,
      reward: config.reward,
      completed: false,
      rewardClaimed: false,
    };
  }
}
