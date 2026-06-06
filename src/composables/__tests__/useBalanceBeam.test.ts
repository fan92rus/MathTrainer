import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBalanceBeam } from '../useBalanceBeam'
import type { BalanceConfig } from '@/types/balance'

function makeConfig(overrides: Partial<BalanceConfig> = {}): { config: ReturnType<typeof ref<BalanceConfig>> } {
  const config = ref<BalanceConfig>({
    leftValue: 8,
    rightKnownPart: 3,
    correctAnswer: 5,
    maxTilt: 15,
    ...overrides,
  })
  return { config }
}

describe('useBalanceBeam', () => {
  describe('initialization', () => {
    it('should start with no selected value', () => {
      const { config } = makeConfig()
      const { selectedValue } = useBalanceBeam(config)
      expect(selectedValue.value).toBeNull()
    })

    it('should start not answered', () => {
      const { config } = makeConfig()
      const { hasAnswered } = useBalanceBeam(config)
      expect(hasAnswered.value).toBe(false)
    })

    it('should start not balanced', () => {
      const { config } = makeConfig()
      const { isBalanced } = useBalanceBeam(config)
      expect(isBalanced.value).toBe(false)
    })

    it('should start with zero attempts', () => {
      const { config } = makeConfig()
      const { attempts } = useBalanceBeam(config)
      expect(attempts.value).toBe(0)
    })

    it('should have zero tilt when nothing selected', () => {
      const { config } = makeConfig()
      const { tiltAngle } = useBalanceBeam(config)
      expect(tiltAngle.value).toBe(0)
    })

    it('should have balanced tilt state initially', () => {
      const { config } = makeConfig()
      const { tiltState } = useBalanceBeam(config)
      expect(tiltState.value).toBe('balanced')
    })

    it('should compute rightTotal as knownPart only when nothing selected', () => {
      const { config } = makeConfig()
      const { rightTotal } = useBalanceBeam(config)
      expect(rightTotal.value).toBe(3)
    })
  })

  describe('selectValue — correct answer', () => {
    it('should balance when correct value is selected', () => {
      const { config } = makeConfig()
      const { selectValue, isBalanced, hasAnswered } = useBalanceBeam(config)
      selectValue(5) // left(8) = rightKnown(3) + selected(5)
      expect(isBalanced.value).toBe(true)
      expect(hasAnswered.value).toBe(true)
    })

    it('should have zero tilt when balanced', () => {
      const { config } = makeConfig()
      const { selectValue, tiltAngle } = useBalanceBeam(config)
      selectValue(5)
      expect(tiltAngle.value).toBe(0)
    })

    it('should increment attempts on correct answer', () => {
      const { config } = makeConfig()
      const { selectValue, attempts } = useBalanceBeam(config)
      selectValue(5)
      expect(attempts.value).toBe(1)
    })

    it('should block further answers after correct', () => {
      const { config } = makeConfig()
      const { selectValue, attempts, isBalanced } = useBalanceBeam(config)
      selectValue(5)
      selectValue(3) // Should be blocked
      expect(attempts.value).toBe(1)
      expect(isBalanced.value).toBe(true)
    })

    it('should compute rightTotal correctly when selected', () => {
      const { config } = makeConfig()
      const { selectValue, rightTotal } = useBalanceBeam(config)
      selectValue(5)
      expect(rightTotal.value).toBe(8) // 3 + 5
    })
  })

  describe('selectValue — wrong answer', () => {
    it('should not balance when wrong value selected', () => {
      const { config } = makeConfig()
      const { selectValue, isBalanced } = useBalanceBeam(config)
      selectValue(3) // 3 + 3 = 6 ≠ 8
      expect(isBalanced.value).toBe(false)
    })

    it('should tilt left-heavy when right is lighter', () => {
      const { config } = makeConfig()
      const { selectValue, tiltState } = useBalanceBeam(config)
      selectValue(2) // 3 + 2 = 5 < 8
      expect(tiltState.value).toBe('left-heavy')
    })

    it('should tilt right-heavy when right is heavier', () => {
      const { config } = makeConfig()
      const { selectValue, tiltState } = useBalanceBeam(config)
      selectValue(8) // 3 + 8 = 11 > 8
      expect(tiltState.value).toBe('right-heavy')
    })

    it('should allow retry after wrong answer', () => {
      const { config } = makeConfig()
      const { selectValue, attempts, isBalanced } = useBalanceBeam(config)
      selectValue(2) // wrong
      selectValue(5) // correct
      expect(attempts.value).toBe(2)
      expect(isBalanced.value).toBe(true)
    })

    it('should compute tilt angle proportional to difference', () => {
      const { config } = makeConfig()
      const { selectValue, tiltAngle } = useBalanceBeam(config)
      selectValue(2) // diff = 8 - 5 = 3 → 3 * 1.5 = 4.5°
      expect(tiltAngle.value).toBe(4.5)
    })

    it('should clamp tilt angle to maxTilt', () => {
      const { config } = makeConfig()
      const { selectValue, tiltAngle } = useBalanceBeam(config)
      selectValue(20) // diff = 8 - 23 = -15 → min(-22.5, -15) → -15°
      expect(Math.abs(tiltAngle.value)).toBeLessThanOrEqual(15)
    })
  })

  describe('previewTilt', () => {
    it('should preview tilt without committing', () => {
      const { config } = makeConfig()
      const { previewTilt, selectedValue } = useBalanceBeam(config)
      const angle = previewTilt(2)
      expect(typeof angle).toBe('number')
      expect(selectedValue.value).toBeNull() // Not committed
    })

    it('should return 0 for balancing value', () => {
      const { config } = makeConfig()
      const { previewTilt } = useBalanceBeam(config)
      expect(previewTilt(5)).toBe(0)
    })
  })

  describe('reset', () => {
    it('should reset all state', () => {
      const { config } = makeConfig()
      const { selectValue, reset, selectedValue, hasAnswered, isBalanced, attempts } = useBalanceBeam(config)
      selectValue(3) // wrong
      selectValue(5) // correct
      reset()

      expect(selectedValue.value).toBeNull()
      expect(hasAnswered.value).toBe(false)
      expect(isBalanced.value).toBe(false)
      expect(attempts.value).toBe(0)
    })

    it('should allow new answer after reset', () => {
      const { config } = makeConfig()
      const { selectValue, reset, isBalanced, attempts } = useBalanceBeam(config)
      selectValue(5)
      reset()
      selectValue(5)
      expect(isBalanced.value).toBe(true)
      expect(attempts.value).toBe(1)
    })

    it('should update config on reset with newConfig', () => {
      const { config } = makeConfig()
      const { selectValue, reset, isBalanced } = useBalanceBeam(config)
      reset({ leftValue: 10, rightKnownPart: 4, correctAnswer: 6 })
      selectValue(6)
      expect(isBalanced.value).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle all zeros', () => {
      const { config } = makeConfig({ leftValue: 0, rightKnownPart: 0, correctAnswer: 0 })
      const { selectValue, isBalanced, tiltAngle } = useBalanceBeam(config)
      selectValue(0)
      expect(isBalanced.value).toBe(true)
      expect(tiltAngle.value).toBe(0)
    })

    it('should handle negative values', () => {
      const { config } = makeConfig({ leftValue: 5, rightKnownPart: 8, correctAnswer: -3 })
      const { selectValue, isBalanced } = useBalanceBeam(config)
      selectValue(-3)
      expect(isBalanced.value).toBe(true)
    })

    it('should handle very large tilt values', () => {
      const { config } = makeConfig({ leftValue: 100, rightKnownPart: 0, correctAnswer: 100, maxTilt: 20 })
      const { selectValue, tiltAngle } = useBalanceBeam(config)
      selectValue(0) // diff = 100 - 0 = 100 → clamped to 20°
      expect(Math.abs(tiltAngle.value)).toBe(20)
    })
  })
})
