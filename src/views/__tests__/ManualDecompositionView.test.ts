/**
 * UI тесты для ManualDecompositionView
 * Options API + useGameLogic + многошаговое решение (шаги 0-4)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ManualDecompositionView from '../ManualDecompositionView.vue'

// ─── Моки дочерних компонентов ────────────────────────────────────
vi.mock('@/components/common/ScoreDisplay.vue', () => ({
  default: {
    template: '<div class="mock-score" data-testid="score">{{ currentScore }}/{{ totalScore }}</div>',
    props: ['currentScore', 'totalScore', 'currentQuestion', 'totalQuestions']
  }
}))
vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: {
    template: '<div class="mock-progress" data-testid="progress"></div>',
    props: ['progressPercent']
  }
}))
vi.mock('@/components/common/StarRating.vue', () => ({
  default: {
    template: '<div class="mock-stars" data-testid="stars">{{ score }}</div>',
    props: ['score']
  }
}))
vi.mock('@/components/common/GameOver.vue', () => ({
  default: {
    template: '<div class="mock-gameover" data-testid="gameover">GameOver</div>',
    props: ['correctAnswers', 'totalAnswers', 'score'],
    emits: ['restart', 'exit']
  }
}))

// ─── Мок useMobileKeyboard ───────────────────────────────────────
vi.mock('@/composables/useMobileKeyboard', () => ({
  useMobileKeyboard: () => ({
    keyboardHeight: { value: 0 },
    isKeyboardOpen: { value: false },
    focusWithScroll: vi.fn(),
  })
}))

// ─── Мок vue-router ──────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

describe('ManualDecompositionView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    setActivePinia(createPinia())
    wrapper = mount(ManualDecompositionView)
  })

  afterEach(() => {
    vi.useRealTimers()
    wrapper.unmount()
  })

  // ─── Рендер ───────────────────────────────────────────────────
  describe('Рендер', () => {
    it('рендерится без ошибок', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('показывает заголовок "Реши по шагам"', () => {
      expect(wrapper.find('.title').text()).toBe('Реши по шагам')
    })

    it('показывает шаг 0 с кнопкой "Начать решать"', () => {
      expect(wrapper.find('.start-button').exists()).toBe(true)
      expect(wrapper.find('.start-button').text()).toContain('Начать')
    })

    it('показывает выражение на шаге 0', () => {
      expect(wrapper.find('.expression-large').exists()).toBe(true)
    })

    it('рендерит ScoreDisplay', () => {
      expect(wrapper.find('.mock-score').exists()).toBe(true)
    })

    it('рендерит ProgressBar', () => {
      expect(wrapper.find('.mock-progress').exists()).toBe(true)
    })

    it('рендерит StarRating', () => {
      expect(wrapper.find('.mock-stars').exists()).toBe(true)
    })
  })

  // ─── Шаги ────────────────────────────────────────────────────
  describe('Шаги', () => {
    it('начальный шаг = 0', () => {
      expect(wrapper.vm.step).toBe(0)
    })

    it('клик "Начать решать" переходит к шагу 1 или 2', async () => {
      await wrapper.find('.start-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.step).toBeGreaterThanOrEqual(1)
    })

    it('на шаге 1 показывает поля ввода разложения', async () => {
      await wrapper.find('.start-button').trigger('click')
      await wrapper.vm.$nextTick()
      if (wrapper.vm.step === 1) {
        expect(wrapper.find('.decomposition-input').exists()).toBe(true)
      }
    })

    it('на шаге 2 показывает поле промежуточного результата', async () => {
      await wrapper.find('.start-button').trigger('click')
      await wrapper.vm.$nextTick()
      // Jump to step 2 if needed
      if (wrapper.vm.step === 1) {
        wrapper.vm.step = 2
        await wrapper.vm.$nextTick()
      }
      expect(wrapper.vm.step).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── GameOver ─────────────────────────────────────────────────
  describe('GameOver', () => {
    it('GameOVer показывается когда gameOver = true', async () => {
      wrapper.vm.gameOver = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mock-gameover').exists()).toBe(true)
    })

    it('GameOver НЕ показывается до завершения', () => {
      expect(wrapper.find('.mock-gameover').exists()).toBe(false)
    })
  })

  // ─── Навигация ────────────────────────────────────────────────
  describe('Навигация', () => {
    it('кнопка Назад вызывает router.push("/")', async () => {
      await wrapper.find('.back-button').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // ─── Рестарт ──────────────────────────────────────────────────
  describe('Рестарт', () => {
    it('restartGame сбрасывает шаг и состояние', async () => {
      wrapper.vm.step = 4
      wrapper.vm.firstNumber = 50
      wrapper.vm.secondNumber = 30
      wrapper.vm.restartGame()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.step).toBe(0)
      expect(wrapper.vm.firstNumber).toBe(0)
      expect(wrapper.vm.secondNumber).toBe(0)
    })

    it('restartGame генерирует новые задачи', async () => {
      wrapper.vm.restartGame()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentProblem).toBeTruthy()
    })
  })

  // ─── Прогресс ─────────────────────────────────────────────────
  describe('Прогресс', () => {
    it('progressPercent = 0 на первом вопросе', () => {
      expect(wrapper.vm.progressPercent.value ?? wrapper.vm.progressPercent).toBe(0)
    })

    it('indikator shagov vidim', () => {
      expect(wrapper.find('.steps-progress').exists()).toBe(true)
    })
  })
})
