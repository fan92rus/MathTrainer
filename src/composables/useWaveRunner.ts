import { ref, onUnmounted } from 'vue'
import type { MathProblem } from '@/types'

export type CardPosition = 'hidden' | 'entering' | 'current' | 'leaving' | 'passed'

export interface WaveCard {
  id: number
  problem: MathProblem
  position: CardPosition
}

/**
 * Conveyor belt state management for Wave Runner (Pattern 6).
 *
 * - Object pool of 3-4 cards (no DOM recreation per example)
 * - Adaptive speed: faster on correct, slower on error
 * - Auto-advance timer with pause/resume
 */
export function useWaveRunner(generateProblem: () => MathProblem) {
  const cards = ref<WaveCard[]>([])
  const speed = ref(8000) // ms per card (baseline for 6-8 years)
  const streak = ref(0)
  const isPaused = ref(false)
  const totalCorrect = ref(0)
  const totalAnswered = ref(0)

  let cardIdCounter = 0
  let timerId: ReturnType<typeof setTimeout> | null = null

  /** Add a new card to the pool. Keeps max 4. */
  function addCard(): void {
    const card: WaveCard = {
      id: ++cardIdCounter,
      problem: generateProblem(),
      position: 'hidden',
    }
    cards.value.push(card)
    // Keep only 4 cards in pool (object pool pattern)
    if (cards.value.length > 4) {
      cards.value.shift()
    }
  }

  /** Start the wave: create 2 cards, set first as current, schedule timer. */
  function start(): void {
    addCard()
    addCard()
    if (cards.value[0]) cards.value[0].position = 'current'
    scheduleNext()
  }

  /** Schedule auto-advance of current card after speed ms. */
  function scheduleNext(): void {
    if (timerId) clearTimeout(timerId)
    if (isPaused.value) return
    timerId = setTimeout(() => {
      advanceCard(false) // missed
    }, speed.value)
  }

  /** Advance to next card: mark current as leaving/passed, promote next. */
  function advanceCard(wasCorrect: boolean): void {
    const current = cards.value.find(c => c.position === 'current')
    if (current) {
      current.position = wasCorrect ? 'leaving' : 'passed'
    }

    // Promote a hidden card to current
    const next = cards.value.find(c => c.position === 'hidden')
    if (next) {
      next.position = 'current'
    } else {
      addCard()
      const last = cards.value[cards.value.length - 1]
      if (last) last.position = 'current'
    }

    // Pre-generate a new card at the back
    addCard()

    // Clean up leaving/passed cards after transition
    setTimeout(() => {
      cards.value = cards.value.filter(c => c.position !== 'leaving' && c.position !== 'passed')
    }, 600)

    scheduleNext()
  }

  /**
   * Handle answer selection for the current card.
   * Adapts speed: correct → faster (min 3s), wrong → slower (max 12s).
   * Returns true if correct.
   */
  function answer(index: number): boolean {
    const current = cards.value.find(c => c.position === 'current')
    if (!current) return false

    const isCorrect = index === current.problem.correctIndex
    totalAnswered.value++

    if (isCorrect) {
      totalCorrect.value++
      streak.value++
      // Speed up: baseline 8s, clamp [3s, 12s]
      speed.value = Math.max(3000, speed.value * 0.92)
    } else {
      streak.value = 0
      // Slow down
      speed.value = Math.min(12000, speed.value * 1.3)
    }

    advanceCard(isCorrect)
    return isCorrect
  }

  /** Pause the wave — stops auto-advance timer. */
  function pause(): void {
    isPaused.value = true
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  /** Resume the wave — restarts auto-advance timer. */
  function resume(): void {
    isPaused.value = false
    scheduleNext()
  }

  /** Reset everything to initial state. */
  function reset(): void {
    if (timerId) clearTimeout(timerId)
    cards.value = []
    speed.value = 8000
    streak.value = 0
    totalCorrect.value = 0
    totalAnswered.value = 0
    isPaused.value = false
    cardIdCounter = 0
  }

  onUnmounted(() => {
    if (timerId) clearTimeout(timerId)
  })

  return {
    cards,
    speed,
    streak,
    isPaused,
    totalCorrect,
    totalAnswered,
    start,
    answer,
    pause,
    resume,
    reset,
  }
}
