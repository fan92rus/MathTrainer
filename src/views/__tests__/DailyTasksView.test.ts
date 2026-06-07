/**
 * UI тесты для DailyTasksView
 * <script setup lang="ts"> + router + useDailyTasks
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DailyTasksView from '../DailyTasksView.vue'

// ─── Моки дочерних компонентов ────────────────────────────────────
vi.mock('@/components/common/BackButton.vue', () => ({
  default: { template: '<div class="mock-back">← Назад</div>' }
}))
vi.mock('@/components/daily/DailyTasksList.vue', () => ({
  default: {
    template: '<div class="mock-daily-tasks">Daily Tasks List</div>',
    props: ['showDayProgress', 'showDate', 'showCompletionReward']
  }
}))

// ─── Моки composables ────────────────────────────────────────────
vi.mock('@/composables/useDailyTasks', () => ({
  useDailyTasks: () => ({
    ensureTasks: vi.fn(),
  })
}))

// ─── Мок vue-router ──────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

describe('DailyTasksView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    setActivePinia(createPinia())
    wrapper = mount(DailyTasksView)
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

    it('рендерит DailyTasksList', () => {
      expect(wrapper.find('.mock-daily-tasks').exists()).toBe(true)
    })

    it('рендерит BackButton', () => {
      expect(wrapper.find('.mock-back').exists()).toBe(true)
    })

    it('показывает кнопку "Выполнить задания"', () => {
      expect(wrapper.find('.action-button.primary').exists()).toBe(true)
      expect(wrapper.find('.action-button.primary').text()).toContain('Выполнить задания')
    })
  })

  // ─── Навигация ────────────────────────────────────────────────
  describe('Навигация', () => {
    it('кнопка "Выполнить задания" вызывает router.push("/")', async () => {
      await wrapper.find('.action-button.primary').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
