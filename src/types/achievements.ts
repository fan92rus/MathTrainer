export interface AchievementCondition {
  type: string
  target: number
  exercise?: string // тип упражнения
  class?: number // класс
  timeLimit?: number // в секундах
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'points' | 'streak' | 'level' | 'time' | 'diversity' | 'hidden'
  icon: string
  condition: AchievementCondition
  reward: number // бонусные очки
  unlocked: boolean
  unlockedAt?: Date
  progress?: number // текущий прогресс (0-100)
}

export interface AchievementProgress {
  achievementId: string
  current: number
  target: number
  progress: number // 0-100
}

export interface AchievementsState {
  achievements: Achievement[]
  unlockedCount: number
  totalCount: number
  lastUnlocked?: string[]
  newAchievements: string[] // непросмотренные ачивки
}