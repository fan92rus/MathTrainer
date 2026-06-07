import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AnswerOptions from '../common/AnswerOptions.vue'

describe('AnswerOptions', () => {
  function mountOptions(props: Record<string, any> = {}): VueWrapper {
    return mount(AnswerOptions, {
      props: {
        options: ['3', '5', '7', '9'],
        correctIndex: 2,
        answered: false,
        selectedIndex: null,
        ...props,
      },
    })
  }

  it('рендерит все опции', () => {
    const wrapper = mountOptions()
    const cards = wrapper.findAll('.option-card')
    expect(cards.length).toBe(4)
    expect(cards[0].text()).toBe('3')
    expect(cards[1].text()).toBe('5')
    expect(cards[2].text()).toBe('7')
    expect(cards[3].text()).toBe('9')
  })

  it('клик по option-card эмитит answerSelected с индексом', async () => {
    const wrapper = mountOptions()
    await wrapper.findAll('.option-card')[1].trigger('click')
    expect(wrapper.emitted('answerSelected')).toBeDefined()
    expect(wrapper.emitted('answerSelected')![0]).toEqual([1])
  })

  it('правильный ответ показывает класс correct', () => {
    const wrapper = mountOptions({ answered: true, correctIndex: 2, selectedIndex: 2 })
    const cards = wrapper.findAll('.option-card')
    expect(cards[2].classes()).toContain('correct')
  })

  it('неправильный ответ показывает класс incorrect', () => {
    const wrapper = mountOptions({ answered: true, correctIndex: 2, selectedIndex: 0 })
    const cards = wrapper.findAll('.option-card')
    expect(cards[0].classes()).toContain('incorrect')
    expect(cards[2].classes()).toContain('correct')
  })

  it('correct option получает также класс disabled', () => {
    const wrapper = mountOptions({ answered: true, correctIndex: 2, selectedIndex: 0 })
    const cards = wrapper.findAll('.option-card')
    expect(cards[2].classes()).toContain('disabled')
  })

  it('без answered ни один .option-card не имеет special классов', () => {
    const wrapper = mountOptions()
    const cards = wrapper.findAll('.option-card')
    for (const card of cards) {
      expect(card.classes().length).toBe(1) // only 'option-card'
    }
  })

  it('обрабатывает options с числами', () => {
    const wrapper = mount(AnswerOptions, {
      props: { options: [1, 2, 3, 4], correctIndex: 1 },
    })
    expect(wrapper.findAll('.option-card')[0].text()).toBe('1')
  })

  it('эмитит правильный индекс для последней опции', async () => {
    const wrapper = mountOptions()
    await wrapper.findAll('.option-card')[3].trigger('click')
    expect(wrapper.emitted('answerSelected')![0]).toEqual([3])
  })

  it('correct и selectedIndex совпадают — correct класс', () => {
    const wrapper = mountOptions({ answered: true, correctIndex: 2, selectedIndex: 2 })
    const cards = wrapper.findAll('.option-card')
    expect(cards[2].classes()).toContain('correct')
    expect(cards[2].classes()).not.toContain('incorrect')
  })
})
