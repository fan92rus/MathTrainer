<template>
  <div class="app-container">
    <AchievementManager />

    <!-- Coin animation -->
    <CoinAnimation
      v-if="showCoinAnimation"
      :amount="coinsEarned"
      @animationEnd="showCoinAnimation = false"
    />

    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <!-- Main game content -->
        <div class="game-main">
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <button class="back-button" @click="goToMain">← Назад</button>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span class="level-indicator">Уровень {{ currentLevel }}</span>
                <CurrencyDisplay />
              </div>
            </div>
            <h1 class="title">📏 Прыжки по прямой</h1>
          </div>

          <ScoreDisplay
            :current-score="score"
            :total-score="totalScore"
            :current-question="currentQuestion"
            :total-questions="totalQuestions"
          />

          <!-- Expression -->
          <div class="math-expression">{{ currentProblem?.expression }} = ?</div>

          <!-- Number Line — always fits screen -->
          <NumberLine
            :range="numberLineRange"
            :marker-position="markerPosition"
            :jump-animation="jumpAnimation"
            :jump-phase="jumpPhase"
            :jump-arcs="jumpArcs"
            :target-position="targetPosition"
            :is-waiting-for-tap="isWaitingForTap"
          />

          <!-- Answer options (tap to select, frog jumps to answer) -->
          <div class="answer-row" :class="{ 'answer-row--disabled': isAnimating }">
            <button
              v-for="(option, idx) in (currentProblem?.options || [])"
              :key="idx"
              class="answer-btn"
              :class="{
                'answer-btn--correct': answered && idx === (currentProblem?.correctIndex ?? 0),
                'answer-btn--wrong': answered && selectedIndex === idx && idx !== (currentProblem?.correctIndex ?? 0),
              }"
              :disabled="answered || isAnimating"
              @click="handleAnswerSelected(idx)"
            >
              {{ option }}
            </button>
          </div>

          <div class="game-container-footer">
            <ProgressBar :progress-percent="progressPercent" />
            <StarRating :score="score" />
          </div>
        </div>

        <!-- Tower on desktop -->
        <Tower
          class="counting-tower"
          :floors="towerFloors"
          :target-height="towerTargetHeight"
          theme="castle"
          :completed="towerCompleted"
        />
      </div>

      <GameOver
        v-else
        :correct-answers="correctAnswers"
        :total-answers="totalAnswers"
        :score="score"
        @restart="restartGame"
        @exit="goToMain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresStore } from '@/store/scores'
import { useSettingsStore } from '@/store/settings'
import { useDailyTasks } from '@/composables/useDailyTasks'
import { useGameLogic } from '@/composables/useGameLogic'
import { useAchievements, useSessionTimeTracker } from '@/composables/useAchievements'
import { useCoins } from '@/composables/useCoins'
import { useTower } from '@/composables/useTower'
import { useNumberLineHop } from '@/composables/useNumberLineHop'
import { generateCountingProblem } from '@/utils/math'
import type { NumberLineRange } from '@/types/numberLine'
import ScoreDisplay from '@/components/common/ScoreDisplay.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import StarRating from '@/components/common/StarRating.vue'
import GameOver from '@/components/common/GameOver.vue'
import AchievementManager from '@/components/AchievementManager.vue'
import CoinAnimation from '@/components/common/CoinAnimation.vue'
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue'
import Tower from '@/components/tower/Tower.vue'
import NumberLine from '@/components/numberline/NumberLine.vue'

const router = useRouter()
const scoresStore = useScoresStore()
const settingsStore = useSettingsStore()
const { ensureTasks } = useDailyTasks()
const { checkAchievements } = useAchievements()
const { startSession, addProblem, getSessionData } = useSessionTimeTracker()
const { showCoinAnimation, coinsEarned, awardCoins } = useCoins()
const totalQuestions = 10

// Number line range: 0 to maxNumber for the current level
const maxNumber = computed(() => settingsStore.maxCountingNumber)
const numberLineRange = computed<NumberLineRange>(() => ({
  min: 0,
  max: Math.max(maxNumber.value, 10),
  step: 1,
  labelAll: true,
}))

const {
  markerPosition,
  jumpAnimation,
  jumpPhase,
  jumpArcs,
  targetPosition,
  isWaitingForTap,
  animateJump,
  reset: resetNumberLine,
} = useNumberLineHop(numberLineRange.value)

// Tower integration
const grade = settingsStore.selectedGrade
const towerTargetHeight = !grade || grade <= 1 ? 10 : grade === 2 ? 12 : 15
const towerMilestones = [Math.floor(towerTargetHeight / 2), towerTargetHeight]
const {
  floors: towerFloors,
  completed: towerCompleted,
  addFloor,
  showWaitingFloor,
  resetTower,
} = useTower({
  theme: 'castle',
  targetHeight: towerTargetHeight,
  milestones: towerMilestones,
})

// Game logic
const {
  score,
  currentQuestion,
  answered,
  selectedIndex,
  gameOver,
  currentLevel,
  progressPercent,
  currentProblem,
  correctAnswers,
  totalAnswers,
  errorsPerQuestion,
  initializeGame,
  selectAnswer,
  generateAllProblems,
} = useGameLogic(totalQuestions)

const totalScore = scoresStore.countingScore

let currentStreak = 0
const isAnimating = ref(false)

// When a new problem appears, position the frog at the first operand
watch(currentProblem, (problem) => {
  if (!problem) return
  markerPosition.value = problem.num1
  jumpArcs.value = []
  jumpPhase.value = 'idle'
  isAnimating.value = false
}, { immediate: true })

async function handleAnswerSelected(index: number) {
  if (answered.value || isAnimating.value) return
  if (!currentProblem.value) return

  const correctIndex = currentProblem.value.correctIndex
  const isCorrect = index === correctIndex
  const selectedValue = Number(currentProblem.value.options[index])
  const correctValue = currentProblem.value.correctAnswer
  const startFrom = markerPosition.value

  isAnimating.value = true

  if (isCorrect) {
    currentStreak++
    // Frog jumps from start to correct answer
    await animateJump(startFrom, correctValue, 500)
  } else {
    currentStreak = 0
    // Frog jumps to wrong number (orange shake handled by CSS), then to correct
    await animateJump(startFrom, selectedValue, 400)
    await new Promise(r => setTimeout(r, 600))
    await animateJump(selectedValue, correctValue, 400)
  }

  isAnimating.value = false

  // Use game logic selectAnswer for scoring/progression
  selectAnswer(index, correctIndex, (points) => {
    scoresStore.updateCountingScore(points)
    if (isCorrect) {
      const errors = errorsPerQuestion.value[currentQuestion.value] || 0
      awardCoins('counting', currentLevel.value, errors)
      checkAchievements(scoresStore, {
        type: 'counting',
        correct: true,
        streak: currentStreak,
        ...getSessionData(),
      })
      const expr = currentProblem.value?.expression || ''
      const answer = Number(currentProblem.value?.options[currentProblem.value.correctIndex]) || 0
      addFloor(expr, answer)
    }
  })

  if (!isCorrect) {
    showWaitingFloor()
  }
}

function restartGame() {
  initializeGame()
  currentStreak = 0
  resetTower()
  resetNumberLine()
  startSession()
  generateAllProblems(() => {
    return generateCountingProblem(
      scoresStore.countingScore,
      currentLevel.value,
      maxNumber.value,
    )
  })
}

function goToMain() {
  router.push('/')
}

onMounted(() => {
  scoresStore.loadScores()
  ensureTasks()
  restartGame()
})

watch(currentQuestion, () => {
  addProblem()
})
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
}

.game-container-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.game-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.math-expression {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 700;
  color: var(--color-math);
  margin: 8px 0;
}

.answer-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 8px 0;
}

.answer-row--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.answer-btn {
  min-width: 56px;
  min-height: 56px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 2px solid var(--color-border-light);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.08);
}

.answer-btn:hover {
  background: var(--color-bg-accent);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.answer-btn:active {
  transform: scale(0.95);
}

.answer-btn--correct {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.answer-btn--wrong {
  background: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.game-container-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* Desktop: tower to the right */
@media (min-width: 769px) {
  .game-container-inner {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 24px;
  }

  .game-main {
    flex: 0 1 auto;
  }

  .counting-tower {
    flex-shrink: 0;
    align-self: stretch;
    max-height: 70vh;
  }
}

@media (max-width: 768px) {
  .counting-tower {
    align-self: center;
  }

  .answer-btn {
    min-width: 48px;
    min-height: 48px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .answer-btn {
    min-width: 44px;
    min-height: 44px;
    font-size: 16px;
    padding: 6px 12px;
  }

  .math-expression {
    font-size: clamp(22px, 6vw, 28px);
    margin: 6px 0;
  }
}
</style>
