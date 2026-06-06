import { ref, computed, onUnmounted } from 'vue'
import type { ChallengeDuration } from '@/types/challenge'

/**
 * requestAnimationFrame-based countdown timer for Challenge Mode.
 * Pauses automatically when tab loses focus.
 */
export function useChallengeTimer(durationMinutes: ChallengeDuration) {
  const totalMs = durationMinutes * 60 * 1000
  const remainingMs = ref(totalMs)
  const isRunning = ref(false)
  let animationFrameId: number | null = null
  let lastTimestamp = 0

  const formattedTime = computed(() => {
    const totalSeconds = Math.ceil(remainingMs.value / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const isWarning = computed(() => remainingMs.value <= 30_000 && remainingMs.value > 10_000)
  const isCritical = computed(() => remainingMs.value <= 10_000 && remainingMs.value > 0)
  const isFinished = computed(() => remainingMs.value <= 0)
  const progress = computed(() => remainingMs.value / totalMs) // 1..0

  function tick(timestamp: number) {
    if (!isRunning.value) return
    if (lastTimestamp === 0) lastTimestamp = timestamp
    const delta = timestamp - lastTimestamp
    lastTimestamp = timestamp
    remainingMs.value = Math.max(0, remainingMs.value - delta)
    if (remainingMs.value > 0) {
      animationFrameId = requestAnimationFrame(tick)
    } else {
      isRunning.value = false
    }
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    lastTimestamp = 0
    animationFrameId = requestAnimationFrame(tick)
  }

  function stop() {
    isRunning.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  function reset() {
    stop()
    remainingMs.value = totalMs
    lastTimestamp = 0
  }

  onUnmounted(() => stop())

  return {
    remainingMs,
    formattedTime,
    isRunning,
    isWarning,
    isCritical,
    isFinished,
    progress,
    start,
    stop,
    reset,
  }
}
