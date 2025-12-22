import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useAchievementsStore } from '@/store/achievements'
import type { Achievement } from '@/types/achievements'
import type { ScoresStore } from '@/store/scores'

interface AchievementsComposable {
  checkAchievements: (
    scoresStore: ScoresStore,
    exerciseData: ExerciseData
  ) => Achievement[]
  showAchievementModal: (achievement: Achievement) => void
  newlyUnlockedAchievements: Ref<Achievement[]>
  hasNewAchievements: ComputedRef<boolean>
  markAllAsViewed: () => void
}

interface ExerciseData {
  type: string
  correct: boolean
  streak?: number
  time?: number
  sessionProblems?: number
  sessionTime?: number
}

export function useAchievements(): AchievementsComposable {
  const achievementsStore = useAchievementsStore()
  const newlyUnlockedAchievements = ref<Achievement[]>([])
  
  const hasNewAchievements = computed(() => {
    const unshownCount = achievementsStore.getUnshownNewAchievements().length
    return unshownCount > 0 || newlyUnlockedAchievements.value.length > 0
  })

  // Проверка ачивок после упражнения
  const checkAchievements = (
    scoresStore: ScoresStore,
    exerciseData: ExerciseData
  ): Achievement[] => {
    const unlockedIds = achievementsStore.checkAchievements(scoresStore, exerciseData)

    const newlyUnlocked = unlockedIds
      .map(id => achievementsStore.achievements.find(a => a.id === id))
      .filter(Boolean) as Achievement[]

    if (newlyUnlocked.length > 0) {
      newlyUnlockedAchievements.value = [...newlyUnlockedAchievements.value, ...newlyUnlocked]
    }

    return newlyUnlocked
  }

  // Показать модальное окно ачивки
  const showAchievementModal = (achievement: Achievement): void => {
    newlyUnlockedAchievements.value = [achievement]
  }

  // Отметить все как просмотренные
  const markAllAsViewed = (): void => {
    newlyUnlockedAchievements.value = []
    achievementsStore.markAchievementsAsViewed()
  }

  return {
    checkAchievements,
    showAchievementModal,
    newlyUnlockedAchievements,
    hasNewAchievements,
    markAllAsViewed
  }
}

// Вспомогательная функция для отслеживания времени сессии
export function useSessionTimeTracker() {
  const sessionStartTime = ref<number>(Date.now())
  const sessionProblems = ref<number>(0)

  const startSession = (): void => {
    sessionStartTime.value = Date.now()
    sessionProblems.value = 0
  }

  const addProblem = (): void => {
    sessionProblems.value++
  }

  const getSessionData = (): { time: number; problems: number } => {
    const currentTime = Date.now()
    const sessionTime = Math.floor((currentTime - sessionStartTime.value) / 1000) // в секундах

    return {
      time: sessionTime,
      problems: sessionProblems.value
    }
  }

  return {
    startSession,
    addProblem,
    getSessionData
  }
}

// Вспомогательная функция для отслеживания времени суток
export function useTimeOfDayTracker() {
  const getPeriodOfDay = (): 'morning' | 'day' | 'evening' | 'night' => {
    const hour = new Date().getHours()

    if (hour >= 6 && hour < 9) return 'morning'
    if (hour >= 9 && hour < 17) return 'day'
    if (hour >= 17 && hour < 20) return 'evening'
    return 'night'
  }

  const isNightTime = (): boolean => {
    const hour = new Date().getHours()
    return hour >= 20 || hour < 6
  }

  const isMorningTime = (): boolean => {
    const hour = new Date().getHours()
    return hour >= 6 && hour < 9
  }

  return {
    getPeriodOfDay,
    isNightTime,
    isMorningTime
  }
}