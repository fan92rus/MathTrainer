import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/common/ScoreDisplay.vue', () => ({
  default: { template: '<div class="mock-score">{{ currentScore }}/{{ totalScore }}</div>', props: ['currentScore','totalScore','currentQuestion','totalQuestions'] }
}))
vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: { template: '<div class="mock-progress"></div>', props: ['progressPercent'] }
}))
vi.mock('@/components/common/StarRating.vue', () => ({
  default: { template: '<div class="mock-stars">{{ score }}</div>', props: ['score'] }
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

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import { useScoresStore } from '@/store/scores'
import EquationsView from '../EquationsView.vue'

describe('EquationsView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(EquationsView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение с x', () => {
    const expr = (wrapper.vm.currentProblem as any)?.expression || ''
    expect(expr.length).toBeGreaterThan(0)
  })

  it('показывает 4 кнопки ответа', () => {
    expect(wrapper.findAll('.ans-btn').length).toBe(4)
  })

  it('правильный ответ увеличивает score на 10', async () => {
    const initial = wrapper.vm.score as number
    const correctIdx = (wrapper.vm.currentProblem as any)?.correctIndex ?? 0
    await wrapper.findAll('.ans-btn')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    // basePoints = 10 при 0 ошибок
    expect(wrapper.vm.score).toBe(initial + 10)
  })

  it('неправильный ответ не увеличивает score', async () => {
    const initial = wrapper.vm.score as number
    const wrongIdx = (wrapper.vm.currentProblem as any)?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.ans-btn')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.score).toBe(initial)
  })

  it('GameOver после 5 вопросов (totalQuestions=5)', async () => {
    wrapper.vm.currentQuestion = 5
    wrapper.vm.gameOver = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('рестарт сбрасывает счёт', async () => {
    wrapper.vm.score = 6
    wrapper.vm.currentQuestion = 8
    await wrapper.vm.restartGame()
    expect(wrapper.vm.score).toBe(0)
    expect(wrapper.vm.currentQuestion).toBe(0)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('ScoreDisplay рендерится', () => {
    expect(wrapper.find('.mock-score').exists()).toBe(true)
  })

  it('ProgressBar рендерится', () => {
    expect(wrapper.find('.mock-progress').exists()).toBe(true)
  })

  it('StarRating рендерится', () => {
    expect(wrapper.find('.mock-stars').exists()).toBe(true)
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('progressPercent = 100 при question 5/5 (totalQuestions=5)', () => {
    wrapper.vm.currentQuestion = 5
    expect(wrapper.vm.progressPercent).toBe(100)
  })

  it('nextLevelInfo показывается когда есть следующий уровень', async () => {
    const store = useScoresStore()
    store.equationsScore = 30 // Will give nextLevelInfo
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.nextLevelInfo).toBeTruthy()
    expect(wrapper.find('.level-progress').exists()).toBe(true)
  })

  it('manual-mode кнопка видна при totalScore >= 50', async () => {
    const store = useScoresStore()
    store.equationsScore = 50
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.manual-mode-button').exists()).toBe(true)
  })

  it('manual-mode кнопка НЕ видна при totalScore < 50', () => {
    expect(wrapper.find('.manual-mode-button').exists()).toBe(false)
  })

  it('goToManualMode вызывает router.push', async () => {
    const store = useScoresStore()
    store.equationsScore = 50
    await wrapper.vm.$nextTick()
    await wrapper.find('.manual-mode-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/manual-equations')
  })
})
