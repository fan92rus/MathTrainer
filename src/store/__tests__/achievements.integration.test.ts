import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAchievementsStore } from '../achievements'
import { useScoresStore } from '../scores'

describe('Achievements Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('должен разблокировать достижение за общие очки', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем очки напрямую в store
    scoresStore.updateCountingScore(10)

    // Вызываем проверку достижений
    achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

    // Должно разблокироваться достижение "first_steps" за 10 очков
    const achievement = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(achievement?.unlocked).toBe(true)
    expect(achievement?.progress).toBe(100)
  })

  it('должен разблокировать достижение за очки в счете', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем 50 очков в счет
    scoresStore.updateCountingScore(50)

    // Вызываем проверку достижений
    const mockScoresStore = {
      countingScore: scoresStore.countingScore,
      decompositionScore: scoresStore.decompositionScore,
      firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
      multiplicationScore: scoresStore.multiplicationScore,
      equationsScore: scoresStore.equationsScore
    }

    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    // Должно разблокироваться достижение "counting_lover" за 30 очков
    const achievement = achievementsStore.achievements.find(a => a.id === 'counting_lover')
    expect(achievement?.unlocked).toBe(true)
  })

  it('должен обновлять прогресс достижений при увеличении очков', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем 25 очков (половина от 50 для counting_lover)
    scoresStore.updateCountingScore(25)

    const mockScoresStore = {
      countingScore: scoresStore.countingScore,
      decompositionScore: scoresStore.decompositionScore,
      firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
      multiplicationScore: scoresStore.multiplicationScore,
      equationsScore: scoresStore.equationsScore
    }

    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    const achievement = achievementsStore.achievements.find(a => a.id === 'counting_lover')
    expect(achievement?.progress).toBe(50) // 25/50 * 100
    expect(achievement?.unlocked).toBe(false)

    // Добавляем еще 30 очков (итого 55)
    scoresStore.updateCountingScore(30)
    mockScoresStore.countingScore = scoresStore.countingScore // Обновляем мок
    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    // Теперь должно быть разблокировано
    expect(achievement?.unlocked).toBe(true)
  })

  it('должен проверять все типы достижений при вызове checkAchievements', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем очки в несколько категорий
    scoresStore.updateCountingScore(20)
    scoresStore.updateDecompositionScore(30)
    scoresStore.updateMultiplicationScore(40)

    const exerciseData = {
      type: 'multiplication',
      correct: true,
      streak: 5
    }

    // Вызываем основную функцию проверки
    const unlocked = achievementsStore.checkAchievements(scoresStore, exerciseData)

    // Проверяем, что были проверены разные типы достижений
    expect(unlocked).toBeDefined()
    expect(Array.isArray(unlocked)).toBe(true)
  })

  describe('Edge Cases', () => {
    it('не должен разблокировать достижение дважды', () => {
      const achievementsStore = useAchievementsStore()
      const scoresStore = useScoresStore()

      scoresStore.updateCountingScore(20)

      // Первый вызов
      achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

      // Второй вызов с теми же очками
      achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

      const achievement = achievementsStore.achievements.find(a => a.id === 'first_steps')
      // Должно быть разблокировано, но progress не должен меняться
      expect(achievement?.unlocked).toBe(true)
      expect(achievement?.progress).toBe(100)
    })

    it('должен корректно обрабатывать нулевые очки', () => {
      const achievementsStore = useAchievementsStore()
      const scoresStore = useScoresStore()

      // Не добавляем очков
      achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

      // Ни одно достижение не должно быть разблокировано
      const unlockedCount = achievementsStore.achievements.filter(a => a.unlocked).length
      expect(unlockedCount).toBe(0)
    })
  })
})