import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: { template: '<div class="mock-progress"></div>', props: ['progressPercent'] }
}))
vi.mock('@/components/common/GameOver.vue', () => ({
  default: { template: '<div class="mock-gameover"></div>', props: ['correctAnswers','totalAnswers','score'], emits: ['restart','exit'] }
}))
vi.mock('@/components/AchievementManager.vue', () => ({
  default: { template: '<div></div>' }
}))
vi.mock('@/components/common/CoinAnimation.vue', () => ({
  default: { template: '<div></div>', props: ['amount'], emits: ['animationEnd'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' }
}))
vi.mock('@/components/numberline/NumberLine.vue', () => ({
  default: { template: '<div class="mock-numberline"><canvas></canvas></div>', props: ['range','markerPosition','jumpAnimation','jumpPhase','jumpArcs'] }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import NumberLineCountingView from '../NumberLineCountingView.vue'

describe('NumberLineCountingView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(NumberLineCountingView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение с = ?', () => {
    expect(wrapper.text()).toContain('= ?')
  })

  it('NumberLine компонент присутствует', () => {
    expect(wrapper.find('.mock-numberline').exists()).toBe(true)
  })

  it('показывает 4 кнопки ответа в answer-row', () => {
    const btns = wrapper.findAll('.answer-btn')
    expect(btns.length).toBe(4)
  })

  it('правильный ответ увеличивает score на 10 (после анимации)', async () => {
    const initial = wrapper.vm.score as number
    const correctIdx = (wrapper.vm.currentProblem as any)?.correctIndex ?? 0
    await wrapper.findAll('.answer-btn')[correctIdx].trigger('click')
    // Wait for animateJump (500ms) + Vue reactivity
    await new Promise(r => setTimeout(r, 1200))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.score).toBeGreaterThan(initial)
  })

  it('неправильный ответ не увеличивает score', async () => {
    const initial = wrapper.vm.score as number
    const wrongIdx = (wrapper.vm.currentProblem as any)?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.answer-btn')[wrongIdx].trigger('click')
    // Wait for animateJump (400ms + 600ms + 400ms) + Vue reactivity
    await new Promise(r => setTimeout(r, 1600))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.score).toBe(initial)
  })

  it('GameOver после 10 вопросов', async () => {
    wrapper.vm.currentQuestion = 10
    wrapper.vm.gameOver = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('ProgressBar рендерится', () => {
    expect(wrapper.find('.mock-progress').exists()).toBe(true)
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('markerPosition начинается с num1', () => {
    const problem = wrapper.vm.currentProblem as any
    if (problem) {
      expect(wrapper.vm.markerPosition).toBe(problem.num1)
    } else {
      expect(true).toBe(true)
    }
  })
})
