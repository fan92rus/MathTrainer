<template>
  <div class="wave-view">
    <!-- Header -->
    <div class="wave-view__header">
      <button class="back-button" @click="goHome">← Назад</button>
      <div class="wave-view__stats">
        <div class="wave-view__streak">
          🔥 × {{ streak }}
        </div>
        <div class="wave-view__speed">
          ⚡ {{ (speed / 1000).toFixed(1) }}с
        </div>
        <div class="wave-view__score">
          ✅ {{ totalCorrect }} / {{ totalAnswered }}
        </div>
      </div>
      <CurrencyDisplay />
    </div>

    <!-- Pause overlay -->
    <div v-if="isPaused" class="wave-view__pause-overlay" @click="runner.resume()">
      <div class="wave-view__pause-box">
        <div class="wave-view__pause-text">⏸ Пауза</div>
        <button class="wave-view__resume-btn" @click.stop="runner.resume()">▶ Продолжить</button>
        <button class="wave-view__home-btn" @click.stop="goHome">🏠 Домой</button>
      </div>
    </div>

    <!-- Conveyor belt area -->
    <div class="wave-view__belt">
      <div v-if="currentCard" class="wave-view__card-area">
        <!-- Preview card (next) -->
        <div v-if="previewCard" class="wave-view__preview">
          <div class="wave-view__preview-expression">{{ previewCard.problem.expression }} = ?</div>
        </div>

        <!-- Current card -->
        <WaveCard
          :problem="currentCard.problem"
          :position="'current'"
          @answer="onAnswer"
        />
      </div>

      <!-- Start screen -->
      <div v-else class="wave-view__start">
        <div class="wave-view__start-title">🌊 Волна примеров</div>
        <p class="wave-view__start-desc">
          Примеры плывут по конвейеру. Реши их как можно быстрее!<br>
          Чем быстрее отвечаешь — тем быстрее плывёт волна.
        </p>
        <button class="wave-view__start-btn" @click="startWave">🚀 Начать!</button>
      </div>
    </div>

    <!-- Pause button (floating) -->
    <button
      v-if="currentCard && !isPaused"
      class="wave-view__pause-btn"
      @click="runner.pause()"
    >
      ⏸
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/store/settings'
import { useScoresStore } from '@/store/scores'
import { useWaveRunner } from '@/composables/useWaveRunner'
import { generateCountingProblem } from '@/utils/math/counting'
import WaveCard from '@/components/wave/WaveCard.vue'
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const scoresStore = useScoresStore()

const runner = useWaveRunner(() =>
  generateCountingProblem(scoresStore.countingScore, 1, settingsStore.maxCountingNumber),
)

const cards = runner.cards
const speed = runner.speed
const streak = runner.streak
const isPaused = runner.isPaused
const totalCorrect = runner.totalCorrect
const totalAnswered = runner.totalAnswered

const currentCard = computed(() => cards.value.find(c => c.position === 'current') ?? null)
const previewCard = computed(() => cards.value.find(c => c.position === 'entering') ?? null)

function onAnswer(index: number) {
  runner.answer(index)
}

function startWave() {
  runner.start()
}

function goHome() {
  runner.pause()
  router.push('/')
}

onMounted(() => {
  scoresStore.loadScores()
})
</script>

<style scoped>
.wave-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.wave-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
  flex-shrink: 0;
}

.wave-view__stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.wave-view__streak,
.wave-view__speed,
.wave-view__score {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.wave-view__belt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.wave-view__card-area {
  display: flex;
  align-items: center;
  gap: 32px;
}

.wave-view__preview {
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  opacity: 0.5;
  filter: blur(1.5px);
}

.wave-view__preview-expression {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

/* Start screen */
.wave-view__start {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.wave-view__start-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.wave-view__start-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 360px;
  line-height: 1.5;
}

.wave-view__start-btn {
  margin-top: 16px;
  padding: 14px 40px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
}

.wave-view__start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.wave-view__start-btn:active {
  transform: scale(0.98);
}

/* Pause overlay */
.wave-view__pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.wave-view__pause-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.wave-view__pause-text {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.wave-view__resume-btn,
.wave-view__home-btn {
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
}

.wave-view__resume-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.wave-view__home-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.wave-view__resume-btn:hover,
.wave-view__home-btn:hover {
  transform: scale(1.05);
}

/* Floating pause button */
.wave-view__pause-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.wave-view__pause-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .wave-view__header {
    padding: 8px 12px;
    flex-wrap: wrap;
  }

  .wave-view__stats {
    gap: 10px;
  }

  .wave-view__streak,
  .wave-view__speed,
  .wave-view__score {
    font-size: 12px;
  }

  .wave-view__start-title {
    font-size: 26px;
  }

  .wave-view__card-area {
    gap: 16px;
  }

  .wave-view__preview {
    display: none;
  }
}
</style>
