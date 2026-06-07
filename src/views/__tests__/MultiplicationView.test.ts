import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div></div>' }
}))
vi.mock('@/components/common/CoinAnimation.vue', () => ({
  default: { template: '<div></div>', props: ['amount'], emits: ['animationEnd'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' }
}))
vi.mock('@/components/common/GameOver.vue', () => ({
  default: { template: '<div class="mock-gameover"></div>', props: ['correctAnswers','totalAnswers','score'], emits: ['restart','exit'] }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import MultiplicationView from '../MultiplicationView.vue'

describe('MultiplicationView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(MultiplicationView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение с = ?', () => {
    expect(wrapper.text()).toContain('= ?')
  })

  it('показывает таблицу умножения заголовок', () => {
    expect(wrapper.text()).toContain('Таблица умножения')
  })

  it('показывает 4 option-card кнопки', () => {
    const btns = wrapper.findAll('.option-card')
    expect(btns.length).toBe(4)
  })

  it('правильный ответ показывает feedback', async () => {
    const problem = wrapper.vm.currentProblem as any
    const correctIdx = problem?.correctIndex ?? 0
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showFeedback).toBe(true)
    expect(wrapper.vm.isCorrect).toBe(true)
    expect(wrapper.vm.correctAnswers).toBe(1)
  })

  it('неправильный ответ показывает incorrect feedback', async () => {
    const problem = wrapper.vm.currentProblem as any
    const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showFeedback).toBe(true)
    expect(wrapper.vm.isCorrect).toBe(false)
    expect(wrapper.vm.correctAnswers).toBe(0)
  })

  it('можно ответить снова после неправильного ответа', async () => {
    const problem = wrapper.vm.currentProblem as any
    const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
    const correctIdx = problem?.correctIndex ?? 0
    // Wrong answer first
    await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    // Then correct answer
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.correctAnswers).toBe(1)
    expect(wrapper.vm.totalAnswers).toBe(2)
  })

  it('GameOver после showGameOver = true', async () => {
    wrapper.vm.showGameOver = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('рестарт сбрасывает состояние', async () => {
    wrapper.vm.correctAnswers = 5
    wrapper.vm.totalAnswers = 7
    await wrapper.vm.restartGame()
    expect(wrapper.vm.correctAnswers).toBe(0)
    expect(wrapper.vm.totalAnswers).toBe(0)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('отображает текущий множитель maxMultiplier', () => {
    expect(wrapper.vm.maxMultiplier).toBeGreaterThanOrEqual(1)
  })

  it('scoreGained показывает набранные очки', () => {
    expect(wrapper.vm.scoreGained).toBeGreaterThanOrEqual(0)
  })
})
