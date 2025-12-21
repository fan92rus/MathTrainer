import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { ACHIEVEMENTS_DATA } from '@/data/achievements'
import type { AchievementsState, AchievementProgress } from '@/types/achievements'
import type { ScoresStore } from './scores'

export const useAchievementsStore = defineStore('achievements', {
  state: (): AchievementsState => ({
    achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS_DATA)), // deep clone
    unlockedCount: 0,
    totalCount: ACHIEVEMENTS_DATA.length,
    lastUnlocked: [],
    newAchievements: []
  }),

  getters: {
    // Получить все ачивки
    allAchievements: (state) => state.achievements,

    // Получить ачивки по категории
    getAchievementsByCategory: (state) => (category: string) => {
      if (category === 'all') return state.achievements
      return state.achievements.filter(a => a.category === category)
    },

    // Получить разблокированные ачивки
    getUnlockedAchievements: (state) => {
      return state.achievements.filter(a => a.unlocked)
    },

    // Получить количество новых ачивок
    getNewAchievementsCount: (state) => {
      return state.newAchievements.length
    },

    // Получить прогресс ачивки
    getAchievementProgress: (state) => (achievementId: string): AchievementProgress => {
      const achievement = state.achievements.find(a => a.id === achievementId)
      if (!achievement) {
        return { achievementId, current: 0, target: 0, progress: 0 }
      }
      return {
        achievementId,
        current: 0, // будет вычисляться динамически
        target: achievement.condition.target,
        progress: achievement.progress || 0
      }
    },

    // Получить общую статистику
    getAchievementsStats: (state) => {
      const stats = {
        points: 0,
        streak: 0,
        level: 0,
        time: 0,
        diversity: 0,
        hidden: 0
      }

      state.achievements.forEach(achievement => {
        if (achievement.unlocked) {
          stats[achievement.category]++
        }
      })

      return stats
    }
  },

  actions: {
    // Загрузить ачивки из localStorage
    loadAchievements(): void {
      const { getItem } = useStorage()

      const saved = getItem('achievements')
      if (saved) {
        try {
          const parsedAchievements = JSON.parse(saved)
          if (Array.isArray(parsedAchievements)) {
            // Обновляем существующие ачивки данными из localStorage
            this.achievements = this.achievements.map(baseAchievement => {
              const savedAchievement = parsedAchievements.find((a: { id: string; unlocked?: boolean; unlockedAt?: string; progress?: number }) => a.id === baseAchievement.id)
              if (savedAchievement) {
                return {
                  ...baseAchievement,
                  unlocked: savedAchievement.unlocked || false,
                  unlockedAt: savedAchievement.unlockedAt ? new Date(savedAchievement.unlockedAt) : undefined,
                  progress: savedAchievement.progress || 0
                }
              }
              return baseAchievement
            })
          }
        } catch (error) {
          console.error('Error loading achievements:', error)
        }
      }

      const savedNewAchievements = getItem('newAchievements')
      if (savedNewAchievements) {
        try {
          this.newAchievements = JSON.parse(savedNewAchievements)
        } catch (error) {
          console.error('Error loading new achievements:', error)
        }
      }

      this.updateUnlockedCount()
    },

    // Сохранить ачивки в localStorage
    saveAchievements(): void {
      const { setItem } = useStorage()

      const achievementsToSave = this.achievements.map(({ id, unlocked, unlockedAt, progress }) => ({
        id,
        unlocked,
        unlockedAt,
        progress
      }))

      setItem('achievements', JSON.stringify(achievementsToSave))
      setItem('newAchievements', JSON.stringify(this.newAchievements))
    },

    // Обновить счетчик разблокированных ачивок
    updateUnlockedCount(): void {
      this.unlockedCount = this.achievements.filter(a => a.unlocked).length
    },

    // Разблокировать ачивку
    unlockAchievement(achievementId: string): boolean {
      const achievement = this.achievements.find(a => a.id === achievementId)
      if (!achievement || achievement.unlocked) return false

      achievement.unlocked = true
      achievement.unlockedAt = new Date()
      achievement.progress = 100

      if (!this.newAchievements.includes(achievementId)) {
        this.newAchievements.push(achievementId)
      }

      this.lastUnlocked = [achievementId]
      this.updateUnlockedCount()
      this.saveAchievements()

      return true
    },

    // Обновить прогресс ачивки
    updateAchievementProgress(achievementId: string, current: number): void {
      const achievement = this.achievements.find(a => a.id === achievementId)
      if (!achievement || achievement.unlocked) return

      const progress = Math.min((current / achievement.condition.target) * 100, 100)
      achievement.progress = Math.round(progress)

      if (progress >= 100) {
        this.unlockAchievement(achievementId)
      } else {
        this.saveAchievements()
      }
    },

    // Отметить ачивки как просмотренные
    markAchievementsAsViewed(achievementIds?: string[]): void {
      if (achievementIds) {
        this.newAchievements = this.newAchievements.filter(id => !achievementIds.includes(id))
      } else {
        this.newAchievements = []
      }
      this.saveAchievements()
    },

    // Проверить условия ачивок после упражнения
    checkAchievements(scoresStore: ScoresStore, exerciseData: {
      type: string
      correct: boolean
      time?: number
      streak?: number
    }): string[] {
      const newlyUnlocked: string[] = []
      const now = new Date()

      // Проверяем общие очки
      this.checkTotalPointsAchievements(() => scoresStore.getTotalScore, newlyUnlocked)

      // Проверяем очки по типам упражнений
      this.checkExercisePointsAchievements(scoresStore, exerciseData.type, newlyUnlocked)

      // Проверяем серии правильных ответов
      if (exerciseData.streak !== undefined) {
        this.checkStreakAchievements(exerciseData.streak, newlyUnlocked)
      }

      // Проверяем временные челленджи
      if (exerciseData.time !== undefined) {
        this.checkTimeAchievements(exerciseData.type, exerciseData.time, newlyUnlocked)
      }

      // Проверяем разнообразие
      this.checkDiversityAchievements(scoresStore, newlyUnlocked)

      // Проверяем скрытые ачивки
      this.checkHiddenAchievements(now, exerciseData, scoresStore, newlyUnlocked)

      // Показываем уведомление для новых ачивок
      if (newlyUnlocked.length > 0) {
        this.lastUnlocked = newlyUnlocked
      }

      return newlyUnlocked
    },

    // Проверка ачивок за общие очки
    checkTotalPointsAchievements(getTotalScore: () => number, newlyUnlocked: string[]): void {
      const totalScore = getTotalScore()

      this.achievements.forEach(achievement => {
        if (achievement.condition.type === 'total_points' && !achievement.unlocked) {
          this.updateAchievementProgress(achievement.id, totalScore)
          if (totalScore >= achievement.condition.target && !newlyUnlocked.includes(achievement.id)) {
            newlyUnlocked.push(achievement.id)
          }
        }
      })
    },

    // Проверка ачивок за очки в упражнениях
    checkExercisePointsAchievements(scoresStore: ScoresStore, exerciseType: string, newlyUnlocked: string[]): void {
      const exerciseScores = {
        counting: scoresStore.countingScore,
        decomposition: scoresStore.decompositionScore,
        firstGradeDecomposition: scoresStore.firstGradeDecompositionScore,
        multiplication: scoresStore.multiplicationScore,
        equations: scoresStore.equationsScore
      }

      this.achievements.forEach(achievement => {
        if (achievement.condition.type === 'exercise_points' &&
            achievement.condition.exercise === exerciseType &&
            !achievement.unlocked) {
          const score = exerciseScores[achievement.condition.exercise as keyof typeof exerciseScores] || 0
          this.updateAchievementProgress(achievement.id, score)
          if (score >= achievement.condition.target && !newlyUnlocked.includes(achievement.id)) {
            newlyUnlocked.push(achievement.id)
          }
        }
      })
    },

    // Проверка ачивок за серии
    checkStreakAchievements(streak: number, newlyUnlocked: string[]): void {
      this.achievements.forEach(achievement => {
        if (achievement.condition.type === 'correct_streak' && !achievement.unlocked) {
          this.updateAchievementProgress(achievement.id, streak)
          if (streak >= achievement.condition.target && !newlyUnlocked.includes(achievement.id)) {
            newlyUnlocked.push(achievement.id)
          }
        }
      })
    },

    // Проверка ачивок за время
    checkTimeAchievements(exerciseType: string, _timeSpent: number, _newlyUnlocked: string[]): void {
      // Эта функция должна быть вызвана с количеством решенных примеров и общим временем
      // Временная реализация - требует доработки
      this.achievements.forEach(achievement => {
        if (achievement.condition.type === 'time_challenge' &&
            achievement.condition.exercise === exerciseType &&
            !achievement.unlocked) {
          // TODO: Реализовать проверку временных челленджей
          // Это требует отслеживания количества примеров и времени за сессию
        }
      })
    },

    // Проверка ачивок за разнообразие
    checkDiversityAchievements(scoresStore: ScoresStore, newlyUnlocked: string[]): void {
      const scores = scoresStore.getAllScores
      const allScores = Object.values(scores)

      // Проверка универсального математика
      const universalAchievement = this.achievements.find(a => a.id === 'universal_mathematician')
      if (universalAchievement && !universalAchievement.unlocked) {
        const allHaveEnoughPoints = allScores.every(score => score >= 50)
        if (allHaveEnoughPoints) {
          this.unlockAchievement('universal_mathematician')
          newlyUnlocked.push('universal_mathematician')
        }
        const minScore = Math.min(...allScores)
        this.updateAchievementProgress('universal_mathematician', minScore)
      }

      // Проверка исследователя
      const explorerAchievement = this.achievements.find(a => a.id === 'explorer')
      if (explorerAchievement && !explorerAchievement.unlocked) {
        const triedExercises = allScores.filter(score => score > 0).length
        if (triedExercises >= 5) { // все типы упражнений
          this.unlockAchievement('explorer')
          newlyUnlocked.push('explorer')
        }
        this.updateAchievementProgress('explorer', triedExercises)
      }
    },

    // Проверка скрытых ачивок
    checkHiddenAchievements(now: Date, exerciseData: { type: string; correct: boolean }, _scoresStore: ScoresStore, _newlyUnlocked: string[]): void {
      const hour = now.getHours()

      // Ночной математик (после 20:00)
      if (hour >= 20 || hour < 6) {
        const nightAchievement = this.achievements.find(a => a.id === 'night_mathematician')
        if (nightAchievement && !nightAchievement.unlocked) {
          // TODO: Добавить отслеживание количества примеров решенных ночью
          // Это требует хранения статистики по времени
        }
      }

      // Утренняя зарядка (до 9:00)
      if (hour >= 6 && hour < 9 && exerciseData.correct) {
        const morningAchievement = this.achievements.find(a => a.id === 'morning_brain')
        if (morningAchievement && !morningAchievement.unlocked) {
          // TODO: Добавить отслеживание правильных ответов утром
        }
      }
    },

    // Сбросить все ачивки (для тестирования)
    resetAllAchievements(): void {
      this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS_DATA))
      this.unlockedCount = 0
      this.lastUnlocked = []
      this.newAchievements = []
      this.saveAchievements()
    }
  }
})

// Типы для TypeScript при использовании store
export type AchievementsStore = ReturnType<typeof useAchievementsStore>