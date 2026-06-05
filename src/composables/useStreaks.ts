/**
 * Composable для работы со стриками
 *
 * Предоставляет реактивный интерфейс к StreakStore
 * и удобные методы для использования в компонентах.
 */
import { computed } from 'vue'
import { useStreaksStore } from '@/store/streaks'
import type { StreakMilestone } from '@/types/motivation'

export function useStreaks() {
  const streaksStore = useStreaksStore()

  /** Текущий стрик */
  const currentStreak = computed(() => streaksStore.currentStreak)

  /** Лучший стрик */
  const bestStreak = computed(() => streaksStore.bestStreak)

  /** Активен ли сегодня */
  const isActiveToday = computed(() => streaksStore.isActiveToday)

  /** Текст для отображения стрика */
  const streakText = computed(() => {
    const n = streaksStore.currentStreak
    if (n === 0) return '0 дней'
    const lastTwo = n % 100
    const lastOne = n % 10
    if (lastTwo >= 11 && lastTwo <= 14) return `${n} дней`
    if (lastOne === 1) return `${n} день`
    if (lastOne >= 2 && lastOne <= 4) return `${n} дня`
    return `${n} дней`
  })

  /** CSS-класс для размера огонька */
  const flameClass = computed(() => {
    const s = streaksStore.currentStreak
    if (s >= 30) return 'flame-rainbow'
    if (s >= 14) return 'flame-large'
    if (s >= 7) return 'flame-medium'
    if (s >= 3) return 'flame-small'
    return 'flame-tiny'
  })

  /** Записать активность (вызвать при решении примера) */
  function recordActivity(): void {
    streaksStore.recordActivity()
  }

  /** Проверить вехи стрика */
  function checkStreakMilestones(): StreakMilestone[] {
    return streaksStore.checkStreakMilestones()
  }

  return {
    currentStreak,
    bestStreak,
    isActiveToday,
    streakText,
    flameClass,
    recordActivity,
    checkStreakMilestones,
  }
}
