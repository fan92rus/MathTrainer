import { ref, computed, onUnmounted } from 'vue'
import type { NumberLineRange, NumberLineOperation, JumpPhase } from '@/types/numberLine'

/**
 * Composable для Number Line Hop (Pattern 2).
 *
 * Управляет:
 * - позицией маркера на числовой прямой
 * - анимацией прыжков (подготовка → полёт → приземление)
 * - мульти-прыжками для умножения
 * - определением правильного ответа через тап по числу
 */
export function useNumberLineHop(range: NumberLineRange) {
  const markerPosition = ref(range.min)
  const jumpPhase = ref<JumpPhase>('idle')
  const jumpArcs = ref<{ from: number; to: number; id: number }[]>([])
  const targetPosition = ref<number | null>(null)
  const isWaitingForTap = ref(false)

  let arcIdCounter = 0

  /** Доступные числа для тапа */
  const tickNumbers = computed(() => {
    const nums: number[] = []
    for (let i = range.min; i <= range.max; i += range.step) {
      nums.push(i)
    }
    return nums
  })

  /** Ширина одного деления в px (вычисляется в компоненте) */
  const tickWidth = computed(() => {
    const count = tickNumbers.value.length
    // ~28px минимум, до ~60px максимум
    return Math.max(28, Math.min(60, 600 / count))
  })

  /** Позиция числа на оси X (px) */
  function positionForNumber(num: number): number {
    return (num - range.min) / range.step * tickWidth.value
  }

  /**
   * Анимация одного прыжка маркера.
   * Возвращает Promise, который резолвится после завершения.
   */
  function animateJump(from: number, to: number, durationMs: number = 600): Promise<void> {
    return new Promise((resolve) => {
      jumpPhase.value = 'preparing'

      // Phase 1: подготовка (200ms)
      setTimeout(() => {
        jumpPhase.value = 'flying'
        markerPosition.value = from

        // Phase 2: полёт — плавный переход
        const startTime = performance.now()
        function step(now: number) {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / durationMs, 1)
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          markerPosition.value = from + (to - from) * eased

          if (progress < 1) {
            requestAnimationFrame(step)
          } else {
            jumpPhase.value = 'landing'
            markerPosition.value = to

            // Записываем дугу
            jumpArcs.value.push({ from, to, id: ++arcIdCounter })

            // Phase 3: приземление (150ms)
            setTimeout(() => {
              jumpPhase.value = 'done'
              resolve()
            }, 150)
          }
        }
        requestAnimationFrame(step)
      }, 200)
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

  /**
   * Установить режим ожидания тапа от пользователя.
   * Пользователь должен тапнуть на число = правильный ответ.
   */
  function waitForTap(operation: NumberLineOperation) {
    markerPosition.value = operation.start
    targetPosition.value = operation.answer
    isWaitingForTap.value = true
    jumpArcs.value = []
  }

  /**
   * Обработать тап по числу.
   * Возвращает true если ответ правильный.
   */
  async function handleTap(num: number): Promise<boolean> {
    if (!isWaitingForTap.value || targetPosition.value === null) return false

    isWaitingForTap.value = false
    const isCorrect = num === targetPosition.value

    // Анимируем прыжок к выбранному числу
    await animateJump(markerPosition.value, num, 400)

    if (isCorrect) {
      jumpPhase.value = 'done'
    } else {
      // Пауза, затем прыжок к правильному ответу
      await new Promise(r => setTimeout(r, 800))
      await animateJump(num, targetPosition.value, 400)
    }

    return isCorrect
  }

  /** Сбросить состояние */
  function reset() {
    markerPosition.value = range.min
    jumpPhase.value = 'idle'
    jumpArcs.value = []
    targetPosition.value = null
    isWaitingForTap.value = false
  }

  onUnmounted(() => reset())

  return {
    markerPosition,
    jumpPhase,
    jumpArcs,
    targetPosition,
    isWaitingForTap,
    tickNumbers,
    tickWidth,
    positionForNumber,
    visualizeOperation,
    waitForTap,
    handleTap,
    reset,
  }
}
