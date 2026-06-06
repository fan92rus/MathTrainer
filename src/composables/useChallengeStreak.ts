import { ref, computed } from 'vue'

/**
 * Within-session streak tracking for Challenge Mode.
 * Different from daily streak (streaks.ts).
 */
export function useChallengeStreak() {
  const currentStreak = ref(0)
  const bestStreak = ref(0)
  const totalCorrect = ref(0)
  const totalAnswered = ref(0)

  const milestones = [3, 5, 7, 10, 15, 20]

  /** Check if current streak is a milestone */
  const isMilestone = computed(() => milestones.includes(currentStreak.value))

  /** Get last passed milestone */
  const lastMilestone = computed(() => {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (currentStreak.value >= (milestones[i] ?? 0)) return milestones[i]
    }
    return 0
  })

  const accuracy = computed(() =>
    totalAnswered.value > 0 ? totalCorrect.value / totalAnswered.value : 0
  )

  function recordCorrect() {
    currentStreak.value++
    totalCorrect.value++
    totalAnswered.value++
    if (currentStreak.value > bestStreak.value) {
      bestStreak.value = currentStreak.value
    }
  }

  function recordIncorrect() {
    currentStreak.value = 0
    totalAnswered.value++
  }

  function reset() {
    currentStreak.value = 0
    bestStreak.value = 0
    totalCorrect.value = 0
    totalAnswered.value = 0
  }

  return {
    currentStreak,
    bestStreak,
    totalCorrect,
    totalAnswered,
    accuracy,
    isMilestone,
    lastMilestone,
    milestones,
    recordCorrect,
    recordIncorrect,
    reset,
  }
}
