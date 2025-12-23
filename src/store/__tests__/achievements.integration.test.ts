import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAchievementsStore } from '../achievements'
import { useScoresStore } from '../scores'

describe('Achievements Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('должен разблокировать достижение за общие очки (novice - 100 очков)', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем 100 очков для novice
    scoresStore.updateCountingScore(100)

    // Вызываем проверку достижений
    achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

    // Должно разблокироваться достижение "novice" за 100 очков
    const achievement = achievementsStore.achievements.find(a => a.id === 'novice')
    expect(achievement?.unlocked).toBe(true)
    expect(achievement?.progress).toBe(100)
  })

  it('должен разблокировать достижение за очки в счете (counting_lover - 100 очков)', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем 100 очков в счет
    scoresStore.updateCountingScore(100)

    // Вызываем проверку достижений
    const mockScoresStore = {
      countingScore: scoresStore.countingScore,
      decompositionScore: scoresStore.decompositionScore,
      firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
      multiplicationScore: scoresStore.multiplicationScore,
      equationsScore: scoresStore.equationsScore,
      get getAllScores() {
        return {
          counting: this.countingScore,
          decomposition: this.decompositionScore,
          firstGradeDecomposition: this.firstGradeDecompositionScore,
          multiplication: this.multiplicationScore,
          equations: this.equationsScore
        }
      }
    }

    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    // Должно разблокироваться достижение "counting_lover" за 100 очков
    const achievement = achievementsStore.achievements.find(a => a.id === 'counting_lover')
    expect(achievement?.unlocked).toBe(true)
  })

  it('должен обновлять прогресс достижений при увеличении очков', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    // Добавляем 50 очков (половина от 100 для counting_lover)
    scoresStore.updateCountingScore(50)

    const mockScoresStore = {
      countingScore: scoresStore.countingScore,
      decompositionScore: scoresStore.decompositionScore,
      firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
      multiplicationScore: scoresStore.multiplicationScore,
      equationsScore: scoresStore.equationsScore,
      get getAllScores() {
        return {
          counting: this.countingScore,
          decomposition: this.decompositionScore,
          firstGradeDecomposition: this.firstGradeDecompositionScore,
          multiplication: this.multiplicationScore,
          equations: this.equationsScore
        }
      }
    }

    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    const achievement = achievementsStore.achievements.find(a => a.id === 'counting_lover')
    expect(achievement?.progress).toBe(50) // 50/100 * 100
    expect(achievement?.unlocked).toBe(false)

    // Добавляем еще 60 очков (итого 110)
    scoresStore.updateCountingScore(60)
    mockScoresStore.countingScore = scoresStore.countingScore // Обновляем мок
    achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

    // Теперь должно быть разблокировано
    expect(achievement?.unlocked).toBe(true)
  })

  it('должен разблокировать достижение за серию правильных ответов', () => {
    const achievementsStore = useAchievementsStore()
    const scoresStore = useScoresStore()

    scoresStore.updateCountingScore(50)

    const mockScoresStore = {
      countingScore: scoresStore.countingScore,
      decompositionScore: scoresStore.decompositionScore,
      firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
      multiplicationScore: scoresStore.multiplicationScore,
      equationsScore: scoresStore.equationsScore,
      get getAllScores() {
        return {
          counting: this.countingScore,
          decomposition: this.decompositionScore,
          firstGradeDecomposition: this.firstGradeDecompositionScore,
          multiplication: this.multiplicationScore,
          equations: this.equationsScore
        }
      }
    }

    // Вызываем проверку со streak 10
    const unlocked = achievementsStore.checkAchievements(mockScoresStore as any, {
      type: 'counting',
      correct: true,
      streak: 10
    })

    // first_steps должен быть разблокирован
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
    expect(unlocked).toContain('first_steps')
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

      scoresStore.updateCountingScore(100)

      // Первый вызов
      achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

      const novice = achievementsStore.achievements.find(a => a.id === 'novice')
      expect(novice?.unlocked).toBe(true)
      expect(novice?.progress).toBe(100)

      // Второй вызов с теми же очками
      achievementsStore.checkTotalPointsAchievements(() => scoresStore.getTotalScore, [])

      // Должно оставаться разблокированным
      expect(novice?.unlocked).toBe(true)
      expect(novice?.progress).toBe(100)
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

    it('не должен терять прогресс между проверками', () => {
      const achievementsStore = useAchievementsStore()
      const scoresStore = useScoresStore()

      scoresStore.updateCountingScore(30)

      const mockScoresStore = {
        countingScore: scoresStore.countingScore,
        decompositionScore: scoresStore.decompositionScore,
        firstGradeDecompositionScore: scoresStore.firstGradeDecompositionScore,
        multiplicationScore: scoresStore.multiplicationScore,
        equationsScore: scoresStore.equationsScore,
        get getAllScores() {
          return {
            counting: this.countingScore,
            decomposition: this.decompositionScore,
            firstGradeDecomposition: this.firstGradeDecompositionScore,
            multiplication: this.multiplicationScore,
            equations: this.equationsScore
          }
        }
      }

      achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

      const countingLover = achievementsStore.achievements.find(a => a.id === 'counting_lover')
      expect(countingLover?.progress).toBe(30) // 30/100 * 100

      // Вторая проверка без изменений
      achievementsStore.checkExercisePointsAchievements(mockScoresStore as any, 'counting', [])

      // Прогресс не должен измениться
      expect(countingLover?.progress).toBe(30)
    })
  })
})
