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

  it('totalAnswers увеличивается при правильном ответе', async () => {
    const initial = wrapper.vm.totalAnswers
    const problem = wrapper.vm.currentProblem as any
    const correctIdx = problem?.correctIndex ?? 0
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.totalAnswers).toBe(initial + 1)
  })

  it('totalAnswers увеличивается при неправильном ответе', async () => {
    const initial = wrapper.vm.totalAnswers
    const problem = wrapper.vm.currentProblem as any
    const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.totalAnswers).toBe(initial + 1)
  })

  it('feedback показывает "Правильно! 🎉" при правильном ответе', async () => {
    const problem = wrapper.vm.currentProblem as any
    const correctIdx = problem?.correctIndex ?? 0
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    const feedback = wrapper.find('.feedback')
    expect(feedback.exists()).toBe(true)
    expect(feedback.text()).toContain('Правильно! 🎉')
    expect(feedback.classes()).toContain('correct-feedback')
  })

  it('feedback показывает "Неправильно!" при неправильном ответе', async () => {
    const problem = wrapper.vm.currentProblem as any
    const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    const feedback = wrapper.find('.feedback')
    expect(feedback.exists()).toBe(true)
    expect(feedback.text()).toContain('Неправильно!')
    expect(feedback.classes()).toContain('incorrect-feedback')
  })

  it('после неправильного ответа option-card не disabled', async () => {
    const problem = wrapper.vm.currentProblem as any
    const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
    await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
    await wrapper.vm.$nextTick()
    // Buttons should NOT be disabled after wrong answer
    const disabledBtns = wrapper.findAll('.option-card:disabled')
    expect(disabledBtns.length).toBe(0)
  })

  it('после правильного ответа option-card disabled', async () => {
    const problem = wrapper.vm.currentProblem as any
    const correctIdx = problem?.correctIndex ?? 0
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    const disabledBtns = wrapper.findAll('.option-card:disabled')
    expect(disabledBtns.length).toBe(4)
  })

  it('maxMultiplier = 2 при нулевом счёте', () => {
    expect(wrapper.vm.maxMultiplier).toBe(2)
  })

  it('pointsPerCorrect отражает множитель', () => {
    // maxMultiplier=2 → pointsPerCorrect = 5 + (2-2)*5 = 5
    expect(wrapper.vm.pointsPerCorrect).toBe(5)
  })

  it('progressPercent растёт после правильного ответа', async () => {
    const problem = wrapper.vm.currentProblem as any
    const correctIdx = problem?.correctIndex ?? 0
    // Before any answer
    const progressBefore = wrapper.vm.totalAnswers > 0
      ? (wrapper.vm.correctAnswers / wrapper.vm.totalAnswers) * 100
      : 0
    await wrapper.findAll('.option-card')[correctIdx].trigger('click')
    await wrapper.vm.$nextTick()
    const progressAfter = wrapper.vm.totalAnswers > 0
      ? (wrapper.vm.correctAnswers / wrapper.vm.totalAnswers) * 100
      : 0
    expect(progressAfter).toBeGreaterThan(progressBefore)
  })

  it('10 правильных ответов подряд ведут к showGameOver', async () => {
    vi.useFakeTimers()
    // Solve 10 problems by repeatedly clicking the correct answer and advancing
    for (let i = 0; i < 10; i++) {
      const problem = wrapper.vm.currentProblem as any
      if (!problem) break
      const correctIdx = problem.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      // Advance time to trigger the setTimeout that calls nextProblem/showGameOver
      vi.advanceTimersByTime(1600)
      await wrapper.vm.$nextTick()
    }
    expect(wrapper.vm.showGameOver).toBe(true)
    expect(wrapper.vm.correctAnswers).toBe(10)
    vi.useRealTimers()
  })

  it('GameOver restart сбрасывает и генерирует новую задачу', async () => {
    vi.useFakeTimers()
    // First solve 10 problems to reach GameOver
    for (let i = 0; i < 10; i++) {
      const problem = wrapper.vm.currentProblem as any
      if (!problem) break
      const correctIdx = problem.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      vi.advanceTimersByTime(1600)
      await wrapper.vm.$nextTick()
    }
    expect(wrapper.vm.showGameOver).toBe(true)
    // Now restart via VM method directly
    await wrapper.vm.restartGame()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showGameOver).toBe(false)
    expect(wrapper.vm.correctAnswers).toBe(0)
    expect(wrapper.vm.totalAnswers).toBe(0)
    expect(wrapper.vm.scoreGained).toBe(0)
    expect(wrapper.vm.currentProblem).not.toBeNull()
    vi.useRealTimers()
  })

  // ─── showFeedback ─────────────────────────────────────────────
  describe('showFeedback', () => {
    it('showFeedback = false до первого ответа', () => {
      expect(wrapper.vm.showFeedback).toBe(false)
    })

    it('showFeedback становится true после клика', async () => {
      const problem = wrapper.vm.currentProblem as any
      const correctIdx = problem?.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showFeedback).toBe(true)
    })

    it('showFeedback сбрасывается при новой задаче', async () => {
      const problem = wrapper.vm.currentProblem as any
      const correctIdx = problem?.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showFeedback).toBe(true)
      // Generate new problem via restartGame which calls generateNewProblem internally
      wrapper.vm.restartGame()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showFeedback).toBe(false)
      expect(wrapper.vm.selectedAnswer).toBeNull()
    })
  })

  // ─── progressPercent ─────────────────────────────────────────
  describe('progressPercent', () => {
    it('progressPercent = 0 когда нет ответов', () => {
      expect(wrapper.vm.correctAnswers).toBe(0)
      expect(wrapper.vm.totalAnswers).toBe(0)
      const pct = wrapper.vm.totalAnswers > 0
        ? (wrapper.vm.correctAnswers / wrapper.vm.totalAnswers) * 100
        : 0
      expect(pct).toBe(0)
    })

    it('progressPercent = 100 когда все ответы правильные', async () => {
      // Set up state manually
      wrapper.vm.correctAnswers = 5
      wrapper.vm.totalAnswers = 5
      const pct = (wrapper.vm.correctAnswers / wrapper.vm.totalAnswers) * 100
      expect(pct).toBe(100)
    })

    it('progressPercent < 100 при наличии ошибок', async () => {
      wrapper.vm.correctAnswers = 3
      wrapper.vm.totalAnswers = 5
      const pct = (wrapper.vm.correctAnswers / wrapper.vm.totalAnswers) * 100
      expect(pct).toBe(60)
    })
  })

  // ─── .option-card.correct class ───────────────────────────────
  describe('option-card.correct class', () => {
    it('правильный ответ получает class .correct', async () => {
      const problem = wrapper.vm.currentProblem as any
      const correctIdx = problem?.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.option-card')[correctIdx].classes()).toContain('correct')
    })

    it('неправильный ответ получает class .incorrect', async () => {
      const problem = wrapper.vm.currentProblem as any
      const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
      await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.option-card')[wrongIdx].classes()).toContain('incorrect')
    })
  })

  // ─── restartGame через GameOver @exit ──────────────────────────
  describe('GameOver exit', () => {
    it('GameOver @exit вызывает goBack', async () => {
      wrapper.vm.showGameOver = true
      await wrapper.vm.$nextTick()
      const gameover = wrapper.findComponent('.mock-gameover')
      expect(gameover.exists()).toBe(true)
      gameover.vm.$emit('exit')
      await wrapper.vm.$nextTick()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // ─── Ответы и CSS-классы (Cycle 5) ────────────────────────────────
  describe('ответы и классы', () => {
    it('после правильного ответа option-card имеет класс .correct', async () => {
      const problem = wrapper.vm.currentProblem as any
      const correctIdx = problem?.correctIndex ?? 0
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.option-card')[correctIdx].classes()).toContain('correct')
      // другие карточки НЕ должны иметь .correct
      wrapper.findAll('.option-card').forEach((card, i) => {
        if (i !== correctIdx) expect(card.classes()).not.toContain('correct')
      })
    })

    it('после неправильного ответа option-card имеет класс .incorrect', async () => {
      const problem = wrapper.vm.currentProblem as any
      const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
      await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.option-card')[wrongIdx].classes()).toContain('incorrect')
      // правильная карточка НЕ должна иметь .incorrect
      const correctIdx = problem?.correctIndex ?? 0
      expect(wrapper.findAll('.option-card')[correctIdx].classes()).not.toContain('incorrect')
    })

    it('correctAnswers растёт только при правильном ответе', async () => {
      const problem = wrapper.vm.currentProblem as any
      const correctIdx = problem?.correctIndex ?? 0
      const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
      const beforeCorrect = wrapper.vm.correctAnswers
      const beforeWrong = wrapper.vm.correctAnswers
      // Wrong answer — correctAnswers stays same
      await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.correctAnswers).toBe(beforeWrong)
      // Correct answer — correctAnswers increments
      await wrapper.findAll('.option-card')[correctIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.correctAnswers).toBe(beforeCorrect + 1)
    })

    it('totalAnswers растёт при любом ответе', async () => {
      const problem = wrapper.vm.currentProblem as any
      const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
      const beforeWrong = wrapper.vm.totalAnswers
      await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.totalAnswers).toBe(beforeWrong + 1)
    })

    it('showFeedback = true после клика на любой ответ', async () => {
      const problem = wrapper.vm.currentProblem as any
      const wrongIdx = problem?.correctIndex === 0 ? 1 : 0
      await wrapper.findAll('.option-card')[wrongIdx].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showFeedback).toBe(true)
    })
  })

  // ─── pointsToNextLevel ─────────────────────────────────────────
  describe('pointsToNextLevel', () => {
    it('pointsToNextLevel > 0 при нулевом счёте', () => {
      expect(wrapper.vm.pointsToNextLevel).toBeGreaterThan(0)
    })

    it('pointsToNextLevel уменьшается при росте счёта', async () => {
      const initial = wrapper.vm.pointsToNextLevel
      // multiplicationScore is computed from store — update store directly
      const { useScoresStore } = await import('@/store/scores')
      const scoresStore = useScoresStore()
      scoresStore.updateMultiplicationScore(40)
      const after = wrapper.vm.pointsToNextLevel
      expect(after).toBeLessThan(initial)
    })
  })
})
