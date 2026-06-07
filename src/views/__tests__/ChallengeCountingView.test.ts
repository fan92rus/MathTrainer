/**
 * UI тесты для ChallengeCountingView
 * <script setup> + useChallengeMode (3-phase: prestart/playing/results)
 *
 * Coverage goals:
 * - All 3 phases (prestart, playing, results)
 * - Branch at v-else-if="phase === 'results' && result" (line ~83)
 * - Wrong answer handling
 * - Retry flow
 * - goHome navigation
 * - Timer expiry (isFinished) triggering results
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChallengeCountingView from '../ChallengeCountingView.vue'

// ─── Моки дочерних компонентов ────────────────────────────────────
vi.mock('@/components/challenge/ChallengePreStart.vue', () => ({
  default: {
    template: '<div class="mock-prestart" @click="$emit(\'start\', 60)">PreStart</div>',
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
    template: '<div class="mock-results"><span class="result-score">{{ result?.score }}</span><button class="retry-btn" @click="$emit(\'retry\')">Retry</button><button class="home-btn" @click="$emit(\'home\')">Home</button></div>',
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
      // After startChallenge, phase should be playing
      expect(wrapper.vm.phase).toBe('playing')
    })

    it('показывает ChallengeHeader в playing фазе', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()
      // Phase is now 'playing', template v-else-if="phase === 'playing'" should render
      expect(wrapper.find('.mock-header').exists()).toBe(true)
    })

    it('показывает expression и AnswerOptions в playing фазе', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.challenge-view__expression').exists()).toBe(true)
      expect(wrapper.find('.mock-answers').exists()).toBe(true)
    })

    it('НЕ показывает PreStart в playing фазе', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mock-prestart').exists()).toBe(false)
    })
  })

  // ─── Ответы ─────────────────────────────────────────────────────
  describe('Ответы', () => {
    it('правильный ответ увеличивает totalCorrect', async () => {
      // Start challenge
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem
      const correctIdx = problem.correctIndex

      // Click correct answer
      await wrapper.find(`.mock-option[data-index="${correctIdx}"]`).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.totalCorrect).toBe(1)
      expect(wrapper.vm.answered).toBe(true)
    })

    it('неправильный ответ НЕ увеличивает totalCorrect', async () => {
      // Start challenge
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem
      const wrongIdx = problem.correctIndex === 0 ? 1 : 0

      // Click wrong answer
      await wrapper.find(`.mock-option[data-index="${wrongIdx}"]`).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.totalCorrect).toBe(0)
      expect(wrapper.vm.answered).toBe(true)
      expect(wrapper.vm.selectedIndex).toBe(wrongIdx)
    })

    it('неправильный ответ сбрасывает currentStreak', async () => {
      // Start challenge
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem
      const wrongIdx = problem.correctIndex === 0 ? 1 : 0

      await wrapper.find(`.mock-option[data-index="${wrongIdx}"]`).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStreak).toBe(0)
    })

    it('повторный ответ блокируется (answered=true)', async () => {
      // Start challenge
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem

      // First answer
      await wrapper.find(`.mock-option[data-index="0"]`).trigger('click')
      await wrapper.vm.$nextTick()
      const answeredAfterFirst = wrapper.vm.totalAnswered

      // Second answer should be blocked
      await wrapper.find(`.mock-option[data-index="1"]`).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.totalAnswered).toBe(answeredAfterFirst)
    })

    it('currentStreak увеличивается при правильном ответе', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem
      await wrapper.find(`.mock-option[data-index="${problem.correctIndex}"]`).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStreak).toBe(1)
      expect(wrapper.vm.totalCorrect).toBe(1)
    })
  })

  // ─── Фаза results ─────────────────────────────────────────────
  describe('Фаза results', () => {
    it('result изначально null', () => {
      expect(wrapper.vm.result).toBeNull()
    })

    it('ChallengeResults НЕ рендерится когда phase=results но result=null (branch && result)', async () => {
      // Directly manipulate phase to 'results' with result still null
      // This covers the false branch of "phase === 'results' && result"
      wrapper.vm.phase = 'results'
      // result is already null from initial state
      expect(wrapper.vm.result).toBeNull()
      await wrapper.vm.$nextTick()

      // ChallengeResults should NOT render because result is null
      expect(wrapper.find('.mock-results').exists()).toBe(false)
    })

    it('ChallengeResults рендерится когда phase=results и result не null', async () => {
      // Set both phase and result
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 2,
        score: 250,
        correct: 2,
        total: 3,
        accuracy: 0.667,
        bestStreak: 2,
        isNewRecord: false,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.mock-results').exists()).toBe(true)
      expect(wrapper.find('.result-score').text()).toBe('250')
    })

    it('results фаза показывает ChallengeResults с корректными данными', async () => {
      // Simulate end of challenge by setting phase and result directly
      // (timer expiry via isFinished watch is tested in composable tests)
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 1,
        score: 110,
        correct: 1,
        total: 1,
        accuracy: 1,
        bestStreak: 1,
        isNewRecord: true,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.phase).toBe('results')
      expect(wrapper.find('.mock-results').exists()).toBe(true)
      expect(wrapper.find('.result-score').text()).toBe('110')
    })

    it('result содержит isNewRecord=true для нового рекорда', async () => {
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 2,
        score: 500,
        correct: 5,
        total: 5,
        accuracy: 1,
        bestStreak: 5,
        isNewRecord: true,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.result.isNewRecord).toBe(true)
      expect(wrapper.vm.result.correct).toBe(5)
      expect(wrapper.vm.result.bestStreak).toBe(5)
    })
  })

  // ─── Retry ────────────────────────────────────────────────────
  describe('Retry', () => {
    it('retry возвращает к prestart фазе', async () => {
      // Set up results state
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 2,
        score: 250,
        correct: 2,
        total: 3,
        accuracy: 0.667,
        bestStreak: 2,
        isNewRecord: false,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      // Click retry
      await wrapper.find('.retry-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.phase).toBe('prestart')
      expect(wrapper.vm.result).toBeNull()
      expect(wrapper.vm.currentStreak).toBe(0)
      expect(wrapper.vm.totalCorrect).toBe(0)
      expect(wrapper.find('.mock-prestart').exists()).toBe(true)
    })
  })

  // ─── Navigation ───────────────────────────────────────────────
  describe('Navigation', () => {
    it('goHome вызывает router.push("/")', async () => {
      // Set up results state
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 2,
        score: 250,
        correct: 2,
        total: 3,
        accuracy: 0.667,
        bestStreak: 2,
        isNewRecord: false,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      await wrapper.find('.home-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // ─── Timer state ──────────────────────────────────────────────
  describe('Timer state', () => {
    it('formattedTime обновляется после старта', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      // formattedTime should be set by the timer
      expect(wrapper.vm.formattedTime).toBeTruthy()
    })

    it('isWarning и isCritical изначально false', () => {
      expect(wrapper.vm.isWarning).toBe(false)
      expect(wrapper.vm.isCritical).toBe(false)
    })

    it('progress изначально 1', () => {
      expect(wrapper.vm.timerProgress).toBe(1)
    })
  })

  // ─── Streak ───────────────────────────────────────────────────
  describe('Streak', () => {
    it('streak сбрасывается при retry', async () => {
      // Start, answer correctly
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      const problem = wrapper.vm.currentProblem
      await wrapper.find(`.mock-option[data-index="${problem.correctIndex}"]`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStreak).toBe(1)

      // Enter results
      wrapper.vm.phase = 'results'
      wrapper.vm.result = {
        exerciseType: 'counting',
        duration: 2,
        score: 110,
        correct: 1,
        total: 1,
        accuracy: 1,
        bestStreak: 1,
        isNewRecord: false,
        timestamp: Date.now(),
      }
      await wrapper.vm.$nextTick()

      // Retry
      await wrapper.find('.retry-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStreak).toBe(0)
      expect(wrapper.vm.totalCorrect).toBe(0)
    })

    it('streak растет при серии правильных ответов', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      // Answer first correctly
      let problem = wrapper.vm.currentProblem
      await wrapper.find(`.mock-option[data-index="${problem.correctIndex}"]`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStreak).toBe(1)

      // Advance timers to trigger nextProblem (400ms delay)
      vi.advanceTimersByTime(500)
      await wrapper.vm.$nextTick()

      // Answer second correctly
      problem = wrapper.vm.currentProblem
      await wrapper.find(`.mock-option[data-index="${problem.correctIndex}"]`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStreak).toBe(2)
      expect(wrapper.vm.totalCorrect).toBe(2)
    })

    it('неправильный ответ сбрасывает серию', async () => {
      await wrapper.findComponent({ name: 'ChallengePreStart' }).vm.$emit('start', 60)
      await wrapper.vm.$nextTick()

      // Answer first correctly
      let problem = wrapper.vm.currentProblem
      await wrapper.find(`.mock-option[data-index="${problem.correctIndex}"]`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStreak).toBe(1)
      expect(wrapper.vm.totalCorrect).toBe(1)

      // Advance to next problem
      vi.advanceTimersByTime(500)
      await wrapper.vm.$nextTick()

      // Answer second WRONG
      problem = wrapper.vm.currentProblem
      const wrongIdx = problem.correctIndex === 0 ? 1 : 0
      await wrapper.find(`.mock-option[data-index="${wrongIdx}"]`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStreak).toBe(0)
      // totalCorrect stays at 1 (wrong answer doesn't increment it)
      expect(wrapper.vm.totalCorrect).toBe(1)
    })
  })
})
