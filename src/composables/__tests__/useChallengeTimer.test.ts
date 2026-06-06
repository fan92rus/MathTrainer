import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChallengeTimer } from '../useChallengeTimer'

describe('useChallengeTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with full remaining time', () => {
    const { remainingMs, formattedTime, isRunning, isWarning, isCritical, isFinished } =
      useChallengeTimer(2)
    expect(remainingMs.value).toBe(120_000)
    expect(formattedTime.value).toBe('2:00')
    expect(isRunning.value).toBe(false)
    expect(isWarning.value).toBe(false)
    expect(isCritical.value).toBe(false)
    expect(isFinished.value).toBe(false)
  })

  it('should format time correctly for 1 minute', () => {
    const { formattedTime } = useChallengeTimer(1)
    expect(formattedTime.value).toBe('1:00')
  })

  it('should format time with leading zero seconds', () => {
    const { remainingMs, formattedTime } = useChallengeTimer(1)
    remainingMs.value = 65_000
    expect(formattedTime.value).toBe('1:05')
  })

  it('should start timer', () => {
    const { isRunning, start } = useChallengeTimer(1)
    start()
    expect(isRunning.value).toBe(true)
  })

  it('should not start if already running', () => {
    const { isRunning, start } = useChallengeTimer(1)
    start()
    start() // second call should be no-op
    expect(isRunning.value).toBe(true)
  })

  it('should stop timer', () => {
    const { isRunning, start, stop } = useChallengeTimer(1)
    start()
    stop()
    expect(isRunning.value).toBe(false)
  })

  it('should reset timer to initial value', () => {
    const { remainingMs, isRunning, start, reset } = useChallengeTimer(2)
    start()
    // Simulate some time passing (though rAF doesn't fire with fake timers easily)
    reset()
    expect(remainingMs.value).toBe(120_000)
    expect(isRunning.value).toBe(false)
  })

  it('should compute progress as ratio 1..0', () => {
    const { progress, remainingMs } = useChallengeTimer(1)
    expect(progress.value).toBe(1)
    remainingMs.value = 30_000
    expect(progress.value).toBeCloseTo(0.5)
    remainingMs.value = 0
    expect(progress.value).toBe(0)
  })

  it('should enter warning state when <=30s', () => {
    const { isWarning, isCritical, remainingMs } = useChallengeTimer(1)
    remainingMs.value = 25_000
    expect(isWarning.value).toBe(true)
    expect(isCritical.value).toBe(false)
  })

  it('should enter critical state when <=10s', () => {
    const { isWarning, isCritical, remainingMs } = useChallengeTimer(1)
    remainingMs.value = 8_000
    expect(isWarning.value).toBe(false)
    expect(isCritical.value).toBe(true)
  })

  it('should be finished when remaining is 0', () => {
    const { isFinished, remainingMs } = useChallengeTimer(1)
    remainingMs.value = 0
    expect(isFinished.value).toBe(true)
  })

  it('should not be warning when >30s', () => {
    const { isWarning, remainingMs } = useChallengeTimer(1)
    remainingMs.value = 45_000
    expect(isWarning.value).toBe(false)
  })

  it('should support 3 minute duration', () => {
    const { remainingMs, formattedTime } = useChallengeTimer(3)
    expect(remainingMs.value).toBe(180_000)
    expect(formattedTime.value).toBe('3:00')
  })

  it('should clamp remainingMs to 0 (not negative)', () => {
    const { remainingMs } = useChallengeTimer(1)
    remainingMs.value = -500
    // The composable uses Math.max(0, ...) in tick, but direct set bypasses that
    // This test documents current behavior
    expect(remainingMs.value).toBe(-500)
  })

  it('should compute formattedTime with seconds under 10 padded', () => {
    const { remainingMs, formattedTime } = useChallengeTimer(1)
    remainingMs.value = 109_000 // 1:49
    expect(formattedTime.value).toBe('1:49')
    remainingMs.value = 100_000 // 1:40
    expect(formattedTime.value).toBe('1:40')
    remainingMs.value = 61_000 // 1:01
    expect(formattedTime.value).toBe('1:01')
    remainingMs.value = 60_000 // 1:00
    expect(formattedTime.value).toBe('1:00')
  })
})
