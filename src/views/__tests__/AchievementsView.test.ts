import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AchievementsView from '../AchievementsView.vue'
import { useAchievementsStore } from '@/store/achievements'
import AchievementCard from '@/components/AchievementCard.vue'

// Мокаем компоненты
vi.mock('@/components/BackButton.vue', () => ({
  default: { template: '<div>BackButton</div>' }
}))

vi.mock('@/components/AchievementCard.vue', () => ({
  default: { template: '<div>AchievementCard</div>' }
}))

describe('AchievementsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('должен рендерить заголовок и статистику', () => {
    const wrapper = mount(AchievementsView)

    expect(wrapper.find('.page-title').text()).toBe('Достижения')
    expect(wrapper.find('.achievements-stats').exists()).toBe(true)
  })

  it('должен показывать общую статистику', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Мокаем некоторые достижения как разблокированные
    vi.spyOn(store, 'unlockedCount', 'get').mockReturnValue(5)
    vi.spyOn(store, 'totalCount', 'get').mockReturnValue(20)

    const stats = wrapper.find('.achievements-stats')
    expect(stats.text()).toContain('5')
    expect(stats.text()).toContain('20')
    expect(stats.text()).toContain('Получено')
    expect(stats.text()).toContain('Всего')
  })

  it('должен показывать сетку достижений', () => {
    const wrapper = mount(AchievementsView)

    expect(wrapper.find('.achievements-list').exists()).toBe(true)
  })

  it('должен показывать сообщение, если нет достижений', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Мокаем пустой список достижений
    vi.spyOn(store, 'allAchievements', 'get').mockReturnValue([])

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.no-achievements').exists()).toBe(true)
    expect(wrapper.find('.no-achievements').text()).toBe('Пока нет достижений')
  })

  it('должен рендерить карточку для каждого достижения', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Проверяем, что количество карточек равно количеству достижений
    const achievementCards = wrapper.findAllComponents(AchievementCard)
    expect(achievementCards.length).toBe(store.allAchievements.length)
  })

  it('должен открывать модальное окно при клике на достижение', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Получаем первое достижение
    const achievement = store.allAchievements[0]

    // Эмулируем клик на карточку
    wrapper.vm.showAchievementDetails(achievement)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-content').exists()).toBe(true)
  })

  it('должен закрывать модальное окно при клике на оверлей', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Открываем модальное окно
    wrapper.vm.showAchievementDetails(store.allAchievements[0])
    await wrapper.vm.$nextTick()

    // Кликаем на оверлей
    await wrapper.find('.modal-overlay').trigger('click')

    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('должен показывать детали достижения в модальном окне', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()
    const achievement = store.allAchievements[0]

    // Открываем модальное окно
    wrapper.vm.showAchievementDetails(achievement)
    await wrapper.vm.$nextTick()

    const modal = wrapper.find('.modal-content')
    expect(modal.find('h2').text()).toBe(achievement.name)
    expect(modal.text()).toContain(achievement.description)
    expect(modal.text()).toContain('Условие:')
  })

  it('должен форматировать описание условия', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Ищем достижение с условием total_points
    const totalPointsAchievement = store.allAchievements.find(a => a.condition.type === 'total_points')

    if (totalPointsAchievement) {
      const description = wrapper.vm.getConditionDescription(totalPointsAchievement)
      expect(description).toContain('Набрать')
      expect(description).toContain(`${totalPointsAchievement.condition.target}`)
      expect(description).toContain('общих очков')
    }
  })

  it('должен форматировать дату в модальном окне', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Создаем достижение с датой
    const achievement = {
      ...store.allAchievements[0],
      unlocked: true,
      unlockedAt: new Date('2024-01-01T10:30:00')
    }

    wrapper.vm.showAchievementDetails(achievement)
    await wrapper.vm.$nextTick()

    const modal = wrapper.find('.modal-content')
    expect(modal.text()).toContain('Получено:')
    expect(modal.text()).toContain('1 января 2024 г.')
  })

  it('должен вызывать loadAchievements при монтировании', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    const loadSpy = vi.spyOn(store, 'loadAchievements')

    wrapper.unmount()
    wrapper.mount()

    expect(loadSpy).toHaveBeenCalled()
  })

  it('должен фильтровать скрытые достижения', () => {
    const wrapper = mount(AchievementsView)

    // Проверяем, что скрытые достижения (не разблокированные) не отображаются
    const visibleAchievements = wrapper.vm.allAchievements
    const hasHiddenNotUnlocked = visibleAchievements.some(a => a.category === 'hidden' && !a.unlocked)

    expect(hasHiddenNotUnlocked).toBe(false)
  })
})