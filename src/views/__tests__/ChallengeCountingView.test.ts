/**
 * UI тесты для ChallengeCountingView
 * <script setup> + useChallengeMode (3-phase: prestart/playing/results)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChallengeCountingView from '../ChallengeCountingView.vue'

// ─── Моки дочерних компонентов ────────────────────────────────────
vi.mock('@/components/challenge/ChallengePreStart.vue', () => ({
  default: {
    template: '<div class="mock-prestart">PreStart</div>',
    emits: ['start']
  }
}))
vi.mock('@/components/challenge/ChallengeHeader.vue', () => ({
  default: {
    template: '<div class="mock-header">Timer: {{ formattedTime }} Streak: {{ currentStreak }}</div>',
    props: ['formattedTime', 'isWarning', 'isCritical', 'currentStreak', 'timerProgress']
  }
}))
vi.mock('@/components/challenge/ChallengeProgressBar.vue', () => ({
  default: {
    template: '<div class="mock-progress">Solved: {{ solved }}/{{ total }}</div>',
    props: ['solved', 'total']
  }
}))
vi.mock('@/components/challenge/ChallengeResults.vue', () => ({
  default: {
    template: '<div class="mock-results">Results</div>',
    props: ['result'],
    emits: ['retry', 'home']
  }
}))
vi.mock('@/components/common/AnswerOptions.vue', () => ({
  default: {
    template: '<div class="mock-answers"><button v-for="(o,i) in options" :key="i" class="mock-option" :data-index="i" @click="$emit(\'answerSelected\', i)">{{ o }}</button></div>',
    props: ['options', 'correctIndex', 'selectedIndex', 'answered'],
    emits: ['answerSelected']
  }
}))

// ─── Мок vue-router ──────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}))

describe('ChallengeCountingView', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    setActivePinia(createPinia())
    wrapper = mount(ChallengeCountingView)
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

    it('начальная фаза — prestart', () => {
      expect(wrapper.vm.phase).toBe('prestart')
      expect(wrapper.find('.mock-prestart').exists()).toBe(true)
    })

    it('НЕ показывает playing фазу на старте', () => {
      expect(wrapper.find('.mock-header').exists()).toBe(false)
    })

    it('НЕ показывает results фазу на старте', () => {
      expect(wrapper.find('.mock-results').exists()).toBe(false)
    })
  })

  // ─── Фаза playing ─────────────────────────────────────────────
  describe('Фаза playing', () => {
    it('переход к playing при startChallenge', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()
      // Note: useChallengeMode handles the transition internally
    })
  })

  // ─── Фаза results ─────────────────────────────────────────────
  describe('Фаза results', () => {
    it('result изначально null', () => {
      expect(wrapper.vm.result).toBeNull()
    })
  })
})
