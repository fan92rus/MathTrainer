<template>
  <div class="challenge-view">
    <CountingModeSwitcher />

    <!-- Phase: Pre-start -->
    <ChallengePreStart
      v-if="phase === 'prestart'"
      exercise-type="counting"
      @start="startChallenge"
    />

    <!-- Phase: Playing -->
    <template v-else-if="phase === 'playing'">
      <ChallengeHeader
        :formatted-time="formattedTime"
        :is-warning="isWarning"
        :is-critical="isCritical"
        :current-streak="currentStreak"
        :timer-progress="timerProgress"
      />

      <ChallengeProgressBar
        :solved="totalCorrect"
        :total="totalCorrect + 20"
      />

      <!-- Math expression -->
      <div class="challenge-view__expression">
        {{ currentProblem.expression }} = ?
      </div>

      <!-- Answer options -->
      <AnswerOptions
        :options="currentProblem.options"
        :correct-index="currentProblem.correctIndex"
        :selected-index="selectedIndex"
        :answered="answered"
        @answer-selected="selectAnswer"
      />
    </template>

    <!-- Phase: Results -->
    <ChallengeResults
      v-else-if="phase === 'results' && result"
      :result="result"
      @retry="retry"
      @home="goHome"
    />
  </div>
</template>

<script setup lang="ts">
import { generateCountingProblem } from '@/utils/math/counting'
import { useChallengeMode } from '@/composables/useChallengeMode'
import ChallengePreStart from '@/components/challenge/ChallengePreStart.vue'
import ChallengeHeader from '@/components/challenge/ChallengeHeader.vue'
import ChallengeProgressBar from '@/components/challenge/ChallengeProgressBar.vue'
import ChallengeResults from '@/components/challenge/ChallengeResults.vue'
import AnswerOptions from '@/components/common/AnswerOptions.vue'
import { useRouter } from 'vue-router'
import CountingModeSwitcher from '@/components/common/CountingModeSwitcher.vue'

const router = useRouter()

const {
  phase,
  currentProblem,
  answered,
  selectedIndex,
  result,
  formattedTime,
  isWarning,
  isCritical,
  timerProgress,
  currentStreak,
  totalCorrect,
  startChallenge,
  selectAnswer,
  retry,
} = useChallengeMode({
  exerciseType: 'counting',
  generateProblem: () => generateCountingProblem(0, 1, 10),
})

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.challenge-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
}

.challenge-view__expression {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-math);
  margin: 32px 0 24px;
  text-align: center;
}

@media (max-width: 480px) {
  .challenge-view__expression {
    font-size: 28px;
    margin: 24px 0 16px;
  }
}
</style>
