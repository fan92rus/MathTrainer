import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import GameOver from '../common/GameOver.vue'

describe('GameOver', () => {
  function mountGameOver(props: { correctAnswers: number; totalAnswers: number; score: number }): VueWrapper {
    return mount(GameOver, { props })
  }

  it('рендерится без ошибок', () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок "Игра окончена!"', () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    expect(wrapper.text()).toContain('Игра окончена!')
  })

  it('показывает correctAnswers / totalAnswers', () => {
    const wrapper = mountGameOver({ correctAnswers: 7, totalAnswers: 10, score: 70 })
    expect(wrapper.text()).toContain('7')
    expect(wrapper.text()).toContain('10')
  })

  it('показывает score', () => {
    const wrapper = mountGameOver({ correctAnswers: 7, totalAnswers: 10, score: 70 })
    expect(wrapper.text()).toContain('70')
  })

  it('рендерит StarRating', () => {
    const wrapper = mountGameOver({ correctAnswers: 7, totalAnswers: 10, score: 70 })
    expect(wrapper.findComponent({ name: 'StarRating' }).exists()).toBe(true)
  })

  it('показывает кнопку "Играть снова"', () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    const btn = wrapper.find('.restart-button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Играть снова')
  })

  it('показывает кнопку "Выйти"', () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    const btn = wrapper.find('.main-button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Выйти')
  })

  it('restartGame эмитит restart', async () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    await wrapper.find('.restart-button').trigger('click')
    expect(wrapper.emitted('restart')).toBeDefined()
    expect(wrapper.emitted('restart')?.length).toBe(1)
  })

  it('exit эмитит exit', async () => {
    const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
    await wrapper.find('.main-button').trigger('click')
    expect(wrapper.emitted('exit')).toBeDefined()
    expect(wrapper.emitted('exit')?.length).toBe(1)
  })

  describe('accuracy tiers', () => {
    it('accuracy >= 90: "Математический гений!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 9, totalAnswers: 10, score: 90 })
      expect(wrapper.text()).toContain('Математический гений!')
    })

    it('accuracy >= 75: "Отличный результат!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 8, totalAnswers: 10, score: 80 })
      expect(wrapper.text()).toContain('Отличный результат!')
      expect(wrapper.text()).not.toContain('Математический гений!')
    })

    it('accuracy >= 60: "Хорошая работа!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 6, totalAnswers: 10, score: 60 })
      expect(wrapper.text()).toContain('Хорошая работа!')
      expect(wrapper.text()).not.toContain('Математический гений!')
      expect(wrapper.text()).not.toContain('Отличный результат!')
    })

    it('accuracy < 60: "Продолжай учиться!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 5, totalAnswers: 10, score: 50 })
      expect(wrapper.text()).toContain('Продолжай учиться!')
    })

    it('accuracy = 100 (all correct): "Математический гений!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 10, totalAnswers: 10, score: 100 })
      expect(wrapper.text()).toContain('Математический гений!')
    })

    it('accuracy = 0 (all wrong): "Продолжай учиться!"', () => {
      const wrapper = mountGameOver({ correctAnswers: 0, totalAnswers: 10, score: 0 })
      expect(wrapper.text()).toContain('Продолжай учиться!')
    })

    it('totalAnswers = 0 не вызывает ошибок (accuracy=0)', () => {
      const wrapper = mountGameOver({ correctAnswers: 0, totalAnswers: 0, score: 0 })
      expect(wrapper.text()).toContain('Продолжай учиться!')
    })
  })
})
