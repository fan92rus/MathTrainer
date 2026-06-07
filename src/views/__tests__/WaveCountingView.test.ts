import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/wave/WaveCard.vue', () => ({
  default: { template: '<div class="mock-wavecard"><button class="mock-wave-ans" v-for="(o,i) in problem?.options || []" :key="i" @click="$emit(\'answer\', i)">{{ o }}</button></div>', props: ['problem', 'position'], emits: ['answer'] }
}))
vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: { template: '<div class="mock-currency">🪙</div>' }
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

import WaveCountingView from '../WaveCountingView.vue'

describe('WaveCountingView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    wrapper = mount(WaveCountingView)
  })

  it('рендерится без ошибок', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('показывает заголовок Волна примеров', () => {
    expect(wrapper.text()).toContain('Волна примеров')
  })

  it('показывает стартовый экран', () => {
    expect(wrapper.find('.wave-view__start').exists()).toBe(true)
  })

  it('показывает кнопку Начать', () => {
    expect(wrapper.find('.wave-view__start-btn').exists()).toBe(true)
  })

  it('кнопка Назад вызывает router.push("/")', async () => {
    await wrapper.find('.back-button').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('после startWave появляется WaveCard', async () => {
    wrapper.vm.startWave()
    await wrapper.vm.$nextTick()
    // Give rAF time to process
    await new Promise(r => setTimeout(r, 100))
    expect(wrapper.find('.mock-wavecard').exists()).toBe(true)
  })

  it('после старта показываются кнопки ответов', async () => {
    wrapper.vm.startWave()
    await wrapper.vm.$nextTick()
    await new Promise(r => setTimeout(r, 100))
    const btns = wrapper.findAll('.mock-wave-ans')
    expect(btns.length).toBe(4)
  })

  it('показывает счётчики streak, speed, score', () => {
    expect(wrapper.find('.wave-view__streak').exists()).toBe(true)
    expect(wrapper.find('.wave-view__speed').exists()).toBe(true)
    expect(wrapper.find('.wave-view__score').exists()).toBe(true)
  })

  it('CurrencyDisplay рендерится', () => {
    expect(wrapper.find('.mock-currency').exists()).toBe(true)
  })

  it('старт и пауза работают', async () => {
    wrapper.vm.startWave()
    await new Promise(r => setTimeout(r, 100))
    expect(wrapper.vm.currentCard).toBeTruthy()
    wrapper.vm.runner.pause()
    expect(wrapper.vm.isPaused).toBe(true)
  })
})
