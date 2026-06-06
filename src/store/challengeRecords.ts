import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { ChallengeRecord, ChallengeResult, ChallengeDuration } from '@/types/challenge'

export const useChallengeRecordsStore = defineStore('challengeRecords', () => {
  const records = useLocalStorage<Record<string, ChallengeRecord>>('challenge-records', {})

  function getRecord(exerciseType: string): ChallengeRecord | undefined {
    return records.value[exerciseType]
  }

  function updateRecord(result: ChallengeResult): boolean {
    const existing = records.value[result.exerciseType]
    const isNewRecord = !existing || result.score > existing.bestScore

    records.value[result.exerciseType] = {
      exerciseType: result.exerciseType,
      bestScore: isNewRecord ? result.score : existing?.bestScore ?? result.score,
      bestAccuracy: Math.max(result.accuracy, existing?.bestAccuracy ?? 0),
      bestStreak: Math.max(result.bestStreak, existing?.bestStreak ?? 0),
      totalChallenges: (existing?.totalChallenges ?? 0) + 1,
      totalSolved: (existing?.totalSolved ?? 0) + result.correct,
      lastPlayed: new Date().toISOString(),
      durationPreference: result.duration,
    }

    return isNewRecord
  }

  function setDurationPreference(exerciseType: string, duration: ChallengeDuration) {
    if (!records.value[exerciseType]) {
      records.value[exerciseType] = {
        exerciseType,
        bestScore: 0,
        bestAccuracy: 0,
        bestStreak: 0,
        totalChallenges: 0,
        totalSolved: 0,
        lastPlayed: '',
        durationPreference: duration,
      }
    } else {
      records.value[exerciseType].durationPreference = duration
    }
  }

  return {
    records,
    getRecord,
    updateRecord,
    setDurationPreference,
  }
})
