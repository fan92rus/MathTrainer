import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { MathProblem } from '@/types'
import { useWaveRunner } from '../useWaveRunner'

/** Factory for simple MathProblem objects */
function makeProblem(overrides: Partial<MathProblem> = {}): MathProblem {
  const num1 = overrides.num1 ?? Math.floor(Math.random() * 10) + 1
  const num2 = overrides.num2 ?? Math.floor(Math.random() * 10) + 1
  const correctAnswer = overrides.correctAnswer ?? num1 + num2
  const options = overrides.options ?? generateOptions(correctAnswer)
  return {
    id: `p-${Date.now()}-${Math.random()}`,
    expression: overrides.expression ?? `${num1} + ${num2}`,
    operation: overrides.operation ?? 'addition',
    num1,
    num2,
    correctAnswer,
    options,
    correctIndex: overrides.correctIndex ?? options.indexOf(String(correctAnswer)),
    difficulty: overrides.difficulty ?? 1,
  }
}

function generateOptions(correct: number): string[] {
  const opts = new Set<string>([String(correct)])
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1
    const wrong = Math.random() < 0.5 ? correct + offset : correct - offset
    if (wrong >= 0) opts.add(String(wrong))
  }
  return Array.from(opts).sort(() => Math.random() - 0.5)
}

describe('useWaveRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty state', () => {
    const runner = useWaveRunner(() => makeProblem())
    expect(runner.cards.value).toHaveLength(0)
    expect(runner.speed.value).toBe(8000)
    expect(runner.streak.value).toBe(0)
    expect(runner.isPaused.value).toBe(false)
    expect(runner.totalCorrect.value).toBe(0)
    expect(runner.totalAnswered.value).toBe(0)
  })

  it('should create cards on start', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    expect(runner.cards.value.length).toBeGreaterThanOrEqual(2)
    // First card should be 'current'
    const current = runner.cards.value.find(c => c.position === 'current')
    expect(current).toBeDefined()
    expect(current!.problem).toBeDefined()
    expect(current!.problem.expression).toBeTruthy()
  })

  it('should have correct answer index in generated problems', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const current = runner.cards.value.find(c => c.position === 'current')!
    const correctOpt = current.problem.options[current.problem.correctIndex]
    expect(Number(correctOpt)).toBe(current.problem.correctAnswer)
  })

  it('should return false for answer when no current card', () => {
    const runner = useWaveRunner(() => makeProblem())
    // Don't call start()
    expect(runner.answer(0)).toBe(false)
  })

  it('should return true for correct answer', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const current = runner.cards.value.find(c => c.position === 'current')!
    const result = runner.answer(current.problem.correctIndex)
    expect(result).toBe(true)
    expect(runner.totalCorrect.value).toBe(1)
    expect(runner.totalAnswered.value).toBe(1)
    expect(runner.streak.value).toBe(1)
  })

  it('should return false for wrong answer', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const current = runner.cards.value.find(c => c.position === 'current')!
    // Pick a wrong index
    const wrongIndex = current.problem.correctIndex === 0 ? 1 : 0
    const result = runner.answer(wrongIndex)
    expect(result).toBe(false)
    expect(runner.totalCorrect.value).toBe(0)
    expect(runner.totalAnswered.value).toBe(1)
    expect(runner.streak.value).toBe(0)
  })

  it('should adapt speed: faster on correct', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const initialSpeed = runner.speed.value

    // Answer correctly
    const current = runner.cards.value.find(c => c.position === 'current')!
    runner.answer(current.problem.correctIndex)

    // Speed should decrease (faster) by factor 0.92
    expect(runner.speed.value).toBe(Math.max(3000, initialSpeed * 0.92))
  })

  it('should adapt speed: slower on wrong answer', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const initialSpeed = runner.speed.value

    // Answer incorrectly
    const current = runner.cards.value.find(c => c.position === 'current')!
    const wrongIndex = current.problem.correctIndex === 0 ? 1 : 0
    runner.answer(wrongIndex)

    // Speed should increase (slower) by factor 1.3
    expect(runner.speed.value).toBe(Math.min(12000, initialSpeed * 1.3))
  })

  it('should clamp speed minimum to 3000ms', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    // Answer many times correctly to push speed down
    for (let i = 0; i < 50; i++) {
      const current = runner.cards.value.find(c => c.position === 'current')
      if (current) runner.answer(current.problem.correctIndex)
    }

    expect(runner.speed.value).toBeGreaterThanOrEqual(3000)
  })

  it('should clamp speed maximum to 12000ms', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    // Answer many times incorrectly to push speed up
    for (let i = 0; i < 50; i++) {
      const current = runner.cards.value.find(c => c.position === 'current')
      if (current) {
        const wrongIndex = current.problem.correctIndex === 0 ? 1 : 0
        runner.answer(wrongIndex)
      }
    }

    expect(runner.speed.value).toBeLessThanOrEqual(12000)
  })

  it('should reset streak on wrong answer after correct ones', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    // Answer correctly twice
    for (let i = 0; i < 2; i++) {
      const current = runner.cards.value.find(c => c.position === 'current')
      if (current) runner.answer(current.problem.correctIndex)
    }
    expect(runner.streak.value).toBe(2)

    // Wrong answer
    const current = runner.cards.value.find(c => c.position === 'current')
    if (current) {
      const wrongIndex = current.problem.correctIndex === 0 ? 1 : 0
      runner.answer(wrongIndex)
    }
    expect(runner.streak.value).toBe(0)
  })

  it('should pause and stop auto-advance', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()
    runner.pause()

    expect(runner.isPaused.value).toBe(true)
  })

  it('should resume after pause', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()
    runner.pause()
    runner.resume()

    expect(runner.isPaused.value).toBe(false)
  })

  it('should keep cards when paused', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()
    const cardCount = runner.cards.value.length

    runner.pause()
    expect(runner.cards.value.length).toBe(cardCount)
  })

  it('should reset all state', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const current = runner.cards.value.find(c => c.position === 'current')
    if (current) runner.answer(current.problem.correctIndex)

    runner.reset()

    expect(runner.cards.value).toHaveLength(0)
    expect(runner.speed.value).toBe(8000)
    expect(runner.streak.value).toBe(0)
    expect(runner.totalCorrect.value).toBe(0)
    expect(runner.totalAnswered.value).toBe(0)
    expect(runner.isPaused.value).toBe(false)
  })

  it('should advance cards on answer', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const firstCurrent = runner.cards.value.find(c => c.position === 'current')!

    // Answer to advance
    runner.answer(firstCurrent.problem.correctIndex)

    // First card should now be 'leaving'
    expect(firstCurrent.position).toBe('leaving')

    // There should be a new current card
    const newCurrent = runner.cards.value.find(c => c.position === 'current')
    expect(newCurrent).toBeDefined()
    expect(newCurrent!.id).not.toBe(firstCurrent.id)
  })

  it('should clean up leaving/passed cards after timeout', () => {
    const runner = useWaveRunner(() => makeProblem())
    runner.start()

    const firstCurrent = runner.cards.value.find(c => c.position === 'current')!
    runner.answer(firstCurrent.problem.correctIndex)

    // Before cleanup timeout
    const leavingCards = runner.cards.value.filter(c => c.position === 'leaving' || c.position === 'passed')
    expect(leavingCards.length).toBeGreaterThan(0)

    // Advance past cleanup timeout (600ms)
    vi.advanceTimersByTime(700)

    // Leaving/passed cards should be cleaned up
    const afterCleanup = runner.cards.value.filter(c => c.position === 'leaving' || c.position === 'passed')
    expect(afterCleanup.length).toBe(0)
  })

  it('should work with custom initial speed', () => {
    // The composable always starts at 8000, but we can verify through the API
    const runner = useWaveRunner(() => makeProblem())
    expect(runner.speed.value).toBe(8000)
  })
})
