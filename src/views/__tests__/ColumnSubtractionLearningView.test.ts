import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/columnSubtraction/LearningStory.vue', () => ({
  default: { template: '<div class="mock-learning"><button class="mock-complete-btn" @click="$emit(\'complete\')">Complete</button></div>', emits: ['complete'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import ColumnSubtractionLearningView from '../ColumnSubtractionLearningView.vue'

describe('ColumnSubtractionLearningView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(ColumnSubtractionLearningView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок обучения', () => {
    expect(wrapper.text()).toContain('Обучение')
    expect(wrapper.text()).toContain('Вычитание в столбик')
  })

  it('LearningStory компонент присутствует', () => {
    expect(wrapper.find('.mock-learning').exists()).toBe(true)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    global.confirm = vi.fn(() => true) as any
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('complete эмит LearningStory обновляет состояние', async () => {
    await wrapper.find('.mock-complete-btn').trigger('click')
    await wrapper.vm.$nextTick()
    // After complete, should navigate to diagnostic
    expect(mockPush).toHaveBeenCalled()
  })
})
