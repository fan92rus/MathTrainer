import { ref, computed, onUnmounted } from 'vue'
import type { NumberLineRange, NumberLineOperation, JumpPhase, JumpAnimation } from '@/types/numberLine'

/**
 * Composable для Number Line Hop (Pattern 2).
 *
 * Управляет только СОСТОЯНИЕМ — позиция маркера, фаза прыжка, дуги.
 * Анимационную интерполяцию (rAF) делает Canvas-компонент.
 *
 * animateJump использует setTimeout для переключения фаз и resolve Promise.
 */
export function useNumberLineHop(range: NumberLineRange) {
  const markerPosition = ref(range.min)
  const jumpAnimation = ref<JumpAnimation | null>(null)
  const jumpPhase = ref<JumpPhase>('idle')
  const jumpArcs = ref<{ from: number; to: number; id: number }[]>([])
  const targetPosition = ref<number | null>(null)
  const isWaitingForTap = ref(false)

  let arcIdCounter = 0
  let pendingTimers: ReturnType<typeof setTimeout>[] = []

  function clearPending() {
    for (const t of pendingTimers) clearTimeout(t)
    pendingTimers = []
  }

  /** Доступные числа на прямой */
  const tickNumbers = computed(() => {
    const nums: number[] = []
    for (let i = range.min; i <= range.max; i += range.step) {
      nums.push(i)
    }
    return nums
  })

  /**
   * Анимация одного прыжка.
   * Фазы: preparing (150ms) → flying (durationMs) → landing (200ms bounce).
   * Canvas интерполирует визуальную позицию по jumpAnimation state.
   */
  function animateJump(from: number, to: number, durationMs: number = 500): Promise<void> {
    clearPending()
    markerPosition.value = from
    jumpPhase.value = 'preparing'
    jumpAnimation.value = {
      from,
      to,
      startTime: performance.now(),
      duration: durationMs,
      phase: 'preparing',
    }

    return new Promise<void>((resolve) => {
      // Phase 1→2: preparing → flying (150ms)
      const t1 = setTimeout(() => {
        jumpAnimation.value = {
          from,
          to,
          startTime: performance.now(),
          duration: durationMs,
          phase: 'flying',
        }
        jumpPhase.value = 'flying'
      }, 150)
      pendingTimers.push(t1)

      // Phase 2→3: flying → landing (150 + duration ms)
      const t2 = setTimeout(() => {
        jumpAnimation.value = {
          from,
          to,
          startTime: performance.now(),
          duration: 200,
          phase: 'landing',
        }
        jumpPhase.value = 'landing'
        markerPosition.value = to
        jumpArcs.value.push({ from, to, id: ++arcIdCounter })
      }, 150 + durationMs)
      pendingTimers.push(t2)

      // Phase 3→done: landing → done (150 + duration + 200 ms)
      const t3 = setTimeout(() => {
        jumpAnimation.value = null
        jumpPhase.value = 'done'
        resolve()
      }, 150 + durationMs + 200)
      pendingTimers.push(t3)
    })
  }

  /**
   * Визуализировать операцию на числовой прямой.
   * Для сложения/вычитания — один прыжок.
   * Для умножения — последовательность прыжков.
   */
  async function visualizeOperation(op: NumberLineOperation): Promise<void> {
    jumpArcs.value = []
    markerPosition.value = op.start

    const steps = op.steps ?? 1
    const stepSize = op.type === 'subtract' ? -op.step : op.step

    for (let i = 0; i < steps; i++) {
      const from = op.start + i * stepSize
      const to = from + stepSize
      await animateJump(from, to, 400)
      if (i < steps - 1) {
        await new Promise(r => setTimeout(r, 200))
      }
    }
  }

  /** Установить режим ожидания тапа */
  function waitForTap(operation: NumberLineOperation) {
    markerPosition.value = operation.start
    targetPosition.value = operation.answer
    isWaitingForTap.value = true
    jumpArcs.value = []
  }

  /** Обработать тап по числу */
  async function handleTap(num: number): Promise<boolean> {
    if (!isWaitingForTap.value || targetPosition.value === null) return false

    isWaitingForTap.value = false
    const isCorrect = num === targetPosition.value

    await animateJump(markerPosition.value, num, 400)

    if (isCorrect) {
      jumpPhase.value = 'done'
    } else {
      await new Promise(r => setTimeout(r, 800))
      await animateJump(num, targetPosition.value, 400)
    }

    return isCorrect
  }

  /** Сбросить состояние */
  function reset() {
    clearPending()
    markerPosition.value = range.min
    jumpAnimation.value = null
    jumpPhase.value = 'idle'
    jumpArcs.value = []
    targetPosition.value = null
    isWaitingForTap.value = false
  }

  onUnmounted(() => reset())

  return {
    markerPosition,
    jumpAnimation,
    jumpPhase,
    jumpArcs,
    targetPosition,
    isWaitingForTap,
    tickNumbers,
    animateJump,
    visualizeOperation,
    waitForTap,
    handleTap,
    reset,
  }
}
