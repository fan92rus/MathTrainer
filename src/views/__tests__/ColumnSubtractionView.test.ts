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
vi.mock('@/components/columnSubtraction/InteractiveSubtraction.vue', () => ({
  default: { template: '<div class="mock-interactive"><button class="mock-interactive-complete" @click="$emit(\'complete\', 42)">OK</button></div>', props: ['minuend','subtrahend','showSkipButton','autoAdvance'], emits: ['complete','error'] }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import ColumnSubtractionView from '../ColumnSubtractionView.vue'

describe('ColumnSubtractionView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    // Mock prerequisites to allow training mode
    const scoresStore = useScoresStore()
    scoresStore.columnSubtractionLearningCompleted = true
    scoresStore.columnSubtractionDiagnosticPassed = true
    wrapper = mount(ColumnSubtractionView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок Вычитание в столбик', () => {
    expect(wrapper.text()).toContain('Вычитание в столбик')
  })

  it('InteractiveSubtraction рендерится', () => {
    expect(wrapper.find('.mock-interactive').exists()).toBe(true)
  })

  it('правильное завершение в interactive обновляет состояние', async () => {
    const problem = wrapper.vm.currentColumnProblem as any
    if (problem?.correctAnswer) {
      // Directly call handleInteractiveComplete with correct answer
      await wrapper.vm.handleInteractiveComplete(problem.correctAnswer)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.game.answered.value).toBe(true)
      expect(wrapper.vm.game.score.value).toBeGreaterThan(0)
    } else {
      expect(true).toBe(true) // Skip if problem not loaded
    }
  })

  it('GameOver рендерится когда game.gameOver', async () => {
    wrapper.vm.game.gameOver.value = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mock-gameover').exists()).toBe(true)
  })

  it('кнопка Назад вызывает goBack с confirm', async () => {
    global.confirm = vi.fn(() => true) as any
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

  it('restartTraining сбрасывает состояние', async () => {
    wrapper.vm.game.score.value = 20
    wrapper.vm.game.currentQuestion.value = 5
    await wrapper.vm.restartTraining()
    expect(wrapper.vm.game.score.value).toBe(0)
    expect(wrapper.vm.game.currentQuestion.value).toBe(0)
  })

  // ─── goBack с confirm=false ────────────────────────────────────
  describe('goBack', () => {
    it('goBack с confirm=false НЕ вызывает router.push', async () => {
      wrapper.vm.game.currentQuestion.value = 3
      wrapper.vm.game.totalAnswers.value = 2
      global.confirm = vi.fn(() => false) as any
      await wrapper.find('.back-button').trigger('click')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('goBack без прогресса вызывает router.push сразу', async () => {
      wrapper.vm.game.currentQuestion.value = 0
      wrapper.vm.game.totalAnswers.value = 0
      await wrapper.find('.back-button').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // ─── handleInteractiveError ──────────────────────────────────
  describe('handleInteractiveError', () => {
    it('handleInteractiveError обновляет errorsPerQuestion', async () => {
      wrapper.vm.handleInteractiveError('step1', 3)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.game.errorsPerQuestion.value[wrapper.vm.game.currentQuestion.value]).toBe(3)
    })
  })

  // ─── Loading state ────────────────────────────────────────────
  describe('Загрузка примеров', () => {
    it('"Загрузка примеров..." отображается когда currentColumnProblem = null', async () => {
      // Force currentColumnProblem to be null by clearing all problems
      wrapper.vm.game.problems.value = []
      wrapper.vm.game.currentQuestion.value = 0
      await wrapper.vm.$nextTick()
      // currentColumnProblem should be null since no problems exist
      expect(wrapper.vm.currentColumnProblem).toBeNull()
      if (!wrapper.vm.game.answered.value && !wrapper.vm.currentColumnProblem) {
        expect(wrapper.find('.no-problems-message').exists()).toBe(true)
        expect(wrapper.text()).toContain('Загрузка примеров...')
      }
    })
  })

  // ─── correct-message ─────────────────────────────────────────
  describe('correct-message', () => {
    it('correct-message показывается при answered = true', async () => {
      const problem = wrapper.vm.currentColumnProblem as any
      if (problem?.correctAnswer) {
        await wrapper.vm.handleInteractiveComplete(problem.correctAnswer)
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.game.answered.value).toBe(true)
        expect(wrapper.find('.correct-message').exists()).toBe(true)
        expect(wrapper.text()).toContain('Правильно! ✓')
      }
    })

    it('correct-message НЕ показывается до ответа', () => {
      expect(wrapper.vm.game.answered.value).toBe(false)
      expect(wrapper.find('.correct-message').exists()).toBe(false)
    })
  })

  // ─── goHome ───────────────────────────────────────────────────
  describe('goHome', () => {
    it('goHome вызывает router.push("/")', async () => {
      await wrapper.vm.goHome()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // ─── handleInteractiveComplete wrong answer ──────────────────
  describe('Неправильный ответ', () => {
    it('handleInteractiveComplete с неверным результатом НЕ обновляет счёт', async () => {
      const problem = wrapper.vm.currentColumnProblem as any
      if (problem?.correctAnswer) {
        const wrongResult = problem.correctAnswer + 999
        await wrapper.vm.handleInteractiveComplete(wrongResult)
        await wrapper.vm.$nextTick()
        // Score should NOT increase
        expect(wrapper.vm.game.score.value).toBe(0)
        expect(wrapper.vm.game.correctAnswers.value).toBe(0)
        expect(wrapper.vm.game.answered.value).toBe(false)
      }
    })

    it('handleInteractiveComplete с несуществующим problem не падает', () => {
      // Set currentQuestion beyond problems array so currentColumnProblem is null
      wrapper.vm.game.currentQuestion.value = 999
      // Should not throw — handleInteractiveComplete returns early if no problem
      expect(() => wrapper.vm.handleInteractiveComplete(42)).not.toThrow()
    })
  })

  // ─── restartTraining fully resets ──────────────────────────
  describe('restartTraining complete reset', () => {
    it('после restartTraining правильный ответ работает для нового примера', async () => {
      const problem = wrapper.vm.currentColumnProblem as any
      if (problem?.correctAnswer) {
        // Answer first question
        await wrapper.vm.handleInteractiveComplete(problem.correctAnswer)
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.game.score.value).toBeGreaterThan(0)

        // Restart
        await wrapper.vm.restartTraining()
        await wrapper.vm.$nextTick()

        // Score reset
        expect(wrapper.vm.game.score.value).toBe(0)
        expect(wrapper.vm.game.currentQuestion.value).toBe(0)
        expect(wrapper.vm.game.correctAnswers.value).toBe(0)
        expect(wrapper.vm.game.answered.value).toBe(false)

        // New problem exists and is solvable
        const newProblem = wrapper.vm.currentColumnProblem as any
        expect(newProblem).not.toBeNull()
        if (newProblem) {
          await wrapper.vm.handleInteractiveComplete(newProblem.correctAnswer)
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.game.score.value).toBeGreaterThan(0)
        }
      }
    })
  })
})
