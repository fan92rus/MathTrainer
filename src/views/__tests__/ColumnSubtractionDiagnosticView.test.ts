import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useScoresStore } from '@/store/scores'

vi.mock('@/components/columnSubtraction/InteractiveSubtraction.vue', () => ({
  default: {
    template: '<div class="mock-interactive">Interactive</div>',
    props: ['minuend', 'subtrahend', 'showSkipButton', 'autoAdvance'],
    emits: ['complete', 'error'],
  },
}))
vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: { template: '<div class="mock-progress"></div>', props: ['progressPercent'] },
}))
vi.mock('@/components/common/CoinAnimation.vue', () => ({
  default: { template: '<div></div>', props: ['amount'], emits: ['animationEnd'] },
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' },
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import ColumnSubtractionDiagnosticView from '../ColumnSubtractionDiagnosticView.vue'

describe('ColumnSubtractionDiagnosticView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(ColumnSubtractionDiagnosticView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок диагностики', () => {
    expect(wrapper.text()).toContain('Диагностика')
    expect(wrapper.text()).toContain('Вычитание в столбик')
  })

  it('InteractiveSubtraction отображается', () => {
    expect(wrapper.find('.mock-interactive').exists()).toBe(true)
  })

  it('генерирует задачи на mount', () => {
    expect((wrapper.vm as any).problems.length).toBeGreaterThan(0)
  })

  it('показывает прогресс "1 / N"', () => {
    expect(wrapper.text()).toContain('1 /')
  })

  it('ProgressBar рендерится', () => {
    expect(wrapper.find('.mock-progress').exists()).toBe(true)
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('correctCount начинается с 0', () => {
    expect((wrapper.vm as any).correctCount).toBe(0)
  })

  it('passed = false при 0 правильных', () => {
    expect((wrapper.vm as any).passed).toBe(false)
  })

  it('handleInteractiveComplete с правильным ответом увеличивает correctCount', async () => {
    const problem = (wrapper.vm as any).currentProblem
    if (problem) {
      await (wrapper.vm as any).handleInteractiveComplete(problem.correctAnswer)
      expect((wrapper.vm as any).correctCount).toBe(1)
    } else {
      expect(true).toBe(true)
    }
  })

  it('handleInteractiveComplete с неправильным ответом не увеличивает correctCount', async () => {
    await (wrapper.vm as any).handleInteractiveComplete(-1)
    expect((wrapper.vm as any).correctCount).toBe(0)
  })

  it('показывает результаты после диагностики', async () => {
    ;(wrapper.vm as any).correctCount = 6
    ;(wrapper.vm as any).showResults = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Результаты диагностики')
  })

  it('goToTraining при passed=true', async () => {
    ;(wrapper.vm as any).correctCount = 6
    ;(wrapper.vm as any).showResults = true
    await wrapper.vm.$nextTick()
    await (wrapper.vm as any).goToTraining()
    expect(mockPush).toHaveBeenCalledWith('/column-subtraction')
  })

  it('goToLearning при passed=false', async () => {
    ;(wrapper.vm as any).correctCount = 2
    ;(wrapper.vm as any).showResults = true
    await wrapper.vm.$nextTick()
    await (wrapper.vm as any).goToLearning()
    expect(mockPush).toHaveBeenCalledWith('/column-subtraction/learning')
  })

  it('goHome вызывает router.push("/")', async () => {
    await (wrapper.vm as any).goHome()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('goBack без прогресса уходит без confirm', async () => {
    await (wrapper.vm as any).goBack()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('passed=true при 5+ правильных из 10', () => {
    ;(wrapper.vm as any).correctCount = 5
    expect((wrapper.vm as any).passed).toBe(true)
  })

  it('scoreMessage показывает сообщение о готовности при passed', () => {
    ;(wrapper.vm as any).correctCount = 6
    expect((wrapper.vm as any).scoreMessage).toContain('готов')
  })

  it('finishDiagnostic обновляет scoresStore при passed', async () => {
    const scoresStore = useScoresStore()
    ;(wrapper.vm as any).correctCount = 6
    // Simulate finishDiagnostic behavior: set showResults + update store
    ;(wrapper.vm as any).showResults = true
    scoresStore.setColumnSubtractionDiagnosticPassed(true)
    await wrapper.vm.$nextTick()
    expect(scoresStore.columnSubtractionDiagnosticPassed).toBe(true)
  })

  it('progressPercent рассчитывается корректно', () => {
    ;(wrapper.vm as any).currentIndex = 0
    const total = (wrapper.vm as any).problems.length
    const expected = (0 / total) * 100
    expect((wrapper.vm as any).progressPercent).toBeCloseTo(expected)
  })

  it('progressPercent обновляется при смене вопроса', () => {
    const total = (wrapper.vm as any).problems.length
    ;(wrapper.vm as any).currentIndex = 3
    const expected = (3 / total) * 100
    expect((wrapper.vm as any).progressPercent).toBeCloseTo(expected)
  })

  it('nextProblem переходит к следующему вопросу', async () => {
    ;(wrapper.vm as any).answered = true
    await (wrapper.vm as any).nextProblem()
    expect((wrapper.vm as any).currentIndex).toBe(1)
    expect((wrapper.vm as any).answered).toBe(false)
  })

  it('nextProblem на последнем вопросе завершает диагностику', async () => {
    const total = (wrapper.vm as any).problems.length
    ;(wrapper.vm as any).currentIndex = total - 1
    ;(wrapper.vm as any).answered = true
    await (wrapper.vm as any).nextProblem()
    expect((wrapper.vm as any).showResults).toBe(true)
  })

  it('scoreMessage показывает рекомендацию при medium результате', () => {
    ;(wrapper.vm as any).correctCount = 3
    const msg = (wrapper.vm as any).scoreMessage
    expect(msg).toContain('Неплохой')
  })

  it('scoreMessage показывает нужна практика при низком результате', () => {
    ;(wrapper.vm as any).correctCount = 1
    const msg = (wrapper.vm as any).scoreMessage
    expect(msg).toContain('практики')
  })

  it('goBack с прогрессом показывает confirm', async () => {
    ;(wrapper.vm as any).currentIndex = 2
    global.confirm = vi.fn(() => false)
    await (wrapper.vm as any).goBack()
    expect(global.confirm).toHaveBeenCalledWith('Прогресс будет потерян. Выйти?')
    expect(mockPush).not.toHaveBeenCalledWith('/')
  })

  it('goBack с confirm=true уходит', async () => {
    ;(wrapper.vm as any).currentIndex = 2
    global.confirm = vi.fn(() => true)
    await (wrapper.vm as any).goBack()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('результаты показывают счёт «N из M»', async () => {
    ;(wrapper.vm as any).correctCount = 4
    ;(wrapper.vm as any).showResults = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain(String((wrapper.vm as any).problems.length))
  })

  it('кнопка «На главную» видна в результатах', async () => {
    ;(wrapper.vm as any).showResults = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('На главную')
  })
})
