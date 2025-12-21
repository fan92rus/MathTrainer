import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeView from '../HomeView.vue'
import { useScoresStore } from '@/store/scores'
import { useAchievementsStore } from '@/store/achievements'

// Мокаем зависимости
vi.mock('@/utils/gradeHelpers', () => ({
  getGradeName: () => '1 класс',
  getQuarterName: () => 'I четверть',
  getCurrentQuarter: () => 1,
  getAvailableExercises: () => ({
    counting: { available: true, title: 'Счет', description: 'Решай примеры' },
    decomposition: { available: true, title: 'Состав числа', description: 'Изучай состав' }
  })
}))

vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div></div>' }
}))

describe('HomeView - Achievements Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('должен вызывать checkAchievements при монтировании', () => {
    // Мокаем useAchievements
    const mockCheckAchievements = vi.fn()
    vi.doMock('@/composables/useAchievements', () => ({
      useAchievements: () => ({
        checkAchievements: mockCheckAchievements
      })
    }))

    // Проверяем, что checkAchievements был вызван
    expect(mockCheckAchievements).toHaveBeenCalled()
  })

  it('должен разблокировать достижения при наличии очков', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    })

    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем очки перед монтированием
    scoresStore.updateCountingScore(50)

    // Пересоздаем компонент с очками
    wrapper.unmount()
    mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Должно провериться достижение за 10 очков
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)
  })

  it('должен загружать и проверять достижения при каждом монтировании', () => {
    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем очки
    scoresStore.updateCountingScore(100)

    // Монтируем компонент
    mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Проверяем, что загрузились достижения
    expect(achievementsStore.allAchievements.length).toBeGreaterThan(0)

    // Проверяем, что некоторые достижения разблокированы
    const unlockedCount = achievementsStore.achievements.filter(a => a.unlocked).length
    expect(unlockedCount).toBeGreaterThan(0)
  })

  it('должен сохранять новые достижения', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    })

    const scoresStore = useScoresStore()
    const achievementsStore = useAchievementsStore()

    // Добавляем достаточно очков для нескольких достижений
    scoresStore.updateCountingScore(100)
    scoresStore.updateDecompositionScore(50)
    scoresStore.updateMultiplicationScore(30)

    // Перемонтируем, чтобы вызвать проверку
    wrapper.unmount()
    mount(HomeView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Проверяем, что есть новые достижения
    const newAchievementsCount = achievementsStore.getNewAchievementsCount
    expect(newAchievementsCount).toBeGreaterThan(0)
  })
})