import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import { useScoresStore } from '@/store/scores'
import { useAchievementsStore } from '@/store/achievements'

// Мокаем router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/counting', component: { template: '<div>Counting</div>' } }
  ]
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Мокаем зависимости
vi.mock('@/utils/gradeHelpers', () => ({
  getGradeName: () => '1 класс',
  getQuarterName: () => '1 четверть',
  getCurrentQuarter: () => 1,
  getAvailableExercises: () => ({
    counting: { available: true, title: 'Счет', description: 'Решай примеры' },
    decomposition: { available: true, title: 'Состав числа', description: 'Изучай состав' }
  })
}))

vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div class="achievement-mock"></div>' }
}))

describe('HomeView - Achievements Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mountHomeView(): VueWrapper {
    return mount(HomeView, {
      global: {
        plugins: [router]
      }
    })
  }

  it('должен рендериться без ошибок', () => {
    const wrapper = mountHomeView()
    expect(wrapper.exists()).toBe(true)
  })

  it('должен иметь доступ к stores через компонент', () => {
    const wrapper = mountHomeView()

    // Проверяем, что stores доступны
    expect(useScoresStore).toBeDefined()
    expect(useAchievementsStore).toBeDefined()

    wrapper.unmount()
  })

  it('должен инициализировать achievements store при монтировании', () => {
    const achievementsStore = useAchievementsStore()

    // До монтирования store должен быть инициализирован
    expect(achievementsStore.allAchievements.length).toBeGreaterThan(0)

    const wrapper = mountHomeView()

    // После монтирования store всё ещё должен быть валидным
    expect(achievementsStore.achievements).toBeDefined()
    expect(achievementsStore.totalCount).toBeGreaterThan(0)

    wrapper.unmount()
  })

  it('должен показывать достижения при наличии разблокированных', () => {
    const achievementsStore = useAchievementsStore()
    const _scoresStore = useScoresStore()

    // Разблокируем достижение напрямую
    achievementsStore.unlockAchievement('first_steps')

    // Монтируем компонент
    const wrapper = mountHomeView()

    // Проверяем, что достижение разблокировано
    const firstSteps = achievementsStore.achievements.find(a => a.id === 'first_steps')
    expect(firstSteps?.unlocked).toBe(true)

    wrapper.unmount()
  })

  it('должен обновлять счетчик новых достижений', () => {
    const achievementsStore = useAchievementsStore()

    // Разблокируем несколько достижений
    achievementsStore.unlockAchievement('first_steps')
    achievementsStore.unlockAchievement('novice')

    // Проверяем счетчик
    expect(achievementsStore.getNewAchievementsCount).toBe(2)

    const wrapper = mountHomeView()
    expect(achievementsStore.getNewAchievementsCount).toBe(2)

    wrapper.unmount()
  })

  it('должен сбрасывать новые достижения после просмотра', () => {
    const achievementsStore = useAchievementsStore()

    // Разблокируем достижение
    achievementsStore.unlockAchievement('first_steps')
    expect(achievementsStore.getNewAchievementsCount).toBe(1)

    // Помечаем как просмотренные
    achievementsStore.markAchievementsAsViewed()
    expect(achievementsStore.getNewAchievementsCount).toBe(0)

    const wrapper = mountHomeView()
    expect(achievementsStore.getNewAchievementsCount).toBe(0)

    wrapper.unmount()
  })
})
