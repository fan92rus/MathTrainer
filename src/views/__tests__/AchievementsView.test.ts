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

    const stats = wrapper.find('.achievements-stats')
    expect(stats.text()).toContain(store.unlockedCount.toString())
    expect(stats.text()).toContain(store.totalCount.toString())
    expect(stats.text()).toContain('Получено')
    expect(stats.text()).toContain('Всего')
  })

  it('должен показывать сетку достижений', () => {
    const wrapper = mount(AchievementsView)

    expect(wrapper.find('.achievements-list').exists()).toBe(true)
  })

  it('должен рендерить карточку для каждого дости��ения (кроме скрытых неразблокированных)', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    // Количество видимых достижений = все achievements - скрытые неразблокированные
    const visibleCount = store.allAchievements.filter(
      a => a.category !== 'hidden' || a.unlocked
    ).length

    const achievementCards = wrapper.findAllComponents(AchievementCard)
    expect(achievementCards.length).toBe(visibleCount)
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
    const store = useAchievementsStore()
    const loadSpy = vi.spyOn(store, 'loadAchievements')

    mount(AchievementsView)

    expect(loadSpy).toHaveBeenCalled()
  })

  it('должен фильтровать скрытые достижения', () => {
    const wrapper = mount(AchievementsView)

    // Проверяем, что скрытые достижения (не разблокированные) не отображаются
    const visibleAchievements = wrapper.vm.allAchievements
    const hasHiddenNotUnlocked = visibleAchievements.some(a => a.category === 'hidden' && !a.unlocked)

    expect(hasHiddenNotUnlocked).toBe(false)
  })

  it('показывает пустое состояние при отсутствии достижений', async () => {
    const store = useAchievementsStore()
    // Очищаем все достижения
    store.achievements = []
    store.unlockedCount = 0
    store.totalCount = 0
    store.updateUnlockedCount()

    const wrapper = mount(AchievementsView)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.no-achievements').exists()).toBe(true)
    expect(wrapper.text()).toContain('Пока нет достижений')
  })

  it('сортирует достижения: разблокированные первыми', () => {
    const wrapper = mount(AchievementsView)
    const achievements = wrapper.vm.allAchievements as any[]

    // Если есть разблокированные, они должны быть перед неразблокированными
    const firstUnlockedIdx = achievements.findIndex(a => a.unlocked)
    const firstLockedIdx = achievements.findIndex(a => !a.unlocked)

    if (firstUnlockedIdx !== -1 && firstLockedIdx !== -1) {
      expect(firstUnlockedIdx).toBeLessThan(firstLockedIdx)
    }
  })

  it('показывает totalCount и unlockedCount', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    expect(wrapper.vm.unlockedCount).toBe(store.unlockedCount)
    expect(wrapper.vm.totalCount).toBe(store.totalCount)
  })

  it('getConditionDescription для correct_streak', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()
    const streak = store.allAchievements.find(a => a.condition.type === 'correct_streak')
    if (streak) {
      const desc = wrapper.vm.getConditionDescription(streak)
      expect(desc).toContain('Решить')
      expect(desc).toContain('подряд')
    }
  })

  it('getConditionDescription для exercise_points', () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()
    const exercise = store.allAchievements.find(a => a.condition.type === 'exercise_points')
    if (exercise) {
      const desc = wrapper.vm.getConditionDescription(exercise)
      expect(desc).toContain('Набрать')
      expect(desc).toContain('очков в')
    }
  })

  it('getConditionDescription default для неизвестного типа', () => {
    const wrapper = mount(AchievementsView)
    const unknown = { condition: { type: 'unknown_type' } } as any
    const desc = wrapper.vm.getConditionDescription(unknown)
    expect(desc).toBe('Секретное условие')
  })

  it('показывает прогресс-бар для неразблокированного достижения с прогрессом', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    const withProgress = store.allAchievements.find(a => !a.unlocked && a.progress !== undefined && a.progress > 0)
    if (withProgress) {
      wrapper.vm.showAchievementDetails(withProgress)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.achievement-progress-modal').exists()).toBe(true)
      expect(wrapper.text()).toContain('Прогресс:')
    }
  })

  it('не показывает раздел «Получено» для неразблокированного достижения', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    const locked = store.allAchievements.find(a => !a.unlocked)
    if (locked) {
      wrapper.vm.showAchievementDetails(locked)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.achievement-unlocked').exists()).toBe(false)
    }
  })

  it('показывает иконку 🔒 для неразблокированного достижения', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    const locked = store.allAchievements.find(a => !a.unlocked)
    if (locked) {
      wrapper.vm.showAchievementDetails(locked)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.achievement-icon-large').text()).toContain('🔒')
    }
  })

  it('показывает награду для разблокированного достижения', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    const unlocked = store.allAchievements.find(a => a.unlocked)
    if (unlocked) {
      wrapper.vm.showAchievementDetails({ ...unlocked, unlocked: true, unlockedAt: new Date() })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.achievement-unlocked').exists()).toBe(true)
      expect(wrapper.text()).toContain('Награда:')
      expect(wrapper.text()).toContain('⭐')
    }
  })

  it('закрывает модальное окно через closeModal', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    wrapper.vm.showAchievementDetails(store.allAchievements[0])
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedAchievement).not.toBeNull()

    wrapper.vm.closeModal()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedAchievement).toBeNull()
  })

  it('кнопка закрытия (×) закрывает модалку', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    wrapper.vm.showAchievementDetails(store.allAchievements[0])
    await wrapper.vm.$nextTick()

    await wrapper.find('.close-button').trigger('click')
    expect(wrapper.vm.selectedAchievement).toBeNull()
  })

  it('клик на modal-content не закрывает модалку (stopPropagation)', async () => {
    const wrapper = mount(AchievementsView)
    const store = useAchievementsStore()

    wrapper.vm.showAchievementDetails(store.allAchievements[0])
    await wrapper.vm.$nextTick()

    await wrapper.find('.modal-content').trigger('click')
    expect(wrapper.vm.selectedAchievement).not.toBeNull()
  })
})
