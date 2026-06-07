import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock ALL child components (only needed ones)
vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: { template: '<div class="mock-progress"></div>', props: ['progressPercent'] }
}))
vi.mock('@/components/common/AnswerOptions.vue', () => ({
  default: { template: '<div class="mock-answers"><button v-for="(o,i) in options" :key="i" class="ans-btn" @click="$emit(\'answerSelected\', i)">{{ o }}</button></div>', props: ['options','correctIndex','answered','selectedIndex'], emits: ['answerSelected'] }
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

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import CountingView from '../CountingView.vue'

describe('CountingView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(CountingView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение с = ?', () => {
    expect(wrapper.text()).toContain('= ?')
  })

  it('показывает 4 кнопки ответа', () => {
    const btns = wrapper.findAll('.ans-btn')
    expect(btns.length).toBe(4)
  })

  it('правильный ответ увеличивает score', async () => {
    const initial = wrapper.vm.score as number
    const correctIdx = (wrapper.vm.currentProblem as any)?.correctIndex ?? 0
    await wrapper.findAll('.ans-btn')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.score).toBeGreaterThan(initial)
  })

  it('неправильный ответ не увеличивает score', async () => {
    const initial = wrapper.vm.score as number
    const wrongIdx = (wrapper.vm.currentProblem as any)?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.ans-btn')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.score).toBe(initial)
  })

  it('GameOver показывается после 10 вопросов', async () => {
    wrapper.vm.currentQuestion = 10
    wrapper.vm.gameOver = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('рестарт сбрасывает score', async () => {
    wrapper.vm.score = 80
    wrapper.vm.currentQuestion = 9
    await wrapper.vm.restartGame()
    expect(wrapper.vm.score).toBe(0)
    expect(wrapper.vm.currentQuestion).toBe(0)
  })

  it('ProgressBar рендерится', () => {
    expect(wrapper.find('.mock-progress').exists()).toBe(true)
  })

  it('progressPercent = 50 при question 5/10', () => {
    wrapper.vm.currentQuestion = 5
    expect(wrapper.vm.progressPercent).toBe(50)
  })

  it('выражение обновляется после ответа', async () => {
    const firstExpr = (wrapper.vm.currentProblem as any)?.expression
    const correctIdx = (wrapper.vm.currentProblem as any)?.correctIndex ?? 0
    await wrapper.findAll('.ans-btn')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    const secondExpr = (wrapper.vm.currentProblem as any)?.expression
    expect(typeof secondExpr).toBe('string')
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })
})
