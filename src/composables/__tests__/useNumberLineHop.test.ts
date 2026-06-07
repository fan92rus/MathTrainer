import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNumberLineHop } from '../useNumberLineHop'

describe('useNumberLineHop', () => {
  const defaultRange = { min: 0, max: 12, step: 1, labelAll: true }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize marker at range minimum', () => {
    const { markerPosition } = useNumberLineHop(defaultRange)
    expect(markerPosition.value).toBe(0)
  })

  it('should compute tick numbers from range', () => {
    const { tickNumbers } = useNumberLineHop(defaultRange)
    expect(tickNumbers.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('should compute tick numbers with custom range', () => {
    const { tickNumbers } = useNumberLineHop({ min: 5, max: 15, step: 1, labelAll: false })
    expect(tickNumbers.value).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('should compute tick numbers with step > 1', () => {
    const { tickNumbers } = useNumberLineHop({ min: 0, max: 20, step: 2, labelAll: false })
    expect(tickNumbers.value).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
  })

  it('should set waitForTap state correctly', () => {
    const { markerPosition, targetPosition, isWaitingForTap, jumpArcs, waitForTap } =
      useNumberLineHop(defaultRange)

    waitForTap({
      start: 3,
      type: 'add',
      step: 5,
      answer: 8,
      expression: '3 + 5',
    })

    expect(markerPosition.value).toBe(3)
    expect(targetPosition.value).toBe(8)
    expect(isWaitingForTap.value).toBe(true)
    expect(jumpArcs.value).toHaveLength(0)
  })

  it('should return false from handleTap when not waiting', async () => {
    const { handleTap } = useNumberLineHop(defaultRange)
    const result = await handleTap(5)
    expect(result).toBe(false)
  })

  it('should accept tap and animate to correct answer', async () => {
    const { markerPosition, isWaitingForTap, jumpArcs, waitForTap, handleTap } =
      useNumberLineHop(defaultRange)

    waitForTap({
      start: 3,
      type: 'add',
      step: 5,
      answer: 8,
      expression: '3 + 5',
    })

    const promise = handleTap(8)

    // Advance timers: 200ms (preparing) + animation rAF
    vi.advanceTimersByTime(200)

    // Need to flush rAF-based animation. Since we use fake timers, 
    // requestAnimationFrame won't actually fire. Let the animation run via time.
    vi.advanceTimersByTime(1000) // enough for 400ms animation + 150ms landing

    const result = await promise
    expect(result).toBe(true)
    expect(isWaitingForTap.value).toBe(false)
  })

  it('should clear waiting state on wrong tap immediately', () => {
    const { isWaitingForTap, waitForTap, handleTap } =
      useNumberLineHop(defaultRange)

    waitForTap({
      start: 3,
      type: 'add',
      step: 5,
      answer: 8,
      expression: '3 + 5',
    })

    // handleTap is async and uses rAF which doesn't work with fake timers.
    // But the sync part: clears isWaitingForTap immediately.
    // We verify by not awaiting and checking the sync side-effect.
    handleTap(6) // wrong!

    // The sync guard check passed and isWaitingForTap was cleared
    expect(isWaitingForTap.value).toBe(false)
  }, 1000)

  it('should add jump arcs after animation', async () => {
    const { jumpArcs, waitForTap, handleTap } = useNumberLineHop(defaultRange)

    waitForTap({
      start: 0,
      type: 'add',
      step: 3,
      answer: 3,
      expression: '0 + 3',
    })

    const promise = handleTap(3)
    vi.advanceTimersByTime(1000)
    await promise

    expect(jumpArcs.value.length).toBeGreaterThanOrEqual(1)
  })

  it('should auto-clear jump arcs after 600ms', async () => {
    const { jumpArcs, waitForTap, handleTap } = useNumberLineHop(defaultRange)

    waitForTap({
      start: 0,
      type: 'add',
      step: 5,
      answer: 5,
      expression: '0 + 5',
    })

    const promise = handleTap(5)
    // Advance past jump animation (150+500+200=850ms)
    vi.advanceTimersByTime(900)
    await promise

    // Arc should exist right after landing
    expect(jumpArcs.value.length).toBe(1)

    // Advance another 650ms (past the 600ms auto-clear)
    vi.advanceTimersByTime(650)

    // Arc should be cleared
    expect(jumpArcs.value.length).toBe(0)
  })

  it('should handle same-position animateJump (bounce-in-place)', async () => {
    const { jumpAnimation, jumpPhase, animateJump } = useNumberLineHop(defaultRange)

    const promise = animateJump(5, 5, 300)

    // Should start preparing
    expect(jumpAnimation.value).not.toBeNull()
    expect(jumpAnimation.value!.from).toBe(5)
    expect(jumpAnimation.value!.to).toBe(5)
    expect(jumpPhase.value).toBe('preparing')

    // Advance through full animation
    vi.advanceTimersByTime(700)
    await promise

    // Should complete without error
    expect(jumpPhase.value).toBe('done')
    expect(jumpAnimation.value).toBeNull()
  })

  it('should reset all state', () => {
    const { markerPosition, jumpArcs, targetPosition, isWaitingForTap, waitForTap, reset } =
      useNumberLineHop(defaultRange)

    waitForTap({
      start: 5,
      type: 'add',
      step: 3,
      answer: 8,
      expression: '5 + 3',
    })

    reset()

    expect(markerPosition.value).toBe(0)
    expect(jumpArcs.value).toHaveLength(0)
    expect(targetPosition.value).toBe(null)
    expect(isWaitingForTap.value).toBe(false)
  })

  it('should handle range starting from non-zero', () => {
    const { markerPosition, tickNumbers } = useNumberLineHop({ min: 5, max: 10, step: 1, labelAll: true })
    expect(markerPosition.value).toBe(5)
    expect(tickNumbers.value[0]).toBe(5)
  })
})
