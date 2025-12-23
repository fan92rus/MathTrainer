import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAchievementsStore } from '../achievements'
import type { ScoresStore } from '@/types/achievements'
import { ACHIEVEMENTS_DATA } from '@/data/achievements'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Mock scores store
const createMockScoresStore = (scores: Record<string, number> = {}): Partial<ScoresStore> => ({
  getTotalScore: () => 100,
  countingScore: scores.counting || 0,
  decompositionScore: scores.decomposition || 0,
  firstGradeDecompositionScore: scores.firstGradeDecomposition || 0,
  multiplicationScore: scores.multiplication || 0,
  equationsScore: scores.equations || 0,
  // getAllScores должен быть геттером, свойством, а не функцией
  get getAllScores() {
    return {
      counting: scores.counting || 0,
      decomposition: scores.decomposition || 0,
      firstGradeDecomposition: scores.firstGradeDecomposition || 0,
      multiplication: scores.multiplication || 0,
      equations: scores.equations || 0
    }
  }
})

describe('Achievements Store', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    vi.clearAllMocks()
    setActivePinia(createPinia())

    // Мокаем localStorage через vi.stubGlobal
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    // Восстанавливаем оригинальный localStorage
    vi.unstubAllGlobals()
  })

  describe('Базовые функции', () => {
    it('должен инициализироваться с правильными значениями', () => {
      const store = useAchievementsStore()

      expect(store.achievements).toHaveLength(ACHIEVEMENTS_DATA.length)
      expect(store.unlockedCount).toBe(0)
      expect(store.totalCount).toBe(ACHIEVEMENTS_DATA.length)
      expect(store.newAchievements).toEqual([])
      expect(store.lastUnlocked).toEqual([])
    })

    it('должен правильно получать все достижения', () => {
      const store = useAchievementsStore()
      const allAchievements = store.allAchievements

      expect(allAchievements).toHaveLength(ACHIEVEMENTS_DATA.length)
      expect(allAchievements[0]).toHaveProperty('id')
      expect(allAchievements[0]).toHaveProperty('name')
      expect(allAchievements[0]).toHaveProperty('description')
      expect(allAchievements[0]).toHaveProperty('condition')
    })

    it('должен разблокировать достижение', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      const result = store.unlockAchievement(achievementId)

      expect(result).toBe(true)
      expect(store.achievements.find(a => a.id === achievementId)?.unlocked).toBe(true)
      expect(store.achievements.find(a => a.id === achievementId)?.unlockedAt).toBeInstanceOf(Date)
      expect(store.unlockedCount).toBe(1)
      expect(store.newAchievements).toContain(achievementId)
      expect(store.lastUnlocked).toContain(achievementId)
    })

    it('не должен разблокировать уже разблокированное достижение', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      // Разблокируем один раз
      store.unlockAchievement(achievementId)

      // Пытаемся разблокировать второй раз
      const result = store.unlockAchievement(achievementId)

      expect(result).toBe(false)
      expect(store.unlockedCount).toBe(1)
    })

    it('должен правильно обновлять прогресс', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      store.updateAchievementProgress(achievementId, 5)

      const achievement = store.achievements.find(a => a.id === achievementId)
      expect(achievement?.progress).toBe(Math.min((5 / 10) * 100, 100))
    })

    it('должен автоматически разблокировать при 100% прогрессе', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      store.updateAchievementProgress(achievementId, 15) // Больше чем нужно

      const achievement = store.achievements.find(a => a.id === achievementId)
      expect(achievement?.unlocked).toBe(true)
      expect(store.unlockedCount).toBe(1)
    })
  })

  describe('Проверка условий достижений', () => {
    // Каждый тест в этом блоке получает новую pinia для изоляции
    beforeEach(() => {
      setActivePinia(createPinia())
      // Очищаем моки localStorage
      localStorageMock.getItem.mockReturnValue(null)
      localStorageMock.setItem.mockClear()
    })

    it('должен разблокировать достижение за общие очки', () => {
      const store = useAchievementsStore()

      // Находим достижение за 10 очков (first_steps имеет target 10, но другой тип)
      // Проверяем novice (100 очков)
      store.checkTotalPointsAchievements(() => 100, [])

      const totalPointsAchievement = store.achievements.find(a => a.id === 'novice')
      expect(totalPointsAchievement?.unlocked).toBe(true)
    })

    it('должен разблокировать достижение за очки в конкретном упражнении', () => {
      const store = useAchievementsStore()
      const mockScoresStore = createMockScoresStore({ counting: 100 })

      store.checkExercisePointsAchievements(mockScoresStore as ScoresStore, 'counting', [])

      const countingAchievement = store.achievements.find(a => a.id === 'counting_lover')
      expect(countingAchievement?.unlocked).toBe(true)
    })

    it('должен разблокировать достижение за серию правильных ответов', () => {
      const store = useAchievementsStore()

      store.checkStreakAchievements(10, [])

      const streakAchievement = store.achievements.find(
        a => a.condition.type === 'correct_streak' && a.condition.target === 10
      )
      expect(streakAchievement?.unlocked).toBe(true)
    })

    it('должен разблокировать достижение "Исследователь" за разнообразие', () => {
      const store = useAchievementsStore()

      const mockScoresStore = createMockScoresStore({
        counting: 50,
        decomposition: 50,
        firstGradeDecomposition: 50,
        multiplication: 50,
        equations: 50
      })

      store.checkDiversityAchievements(mockScoresStore as ScoresStore, [])

      const explorerAchievement = store.achievements.find(a => a.id === 'explorer')
      expect(explorerAchievement?.unlocked).toBe(true)
    })

    it('должен разблокировать достижение "Универсальный математик" за разнообразие', () => {
      const store = useAchievementsStore()

      const mockScoresStore = createMockScoresStore({
        counting: 50,
        decomposition: 50,
        firstGradeDecomposition: 50,
        multiplication: 50,
        equations: 50
      })

      store.checkDiversityAchievements(mockScoresStore as ScoresStore, [])

      const universalAchievement = store.achievements.find(a => a.id === 'universal_mathematician')
      expect(universalAchievement?.unlocked).toBe(true)
    })

    it('не должен разблокировать "Универсальный математик" если не все очки >= 50', () => {
      const store = useAchievementsStore()
      const mockScoresStore = createMockScoresStore({
        counting: 50,
        decomposition: 50,
        firstGradeDecomposition: 50,
        multiplication: 30, // Меньше 50
        equations: 50
      })

      store.checkDiversityAchievements(mockScoresStore as ScoresStore, [])

      const universalAchievement = store.achievements.find(a => a.id === 'universal_mathematician')
      expect(universalAchievement?.unlocked).toBe(false)
    })
  })

  describe('Проверка условий достижений - изолированные тесты', () => {
    let unlockSpy: any

    beforeEach(() => {
      // Полная изоляция для этой группы тестов
      vi.clearAllMocks()
      setActivePinia(createPinia())
      localStorageMock.getItem.mockReturnValue(null)
      localStorageMock.setItem.mockClear()
      vi.stubGlobal('localStorage', localStorageMock)
    })

    afterEach(() => {
      if (unlockSpy) unlockSpy.mockRestore()
      vi.unstubAllGlobals()
    })

    it('не должен разблокировать "Исследователь" если не попробованы все типы упражнений', () => {
      // Создаем абсолютно новую pinia для максимальной изоляции
      const freshPinia = createPinia()
      setActivePinia(freshPinia)

      const store = useAchievementsStore(freshPinia)

      // Никто из упражнений не имеет очков
      const mockScoresStore = createMockScoresStore({
        counting: 0,
        decomposition: 0,
        firstGradeDecomposition: 0,
        multiplication: 0,
        equations: 0
      })

      store.checkDiversityAchievements(mockScoresStore as ScoresStore, [])

      // Проверяем состояние напрямую (не через spy)
      const explorerAchievement = store.achievements.find((a: any) => a.id === 'explorer')
      expect(explorerAchievement?.unlocked).toBe(false)
    })
  })

  describe('Сохранение и загрузка', () => {
    it('должен сохранять достижения в localStorage', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      store.unlockAchievement(achievementId)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'achievements',
        expect.stringContaining(achievementId)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'newAchievements',
        expect.stringContaining(achievementId)
      )
    })

    it('должен загружать достижения из localStorage', () => {
      const savedData = JSON.stringify([
        { id: 'first_steps', unlocked: true, unlockedAt: '2024-01-01T00:00:00.000Z' }
      ])
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'achievements') return savedData
        return null
      })

      const store = useAchievementsStore()
      store.loadAchievements()

      const achievement = store.achievements.find(a => a.id === 'first_steps')
      expect(achievement?.unlocked).toBe(true)
      expect(achievement?.unlockedAt).toBeInstanceOf(Date)
    })

    it('должен корректно обрабатывать ошибки при загрузке', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const store = useAchievementsStore()
      store.loadAchievements()

      expect(consoleSpy).toHaveBeenCalledWith('Error loading achievements:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('должен правильно обновлять счетчик разблокированных', () => {
      const store = useAchievementsStore()

      expect(store.unlockedCount).toBe(0)

      store.unlockAchievement('first_steps')
      expect(store.unlockedCount).toBe(1)

      store.unlockAchievement('novice')
      expect(store.unlockedCount).toBe(2)
    })
  })

  describe('Управление новыми достижениями', () => {
    it('должен правильно считать новые достижения', () => {
      const store = useAchievementsStore()

      expect(store.getNewAchievementsCount).toBe(0)

      store.unlockAchievement('first_steps')
      expect(store.getNewAchievementsCount).toBe(1)

      store.unlockAchievement('novice')
      expect(store.getNewAchievementsCount).toBe(2)
    })

    it('должен помечать достижения как просмотренные', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps')
      store.unlockAchievement('novice')
      expect(store.newAchievements).toHaveLength(2)

      store.markAchievementsAsViewed(['first_steps'])
      expect(store.newAchievements).toEqual(['novice'])

      store.markAchievementsAsViewed()
      expect(store.newAchievements).toEqual([])
    })
  })

  describe('Показанные достижения', () => {
    it('должен отмечать достижения как показанные', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps')
      store.markAchievementsAsShown(['first_steps'])

      expect(store.shownAchievements).toContain('first_steps')
    })

    it('должен возвращать непоказанные новые достижения', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps')
      store.unlockAchievement('novice')
      store.markAchievementsAsShown(['first_steps'])

      const unshown = store.getUnshownNewAchievements()
      expect(unshown).toEqual(['novice'])
      expect(unshown).not.toContain('first_steps')
    })

    it('при разблокировке achievement не должен быть в shownAchievements', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps')
      expect(store.shownAchievements).not.toContain('first_steps')
    })
  })

  describe('Сброс достижений', () => {
    it('должен полностью сбрасывать все достижения', () => {
      const store = useAchievementsStore()

      // Разблокируем несколько достижений
      store.unlockAchievement('first_steps')
      store.unlockAchievement('novice')
      expect(store.unlockedCount).toBe(2)

      // Сбрасываем
      store.resetAllAchievements()

      expect(store.unlockedCount).toBe(0)
      expect(store.achievements.every(a => !a.unlocked)).toBe(true)
      expect(store.newAchievements).toEqual([])
      expect(store.lastUnlocked).toEqual([])
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Проверка прогресса достижений', () => {
    it('должен возвращать правильный прогресс для существующего достижения', () => {
      const store = useAchievementsStore()
      const achievementId = 'first_steps'

      const progress = store.getAchievementProgress(achievementId)

      expect(progress.achievementId).toBe(achievementId)
      expect(progress.target).toBe(10) // из данных
      expect(progress.progress).toBe(0)
    })

    it('должен возвращать прогресс 0 для несуществующего достижения', () => {
      const store = useAchievementsStore()
      const nonExistentId = 'non_existent'

      const progress = store.getAchievementProgress(nonExistentId)

      expect(progress.achievementId).toBe(nonExistentId)
      expect(progress.current).toBe(0)
      expect(progress.target).toBe(0)
      expect(progress.progress).toBe(0)
    })
  })

  describe('Категоризация достижений', () => {
    it('должен возвращать достижения по категории', () => {
      const store = useAchievementsStore()

      const streakAchievements = store.getAchievementsByCategory('streak')

      streakAchievements.forEach(achievement => {
        expect(achievement.category).toBe('streak')
      })
    })

    it('должен возвращать все достижения для категории "all"', () => {
      const store = useAchievementsStore()

      const allAchievements = store.getAchievementsByCategory('all')

      expect(allAchievements).toHaveLength(ACHIEVEMENTS_DATA.length)
    })

    it('должен возвращать разблокированные достижения', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps')
      store.unlockAchievement('novice')

      const unlocked = store.getUnlockedAchievements

      expect(unlocked).toHaveLength(2)
      expect(unlocked.every(a => a.unlocked)).toBe(true)
    })
  })

  describe('Статистика достижений', () => {
    it('должен возвращать корректную статистику', () => {
      const store = useAchievementsStore()

      store.unlockAchievement('first_steps') // streak
      store.unlockAchievement('novice') // points

      const stats = store.getAchievementsStats

      expect(stats.streak).toBe(1)
      expect(stats.points).toBe(1)
      expect(stats.diversity).toBe(0)
    })
  })

  describe('Полная проверка достижений', () => {
    it('должен проверять все условия после упражнения', () => {
      const store = useAchievementsStore()
      const mockScoresStore = createMockScoresStore({
        counting: 100,
        decomposition: 0,
        firstGradeDecomposition: 0,
        multiplication: 0,
        equations: 0
      })

      const unlocked = store.checkAchievements(mockScoresStore as ScoresStore, {
        type: 'counting',
        correct: true,
        streak: 10
      })

      // first_steps (streak 10) и counting_lover (100 очков counting) должны разблокироваться
      expect(unlocked).toContain('first_steps')
      expect(unlocked).toContain('counting_lover')
    })
  })
})
