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

  it('должен разблокировать достижение при первом входе с очками', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем очки
    scoresStore.updateCountingScore(50)

    // Вызываем checkAchievements для типа counting (как это делает HomeView)
    const unlocked = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    // Проверяем, что достижение разблокировано
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
    expect(unlocked.length).toBeGreaterThan(0)
  })

  it('не должен разблокировать то же достижение дважды', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем очки
    scoresStore.updateCountingScore(50)

    // Первый вызов
    const unlocked1 = checkAchievements(scoresStore, {
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

    // Но первое достижение должно остаться разблокированным
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
  })

  it('проверяет только неразблокированные достижения', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()
    const { checkAchievements } = useAchievements()

    // Добавляем много очков
    scoresStore.updateCountingScore(1000)

    // Первый вызов - должно разблокировать несколько достижений
    const unlocked1 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    const totalUnlocked = achievementsStore.achievements.filter(a => a.unlocked).length
    expect(totalUnlocked).toBeGreaterThan(0)
    expect(unlocked1.length).toBe(totalUnlocked)

    // Второй вызов с теми же очками - ничего нового
    const unlocked2 = checkAchievements(scoresStore, {
      type: 'counting',
      correct: true
    })

    expect(unlocked2.length).toBe(0)
    expect(achievementsStore.achievements.filter(a => a.unlocked).length).toBe(totalUnlocked)
  })
})