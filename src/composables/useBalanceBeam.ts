import { ref, computed, type Ref } from 'vue'
import type { BalanceConfig, BalanceTiltState } from '@/types/balance'

/**
 * Composable for Pattern 4 — Balance Beam (Весы для уравнений).
 *
 * Управляет состоянием весов: наклон, проверка баланса, анимация.
 * Ребёнок подбирает значение чтобы уравновесить весы.
 */
export function useBalanceBeam(config: Ref<BalanceConfig>) {
  const selectedValue = ref<number | null>(null)
  const hasAnswered = ref(false)
  const isBalanced = ref(false)
  const attempts = ref(0)

  /** Current tilt angle in degrees */
  const tiltAngle = computed(() => {
    const { leftValue, rightKnownPart, maxTilt } = config.value
    const selected = selectedValue.value

    // Not selected yet — balanced at start
    if (selected === null) return 0

    const rightTotal = rightKnownPart + selected
    const diff = leftValue - rightTotal

    // Clamped tilt: max ±15 degrees
    const angle = Math.sign(diff) * Math.min(Math.abs(diff) * 1.5, maxTilt || 15)
    return angle
  })

  /** Tilt state for CSS class */
  const tiltState = computed<BalanceTiltState>(() => {
    if (selectedValue.value === null) return 'balanced'
    if (tiltAngle.value === 0) return 'balanced'
    if (tiltAngle.value > 0) return 'left-heavy'
    return 'right-heavy'
  })

  /** Total weight on right pan (known + selected) */
  const rightTotal = computed(() => {
    if (selectedValue.value === null) return config.value.rightKnownPart
    return config.value.rightKnownPart + selectedValue.value
  })

  /** Preview tilt for a given value (without committing) */
  function previewTilt(value: number): number {
    const { leftValue, rightKnownPart, maxTilt } = config.value
    const diff = leftValue - (rightKnownPart + value)
    return Math.sign(diff) * Math.min(Math.abs(diff) * 1.5, maxTilt || 15)
  }

  /**
   * Select a value for the unknown part.
   * Updates tilt and checks balance.
   */
  function selectValue(value: number): void {
    if (hasAnswered.value) return
    selectedValue.value = value
    attempts.value++

    // Check balance
    const { leftValue, correctAnswer } = config.value
    isBalanced.value = (leftValue === config.value.rightKnownPart + value) && value === correctAnswer

    if (isBalanced.value) {
      hasAnswered.value = true
    }
  }

  /** Reset for a new problem */
  function reset(newConfig?: Partial<BalanceConfig>): void {
    if (newConfig) {
      Object.assign(config.value, newConfig)
    }
    selectedValue.value = null
    hasAnswered.value = false
    isBalanced.value = false
    attempts.value = 0
  }

  return {
    selectedValue,
    hasAnswered,
    isBalanced,
    attempts,
    tiltAngle,
    tiltState,
    rightTotal,
    previewTilt,
    selectValue,
    reset,
  }
}
