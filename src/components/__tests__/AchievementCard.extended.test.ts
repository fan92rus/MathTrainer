import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementCard from '../AchievementCard.vue'
import type { Achievement } from '@/types/achievements'

function createAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'test_ach',
    name: 'Test Achievement',
    description: 'A test achievement description',
    icon: '🏆',
    category: 'points',
    condition: { type: 'total_points', target: 100 },
    reward: 50,
    unlocked: false,
    unlockedAt: undefined,
    progress: 0,
    ...overrides,
  }
}

describe('AchievementCard', () => {
  it('рендерится с переданным achievement', () => {
    const ach = createAchievement()
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Achievement')
    expect(wrapper.text()).toContain('A test achievement description')
  })

  it('показывает иконку достижения если unlocked', () => {
    const ach = createAchievement({ unlocked: true, icon: '🌟' })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.text()).toContain('🌟')
    expect(wrapper.text()).not.toContain('🔒')
  })

  it('показывает 🔒 если locked', () => {
    const ach = createAchievement({ unlocked: false })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.text()).toContain('🔒')
  })

  it('имеет класс unlocked когда achievement.unlocked = true', () => {
    const ach = createAchievement({ unlocked: true })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.classes()).toContain('unlocked')
  })

  it('НЕ имеет класс unlocked когда achievement.unlocked = false', () => {
    const ach = createAchievement({ unlocked: false })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.classes()).not.toContain('unlocked')
  })

  it('имеет класс hidden для hidden категории когда locked', () => {
    const ach = createAchievement({ category: 'hidden', unlocked: false })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.classes()).toContain('hidden')
  })

  it('НЕ имеет класс hidden для hidden категории когда unlocked', () => {
    const ach = createAchievement({ category: 'hidden', unlocked: true })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.classes()).not.toContain('hidden')
  })

  it('показывает прогресс бар когда locked и progress определён', () => {
    const ach = createAchievement({ unlocked: false, progress: 60 })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-progress').exists()).toBe(true)
    expect(wrapper.text()).toContain('60%')
  })

  it('НЕ показывает прогресс бар когда unlocked', () => {
    const ach = createAchievement({ unlocked: true, progress: 60 })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-progress').exists()).toBe(false)
  })

  it('показывает награду когда unlocked', () => {
    const ach = createAchievement({ unlocked: true, reward: 100 })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-reward').exists()).toBe(true)
    expect(wrapper.text()).toContain('+100')
  })

  it('показывает дату получения когда unlocked и unlockedAt задан', () => {
    const ach = createAchievement({ unlocked: true, unlockedAt: new Date('2025-01-15') })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-date').exists()).toBe(true)
    expect(wrapper.text()).toContain('2025')
  })

  it('НЕ показывает дату когда unlockedAt undefined', () => {
    const ach = createAchievement({ unlocked: true, unlockedAt: undefined })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-date').exists()).toBe(false)
  })

  it('показывает glow эффект когда unlocked', () => {
    const ach = createAchievement({ unlocked: true })
    const wrapper = mount(AchievementCard, { props: { achievement: ach } })
    expect(wrapper.find('.achievement-glow').exists()).toBe(true)
  })

  it('эмитит click при клике когда clickable = true', async () => {
    const ach = createAchievement()
    const wrapper = mount(AchievementCard, { props: { achievement: ach, clickable: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeDefined()
    expect(wrapper.emitted('click')![0][0]).toEqual(ach)
  })

  it('НЕ эмитит click при клике когда clickable = false', async () => {
    const ach = createAchievement()
    const wrapper = mount(AchievementCard, { props: { achievement: ach, clickable: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  describe('getProgressText', () => {
    it('total_points условие показывает "очков"', () => {
      const ach = createAchievement({ unlocked: false, condition: { type: 'total_points', target: 100 }, progress: 50 })
      const wrapper = mount(AchievementCard, { props: { achievement: ach } })
      expect(wrapper.find('.progress-text').text()).toContain('100 очков')
    })

    it('correct_streak условие показывает "подряд"', () => {
      const ach = createAchievement({ unlocked: false, condition: { type: 'correct_streak', target: 10 }, progress: 30 })
      const wrapper = mount(AchievementCard, { props: { achievement: ach } })
      expect(wrapper.find('.progress-text').text()).toContain('10 подряд')
    })

    it('time_challenge условие показывает "примеров"', () => {
      const ach = createAchievement({ unlocked: false, condition: { type: 'time_challenge', target: 20 }, progress: 50 })
      const wrapper = mount(AchievementCard, { props: { achievement: ach } })
      expect(wrapper.find('.progress-text').text()).toContain('20 примеров')
    })

    it('try_all_exercises показывает "Все типы"', () => {
      const ach = createAchievement({ unlocked: false, condition: { type: 'try_all_exercises', target: 1 }, progress: 50 })
      const wrapper = mount(AchievementCard, { props: { achievement: ach } })
      expect(wrapper.find('.progress-text').text()).toContain('Все типы')
    })

    it('all_exercises_complete показывает "Все упражнения"', () => {
      const ach = createAchievement({ unlocked: false, condition: { type: 'all_exercises_complete', target: 1 }, progress: 50 })
      const wrapper = mount(AchievementCard, { props: { achievement: ach } })
      expect(wrapper.find('.progress-text').text()).toContain('Все упражнения')
    })
  })
})
