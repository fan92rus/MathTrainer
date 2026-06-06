import { ref, computed } from 'vue'
import type { TowerFloor, TowerConfig } from '@/types/tower'

/**
 * Composable для паттерна "Строим башню" (Pattern 7 — Tower)
 *
 * Каждый правильный ответ добавляет этаж к башне.
 * Ошибки НЕ разрушают этажи (позитивная модель).
 *
 * @param config - конфигурация башни (целевая высота, тема, milestone-этажи)
 */
export function useTower(config: TowerConfig) {
  const floors = ref<TowerFloor[]>([])
  const errorCount = ref(0)

  /** Башня достроена — достигнута целевая высота */
  const completed = computed(() => floors.value.length >= config.targetHeight)

  /** Прогресс строительства 0..1 */
  const progress = computed(() => Math.min(floors.value.length / config.targetHeight, 1))

  /** Проверяет, является ли этаж milestone-этажом */
  function isMilestone(level: number): boolean {
    return config.milestones.includes(level)
  }

  /**
   * Добавляет этаж в башню после правильного ответа.
   * @param expression - математическое выражение (например, "5 + 3")
   * @param answer - правильный ответ
   */
  function addFloor(expression: string, answer: number): void {
    const level = floors.value.length + 1
    floors.value.push({
      id: Date.now(),
      level,
      expression,
      answer,
      state: 'completed',
      timestamp: Date.now(),
      isMilestone: isMilestone(level),
    })
  }

  /**
   * Регистрирует ошибку — башня НЕ разрушается, просто увеличивается счётчик.
   * Вызывается вместо addFloor при неправильном ответе.
   */
  function showWaitingFloor(): void {
    errorCount.value++
  }

  /** Сбрасывает башню в начальное состояние */
  function resetTower(): void {
    floors.value = []
    errorCount.value = 0
  }

  return {
    floors,
    completed,
    progress,
    errorCount,
    addFloor,
    showWaitingFloor,
    resetTower,
    isMilestone,
  }
}
