import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAchievementsStore } from '../achievements'

describe('Achievements Store - Basic Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('должен инициализироваться с правильными значениями', () => {
    const store = useAchievementsStore()

    expect(store.achievements).toBeDefined()
    expect(store.achievements.length).toBeGreaterThan(0)
    expect(store.unlockedCount).toBe(0)
    expect(store.totalCount).toBe(store.achievements.length)
  })

  it('должен разблокировать достижение', () => {
    const store = useAchievementsStore()
    const achievement = store.achievements[0] // Берем первое достижение

    const result = store.unlockAchievement(achievement.id)

    expect(result).toBe(true)
    expect(store.unlockedCount).toBe(1)
    expect(store.newAchievements).toContain(achievement.id)
  })

  it('не должен разблокировать то же достижение дважды', () => {
    const store = useAchievementsStore()
    const achievement = store.achievements[0]

    store.unlockAchievement(achievement.id)
    const result = store.unlockAchievement(achievement.id)

    expect(result).toBe(false)
    expect(store.unlockedCount).toBe(1)
  })

  it('должен обновлять прогресс достижения', () => {
    const store = useAchievementsStore()
    const achievement = store.achievements[0]

    store.updateAchievementProgress(achievement.id, 5)

    const progress = store.getAchievementProgress(achievement.id)
    expect(progress.progress).toBeGreaterThan(0)
  })

  it('должен автоматически разблокировать при 100% прогресса', () => {
    const store = useAchievementsStore()
    const achievement = store.achievements[0]
    const target = achievement.condition.target

    store.updateAchievementProgress(achievement.id, target + 10)

    expect(store.unlockedCount).toBe(1)
  })

  it('должен корректно считать новые достижения', () => {
    const store = useAchievementsStore()

    expect(store.getNewAchievementsCount).toBe(0)

    store.unlockAchievement(store.achievements[0].id)
    expect(store.getNewAchievementsCount).toBe(1)

    store.unlockAchievement(store.achievements[1].id)
    expect(store.getNewAchievementsCount).toBe(2)
  })

  it('должен помечать достижения как просмотренные', () => {
    const store = useAchievementsStore()
    const id1 = store.achievements[0].id
    const id2 = store.achievements[1].id

    store.unlockAchievement(id1)
    store.unlockAchievement(id2)
    expect(store.newAchievements).toHaveLength(2)

    store.markAchievementsAsViewed([id1])
    expect(store.newAchievements).toEqual([id2])

    store.markAchievementsAsViewed()
    expect(store.newAchievements).toEqual([])
  })

  it('должен правильно фильтровать достижения по категориям', () => {
    const store = useAchievementsStore()

    const pointsAchievements = store.getAchievementsByCategory('points')
    const allAchievements = store.getAchievementsByCategory('all')

    expect(pointsAchievements.length).toBeLessThan(allAchievements.length)
    expect(allAchievements.length).toBe(store.totalCount)
  })

  it('должен сбрасывать все достижения', () => {
    const store = useAchievementsStore()

    // Разблокируем несколько достижений
    store.unlockAchievement(store.achievements[0].id)
    store.unlockAchievement(store.achievements[1].id)
    expect(store.unlockedCount).toBe(2)

    // Сбрасываем
    store.resetAllAchievements()

    expect(store.unlockedCount).toBe(0)
    expect(store.achievements.every(a => !a.unlocked)).toBe(true)
  })
})