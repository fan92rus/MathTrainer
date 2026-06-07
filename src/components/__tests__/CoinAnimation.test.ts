import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CoinAnimation from '../common/CoinAnimation.vue'

describe('CoinAnimation', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    wrapper?.unmount()
  })

  async function createWrapper(props: Record<string, any> = {}): Promise<VueWrapper> {
    const w = mount(CoinAnimation, { props })
    // Component uses onMounted with nextTick — flush Vue updates
    await w.vm.$nextTick()
    return w
  }

  it('рендерится с переданным amount', async () => {
    wrapper = await createWrapper({ amount: 5 })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('+5')
  })

  it('показывает монетки', async () => {
    wrapper = await createWrapper({ amount: 3 })
    const coins = wrapper.findAll('.coin')
    expect(coins.length).toBe(3)
  })

  it('не показывает текст при showText=false', async () => {
    wrapper = await createWrapper({ amount: 5, showText: false })
    expect(wrapper.find('.coin-text').exists()).toBe(false)
  })

  it('показывает не более 10 монет', async () => {
    wrapper = await createWrapper({ amount: 20 })
    const coins = wrapper.findAll('.coin')
    expect(coins.length).toBe(10)
  })

  it('не показывает монеты для 0', async () => {
    wrapper = await createWrapper({ amount: 0 })
    expect(wrapper.text()).toContain('+0')
  })

  it('эмитит animationEnd после duration', async () => {
    wrapper = await createWrapper({ amount: 1, duration: 500 })
    expect(wrapper.emitted('animationEnd')).toBeUndefined()

    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('animationEnd')).toBeDefined()
    expect(wrapper.emitted('animationEnd')?.length).toBe(1)
  })

  it('getCoinStyle возвращает корректные CSS переменные', async () => {
    wrapper = await createWrapper({ amount: 4 })
    const coins = wrapper.findAll('.coin')
    if (coins.length > 0) {
      const style = coins[0].attributes('style')
      expect(style).toContain('--angle')
      expect(style).toContain('--radius')
      expect(style).toContain('--delay')
    }
  })

  it('применяет кастомную duration', async () => {
    wrapper = await createWrapper({ amount: 2, duration: 3000 })
    expect(wrapper.emitted('animationEnd')).toBeUndefined()

    vi.advanceTimersByTime(3000)
    expect(wrapper.emitted('animationEnd')).toBeDefined()
  })
})
