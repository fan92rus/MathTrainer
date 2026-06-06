// Типы для паттерна "Скоростной вызов" (Pattern 5 — Challenge Mode)

/** Duration presets for Challenge Mode */
export type ChallengeDuration = 1 | 2 | 3 // minutes

/** Personal record per exercise type */
export interface ChallengeRecord {
  exerciseType: string
  bestScore: number
  bestAccuracy: number      // 0..1
  bestStreak: number
  totalChallenges: number
  totalSolved: number
  lastPlayed: string        // ISO date
  durationPreference: ChallengeDuration
}

/** Result of a single challenge session */
export interface ChallengeResult {
  exerciseType: string
  duration: ChallengeDuration
  score: number
  correct: number
  total: number
  accuracy: number          // 0..1
  bestStreak: number
  isNewRecord: boolean
  timestamp: number
}

/** State of a running challenge timer */
export interface ChallengeTimerState {
  remainingMs: number
  formattedTime: string
  isRunning: boolean
  isWarning: boolean   // <30s
  isCritical: boolean  // <10s
}
