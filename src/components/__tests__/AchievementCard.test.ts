import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementCard from '../AchievementCard.vue'
import type { Achievement } from '@/types/achievements'

describe('AchievementCard', () => {
  const mockAchievement: Achievement = {
    id: 'test_achievement',
    name: 'Test Achievement',
    description: 'This is a test achievement',
    icon: '🏆',
    category: 'points',
    condition: {
      type: 'total_points',
      target: 100
    },
    reward: 10,
    unlocked: false,
    progress: 50
  }

  const mockUnlockedAchievement: Achievement = {
    ...mockAchievement,
    unlocked: true,
    unlockedAt: new Date('2024-01-01'),
    progress: 100
  }

  it('должен рендерить заблокированное достижение', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement }
    })

    expect(wrapper.find('.achievement-title').text()).toBe('Test Achievement')
    expect(wrapper.find('.achievement-description').text()).toBe('This is a test achievement')
    expect(wrapper.find('.achievement-icon').text()).toBe('🔒')
    expect(wrapper.find('.achievement-category').text()).toContain('Очки')
    expect(wrapper.find('.achievement-card').classes()).not.toContain('unlocked')
  })

  it('должен рендерить разблокированное достижение', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockUnlockedAchievement }
    })

    expect(wrapper.find('.achievement-card').classes()).toContain('unlocked')
    expect(wrapper.find('.achievement-reward').exists()).toBe(true)
    expect(wrapper.find('.achievement-reward').text()).toContain('10')
    expect(wrapper.find('.achievement-date').exists()).toBe(true)
  })

  it('должен показывать прогресс для незаблокированного достижения', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement }
    })

    expect(wrapper.find('.achievement-progress').exists()).toBe(true)
    expect(wrapper.find('.progress-fill').attributes('style')).toContain('width: 50%')
    expect(wrapper.find('.progress-text').text()).toContain('50%')
  })

  it('не должен показывать прогресс для разблокированного достижения', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockUnlockedAchievement }
    })

    expect(wrapper.find('.achievement-progress').exists()).toBe(false)
  })

  it('должен эмитить событие при клике', async () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement }
    })

    await wrapper.find('.achievement-card').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([mockAchievement])
  })

  it('не должен быть кликабельным, если свойство clickable=false', async () => {
    const wrapper = mount(AchievementCard, {
      props: {
        achievement: mockAchievement,
        clickable: false
      }
    })

    await wrapper.find('.achievement-card').trigger('click')

    expect(wrapper.emitted()).not.toHaveProperty('click')
  })

  it('должен правильно форматировать дату разблокировки', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockUnlockedAchievement }
    })

    const dateText = wrapper.find('.achievement-date').text()
    expect(dateText).toContain('Получено:')
    expect(dateText).toContain('1 января')
  })
})