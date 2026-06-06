import { ref, shallowRef, watch, type Ref } from 'vue'
import type { ChallengeDuration, ChallengeResult } from '@/types/challenge'
import { useChallengeTimer } from './useChallengeTimer'
import { useChallengeStreak } from './useChallengeStreak'
import { useChallengeRecordsStore } from '@/store/challengeRecords'
import type { MathProblem } from '@/types'

export type ChallengePhase = 'prestart' | 'playing' | 'results'

interface ChallengeModeOptions {
  exerciseType: string
  generateProblem: () => MathProblem
}

/**
 * Main orchestrator for Challenge Mode (Pattern 5).
 * Ties together: timer + streak + score + question generation + records.
 *
 * The timer is re-created when duration changes (startChallenge),
 * because useChallengeTimer captures durationMinutes in a closure.
 * We use shallowRef for the timer to prevent Vue from auto-unwrapping
 * the nested ComputedRef properties.
 */
export function useChallengeMode(options: ChallengeModeOptions) {
  const { exerciseType, generateProblem } = options
  const recordsStore = useChallengeRecordsStore()

  // Phase management
  const phase = ref<ChallengePhase>('prestart')
  const selectedDuration = ref<ChallengeDuration>(2)

  // Reactive timer holder — shallowRef prevents auto-unwrapping of inner refs/computeds
  const timerHolder = shallowRef<ReturnType<typeof useChallengeTimer> | null>(null)

  function getTimer() {
    return timerHolder.value!
  }

  // Streak (within-session, independent of timer lifecycle)
  const streak = useChallengeStreak()

  // Current problem
  const currentProblem = ref<MathProblem>(generateProblem())
  const answered = ref(false)
  const selectedIndex = ref<number | null>(null)

  // Score: 100 points per correct + streak bonus (capped at 10)
  const score = ref(0)

  // Results
  const result = ref<ChallengeResult | null>(null)

  // Timer state mirrors — plain refs synced from the timer via rAF
  const formattedTime = ref('2:00')
  const isWarning = ref(false)
  const isCritical = ref(false)
  const isFinished = ref(false)
  const timerProgress = ref(1)

  /** Sync timer reactive state into our top-level refs */
  function syncTimerState() {
    const t = timerHolder.value
    if (!t) return
    formattedTime.value = t.formattedTime.value
    isWarning.value = t.isWarning.value
    isCritical.value = t.isCritical.value
    isFinished.value = t.isFinished.value
    timerProgress.value = t.progress.value
  }

  // rAF-based sync loop — mirrors timer state into our plain refs
  let _syncRafId: number | null = null
  function startTimerSync() {
    function sync() {
      syncTimerState()
      if (phase.value === 'playing' && !timerHolder.value?.isFinished.value) {
        _syncRafId = requestAnimationFrame(sync)
      }
    }
    _syncRafId = requestAnimationFrame(sync)
  }
  function stopTimerSync() {
    if (_syncRafId !== null) {
      cancelAnimationFrame(_syncRafId)
      _syncRafId = null
    }
  }

  // Generate next problem
  function nextProblem() {
    currentProblem.value = generateProblem()
    answered.value = false
    selectedIndex.value = null
  }

  // Start challenge — creates fresh timer with chosen duration
  function startChallenge(duration: ChallengeDuration) {
    selectedDuration.value = duration
    phase.value = 'playing'
    score.value = 0
    streak.reset()
    result.value = null

    // Create a new timer instance for this duration
    timerHolder.value = useChallengeTimer(duration)
    nextProblem()

    // Small delay to let UI render, then start timer + sync
    setTimeout(() => {
      getTimer().start()
      startTimerSync()
    }, 100)
  }

  // Handle answer selection
  function selectAnswer(index: number) {
    if (answered.value || phase.value !== 'playing') return

    selectedIndex.value = index
    answered.value = true

    const isCorrect = index === currentProblem.value.correctIndex

    if (isCorrect) {
      streak.recordCorrect()
      const streakBonus = Math.min(streak.currentStreak.value, 10) * 10
      score.value += 100 + streakBonus
    } else {
      streak.recordIncorrect()
    }

    // Quick transition to next problem (300-500ms as per PRD)
    if (!isFinished.value) {
      setTimeout(() => nextProblem(), 400)
    }
  }

  // Watch for timer finish
  watch(isFinished, (finished) => {
    if (finished && phase.value === 'playing') {
      stopTimerSync()
      endChallenge()
    }
  })

  // End challenge — compute results and update records
  function endChallenge() {
    stopTimerSync()
    getTimer().stop()
    phase.value = 'results'

    const challengeResult: ChallengeResult = {
      exerciseType,
      duration: selectedDuration.value,
      score: score.value,
      correct: streak.totalCorrect.value,
      total: streak.totalAnswered.value,
      accuracy: streak.accuracy.value,
      bestStreak: streak.bestStreak.value,
      isNewRecord: false,
      timestamp: Date.now(),
    }

    // Check and update personal records
    challengeResult.isNewRecord = recordsStore.updateRecord(challengeResult)
    result.value = challengeResult
  }

  // Retry — go back to prestart
  function retry() {
    stopTimerSync()
    if (timerHolder.value) timerHolder.value.stop()
    phase.value = 'prestart'
    result.value = null
    score.value = 0
    streak.reset()
  }

  return {
    phase,
    selectedDuration,
    currentProblem,
    answered,
    selectedIndex,
    score,
    result,
    // Timer (plain refs, synced from timer via rAF)
    formattedTime,
    isWarning,
    isCritical,
    timerProgress,
    isFinished,
    // Streak
    currentStreak: streak.currentStreak as Ref<number>,
    bestStreak: streak.bestStreak as Ref<number>,
    totalCorrect: streak.totalCorrect as Ref<number>,
    totalAnswered: streak.totalAnswered as Ref<number>,
    // Methods
    startChallenge,
    selectAnswer,
    retry,
  }
}
