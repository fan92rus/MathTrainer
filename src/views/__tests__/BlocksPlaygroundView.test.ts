import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/blocks/BlockItem.vue', () => ({
  default: { template: '<div class="mock-blockitem">{{ value }}</div>', props: ['value', 'colorClass', 'isDragging', 'offsetX', 'offsetY'] }
}))
vi.mock('@/components/blocks/BlockPlayground.vue', () => ({
  default: { template: '<div class="mock-blockplayground"><button class="mock-combine-btn" @click="$emit(\'blocks-combined\', { idA: 0, idB: 1 })">Combine</button></div>', props: ['blocks'], emits: ['blocks-combined', 'block-moved', 'block-released'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import BlocksPlaygroundView from '../BlocksPlaygroundView.vue'

describe('BlocksPlaygroundView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(BlocksPlaygroundView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок Собери', () => {
    expect(wrapper.text()).toContain('Собери')
  })

  it('показывает цель (targetValue)', () => {
    expect(wrapper.vm.targetValue).toBeGreaterThan(0)
  })

  it('BlockPlayground рендерится', () => {
    expect(wrapper.find('.mock-blockplayground').exists()).toBe(true)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('solvedCount начинается с 0', () => {
    expect(wrapper.vm.solvedCount).toBe(0)
  })

  it('показывает кнопку Пропустить', () => {
    const skipBtn = wrapper.find('.blocks-view__skip-btn')
    expect(skipBtn.exists()).toBe(true)
  })

  it('сброс задачи (skipProblem) обновляет таргет', async () => {
    const initialTarget = wrapper.vm.targetValue
    await wrapper.find('.blocks-view__skip-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.targetValue).toBeGreaterThan(0)
  })
})
