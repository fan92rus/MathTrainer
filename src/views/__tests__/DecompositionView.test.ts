import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useScoresStore } from '@/store/scores'

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

import DecompositionView from '../DecompositionView.vue'

describe('DecompositionView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(DecompositionView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает выражение', () => {
    const expr = wrapper.vm.currentProblem as any
    expect(expr?.expression).toBeTruthy()
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

  it('GameOver после 10 вопросов', async () => {
    wrapper.vm.currentQuestion = 10
    wrapper.vm.gameOver = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('рестарт сбрасывает счёт', async () => {
    wrapper.vm.score = 5
    wrapper.vm.currentQuestion = 7
    await wrapper.vm.restartGame()
    expect(wrapper.vm.score).toBe(0)
    expect(wrapper.vm.currentQuestion).toBe(0)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('не показывает manual-mode при score < 30', () => {
    expect(wrapper.find('.manual-mode-container').exists()).toBe(false)
  })

  it('показывает manual-mode при totalScore >= 30', async () => {
    const scoresStore = useScoresStore()
    scoresStore.decompositionScore = 30
    wrapper.vm.totalScore = 30
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.manual-mode-button').exists()).toBe(true)
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

  it('progressPercent = 50 при question 5/10', () => {
    wrapper.vm.currentQuestion = 5
    expect(wrapper.vm.progressPercent).toBe(50)
  })
})
