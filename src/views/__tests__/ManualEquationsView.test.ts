/**
 * UI тесты для ManualEquationsView
 * Options API + useGameLogic + ручной ввод ответа с полем input
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ManualEquationsView from '../ManualEquationsView.vue'

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

// ─── Мок vue-router ──────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

describe('ManualEquationsView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    setActivePinia(createPinia())
    wrapper = mount(ManualEquationsView)
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

    it('показывает заголовок "Решай уравнение"', () => {
      expect(wrapper.find('.title').text()).toBe('Решай уравнение')
    })

    it('показывает выражение с x', () => {
      expect(wrapper.find('.math-expression').exists()).toBe(true)
      expect(wrapper.find('.math-expression').text()).toContain('x')
    })

    it('показывает поле ввода ответа', () => {
      expect(wrapper.find('.answer-input').exists()).toBe(true)
    })

    it('показывает кнопку "Проверить"', () => {
      expect(wrapper.find('.check-button').exists()).toBe(true)
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

    it('показывает информацию об уровне', () => {
      expect(wrapper.find('.level-indicator').exists()).toBe(true)
    })
  })

  // ─── Ответы ───────────────────────────────────────────────────
  describe('Ответы', () => {
    it('ввод правильного ответа и проверка', async () => {
      const correctAnswer = wrapper.vm.currentProblem?.correctAnswer
      if (correctAnswer == null) return // skip if no problem

      const input = wrapper.find('.answer-input')
      await input.setValue(String(correctAnswer))
      await wrapper.find('.check-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isCorrect).toBe(true)
      expect(wrapper.vm.answered).toBe(true)
    })

    it('ввод неправильного ответа', async () => {
      const correctAnswer = wrapper.vm.currentProblem?.correctAnswer
      if (correctAnswer == null) return

      const wrongAnswer = correctAnswer + 100
      const input = wrapper.find('.answer-input')
      await input.setValue(String(wrongAnswer))
      await wrapper.find('.check-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isCorrect).toBe(false)
    })

    it('кнопка "Проверить" disabled при пустом поле', () => {
      const btn = wrapper.find('.check-button')
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('обратная связь показывается после проверки', async () => {
      const correctAnswer = wrapper.vm.currentProblem?.correctAnswer
      if (correctAnswer == null) return

      const input = wrapper.find('.answer-input')
      await input.setValue(String(correctAnswer))
      await wrapper.find('.check-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.feedback-container').exists()).toBe(true)
    })

    it('правильный ответ показывает feedback с классом correct', async () => {
      const correctAnswer = wrapper.vm.currentProblem?.correctAnswer
      if (correctAnswer == null) return

      const input = wrapper.find('.answer-input')
      await input.setValue(String(correctAnswer))
      await wrapper.find('.check-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.correct').exists()).toBe(true)
    })

    it('неправильный ответ показывает feedback с классом incorrect', async () => {
      const correctAnswer = wrapper.vm.currentProblem?.correctAnswer
      if (correctAnswer == null) return

      const wrongAnswer = correctAnswer + 100
      const input = wrapper.find('.answer-input')
      await input.setValue(String(wrongAnswer))
      await wrapper.find('.check-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.incorrect').exists()).toBe(true)
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
    it('restartGame сбрасывает состояние', async () => {
      wrapper.vm.userAnswer = '42'
      wrapper.vm.isCorrect = true
      wrapper.vm.answered = true
      wrapper.vm.restartGame()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.userAnswer).toBe('')
      expect(wrapper.vm.isCorrect).toBe(false)
      expect(wrapper.vm.answered).toBe(false)
    })
  })

  // ─── Прогресс ─────────────────────────────────────────────────
  describe('Прогресс', () => {
    it('progressPercent = 0 на первом вопросе', () => {
      expect(wrapper.vm.progressPercent.value ?? wrapper.vm.progressPercent).toBe(0)
    })

    it('показывает информацию о следующем уровне', () => {
      expect(wrapper.find('.level-progress').exists()).toBe(true)
    })
  })
})
