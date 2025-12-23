import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useScoresStore } from '@/store/scores'
import { useAchievementsStore } from '@/store/achievements'
import { useAchievements } from '@/composables/useAchievements'

describe('HomeView - Simple Achievements Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('должен разблокировать достижение novice при накоплении 100 очков', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем 100 очков
    scoresStore.updateCountingScore(100)

    // Вызываем checkAchievements
    const unlocked = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Проверяем, что достижение novice разблокировано
    const novice = achievementsStore.achievements.find(a => a.id === 'novice')
    expect(novice?.unlocked).toBe(true)
    expect(unlocked.length).toBeGreaterThan(0)
  })

  it('не должен разблокировать то же достижение дважды', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем 100 очков для novice
    scoresStore.updateCountingScore(100)

    // Первый вызов
    const _unlocked1 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Второй вызов
    const unlocked2 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Второй вызов не должен разблокировать новые достижения
    expect(unlocked2.length).toBe(0)

    // Но novice должен остаться разблокированным
    const novice = achievementsStore.achievements.find(a => a.id === 'novice')
    expect(novice?.unlocked).toBe(true)
  })

  it('проверяет только неразблокированные достижения', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем много очков (1000 для math_master)
    scoresStore.updateCountingScore(1000)

    // Первый вызов - должно разблокировать несколько достижений
    const _unlocked1 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    const totalUnlocked = achievementsStore.achievements.filter(a => a.unlocked).length
    expect(totalUnlocked).toBeGreaterThan(0)

    // Второй вызов с теми же очками - ничего нового
    const unlocked2 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    expect(unlocked2.length).toBe(0)
    expect(achievementsStore.achievements.filter(a => a.unlocked).length).toBe(totalUnlocked)
  })
})
