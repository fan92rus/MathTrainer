import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PathNode from '../motivation/PathNode.vue'
import type { PathNode as PathNodeType } from '@/types/motivation'

function createNode(overrides: Partial<PathNodeType> = {}): PathNodeType {
  return {
    id: 'node1',
    title: 'Counting',
    icon: '🔢',
    exerciseType: 'counting',
    starCount: 0,
    locked: false,
    ...overrides,
  }
}

describe('PathNode', () => {
  let wrapper: VueWrapper

  function mountNode(props: Record<string, any> = {}) {
    const node = createNode(props.node || {})
    return mount(PathNode, {
      props: {
        node,
        isCurrent: false,
        compact: false,
        ...props,
      },
    })
  }

  it('рендерится с базовым узлом', () => {
    wrapper = mountNode()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Counting')
    expect(wrapper.text()).toContain('🔢')
  })

  it('показывает 🔒 для locked узла', () => {
    wrapper = mountNode({ node: { locked: true } })
    expect(wrapper.text()).toContain('🔒')
    expect(wrapper.find('.node-lock').exists()).toBe(true)
    expect(wrapper.classes()).toContain('is-locked')
  })

  it('показывает ✅ для завершённого узла (3 звезды)', () => {
    wrapper = mountNode({ node: { starCount: 3, locked: false } })
    expect(wrapper.text()).toContain('✅')
    expect(wrapper.find('.node-check').exists()).toBe(true)
    expect(wrapper.classes()).toContain('is-completed')
  })

  it('показывает иконку для незавершённого узла', () => {
    wrapper = mountNode({ node: { starCount: 1, locked: false } })
    const iconWrap = wrapper.find('.node-icon-wrap')
    expect(iconWrap.exists()).toBe(true)
    // Should NOT show lock or check for incomplete unlocked node
    expect(iconWrap.find('.node-lock').exists()).toBe(false)
    expect(iconWrap.find('.node-check').exists()).toBe(false)
    // Should show node-icon
    expect(iconWrap.find('.node-icon').exists()).toBe(true)
  })

  it('имеет класс is-current когда isCurrent = true', () => {
    wrapper = mountNode({ isCurrent: true, node: { locked: false } })
    expect(wrapper.classes()).toContain('is-current')
  })

  it('НЕ имеет класс is-current когда isCurrent = false', () => {
    wrapper = mountNode({ isCurrent: false })
    expect(wrapper.classes()).not.toContain('is-current')
  })

  it('показывает 3 звезды с правильным filled классом', () => {
    wrapper = mountNode({ node: { starCount: 2 } })
    const stars = wrapper.findAll('.star')
    expect(stars.length).toBe(3)
    expect(stars[0].classes()).toContain('filled')
    expect(stars[1].classes()).toContain('filled')
    expect(stars[2].classes()).not.toContain('filled')
  })

  it('не показывает звёзды для locked узла', () => {
    wrapper = mountNode({ node: { locked: true, starCount: 2 } })
    expect(wrapper.find('.node-stars').exists()).toBe(false)
  })

  it('показывает пульсацию для текущего узла', () => {
    wrapper = mountNode({ isCurrent: true, node: { locked: false } })
    expect(wrapper.find('.node-pulse').exists()).toBe(true)
  })

  it('НЕ показывает пульсацию для locked isCurrent', () => {
    wrapper = mountNode({ isCurrent: true, node: { locked: true } })
    expect(wrapper.find('.node-pulse').exists()).toBe(false)
  })

  it('эмитит click при клике на разблокированный узел', async () => {
    wrapper = mountNode({ node: { locked: false } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeDefined()
  })

  it('НЕ эмитит click при клике на locked узел', async () => {
    wrapper = mountNode({ node: { locked: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('имеет класс has-progress при частичном прогрессе', () => {
    wrapper = mountNode({ node: { starCount: 1, locked: false } })
    expect(wrapper.classes()).toContain('has-progress')
  })

  it('имеет класс compact-node при compact = true', () => {
    wrapper = mountNode({ compact: true })
    expect(wrapper.classes()).toContain('compact-node')
  })

  it('НЕ имеет класс compact-node при compact = false', () => {
    wrapper = mountNode({ compact: false })
    expect(wrapper.classes()).not.toContain('compact-node')
  })
})
