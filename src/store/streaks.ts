/**
 * Streak Store — ежедневные стрики активности
 *
 * «Активный день» = решён хотя бы 1 пример в любом упражнении.
 * Проверка по локальной дате new Date().toDateString().
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import type { StreakState, StreakMilestone } from '@/types/motivation'

const STORAGE_KEY = 'streaks'

/** Вехи стрика — достижения за серию дней */
const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, achievementId: 'streak_3', name: 'Начало пути', description: '3 дня подряд', flameClass: 'flame-small' },
  { days: 7, achievementId: 'streak_7', name: 'Неделя практики', description: '7 дней подряд', flameClass: 'flame-medium' },
  { days: 14, achievementId: 'streak_14', name: 'Две недели!', description: '14 дней подряд', flameClass: 'flame-large' },
  { days: 30, achievementId: 'streak_30', name: 'Месяц мастерства', description: '30 дней подряд', flameClass: 'flame-rainbow' },
]

export const useStreaksStore = defineStore('streaks', () => {
  const storage = useStorage()

  // --- State ---
  const currentStreak = ref<number>(0)
  const bestStreak = ref<number>(0)
  const lastActiveDate = ref<string | null>(null)

  // --- Computed ---
  const state = computed((): StreakState => ({
    currentStreak: currentStreak.value,
    bestStreak: bestStreak.value,
    lastActiveDate: lastActiveDate.value,
    updatedAt: new Date().toISOString(),
  }))

  /** Сегодня активен? */
  const isActiveToday = computed(() => {
    return lastActiveDate.value === new Date().toDateString()
  })

  // --- Init: загрузить из localStorage ---
  function loadState(): void {
    const saved = storage.getObject<StreakState>(STORAGE_KEY)
    if (saved) {
      currentStreak.value = saved.currentStreak ?? 0
      bestStreak.value = saved.bestStreak ?? 0
      lastActiveDate.value = saved.lastActiveDate ?? null
    }
  }

  function saveState(): void {
    storage.setObject(STORAGE_KEY, state.value)
  }

  // --- Actions ---

  /**
   * Записать активность (вызвать при решении примера).
   * Логика:
   * 1. today === lastActiveDate → уже активен, ничего не делаем
   * 2. today === yesterday(lastActiveDate) → streak++
   * 3. lastActiveDate старше yesterday → streak = 1 (сброс)
   * 4. lastActiveDate === null → первый вход, streak = 1
   */
  function recordActivity(): void {
    const today = new Date().toDateString()

    // Уже активен сегодня
    if (lastActiveDate.value === today) return

    if (lastActiveDate.value === null) {
      // Первый вход
      currentStreak.value = 1
    } else {
      const lastDate = new Date(lastActiveDate.value)
      const todayDate = new Date(today)
      const diffMs = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Вчерашний день — продолжаем стрик
        currentStreak.value++
      } else {
        // Пропущен 1+ дней — сброс
        currentStreak.value = 1
      }
    }

    lastActiveDate.value = today

    // Обновляем bestStreak
    if (currentStreak.value > bestStreak.value) {
      bestStreak.value = currentStreak.value
    }

    saveState()
  }

  /**
   * Проверить, достигнуты ли вехи стрика.
   * Возвращает массив milestone, которых достиг текущий стрик.
   */
  function checkStreakMilestones(): StreakMilestone[] {
    return STREAK_MILESTONES.filter(m => currentStreak.value >= m.days)
  }

  /** Получить все milestones (для UI) */
  function getAllMilestones(): StreakMilestone[] {
    return [...STREAK_MILESTONES]
  }

  // --- Инициализация ---
  loadState()

  return {
    // State
    currentStreak,
    bestStreak,
    lastActiveDate,
    // Computed
    isActiveToday,
    // Actions
    recordActivity,
    checkStreakMilestones,
    getAllMilestones,
    // Internal
    loadState,
    saveState,
  }
})
