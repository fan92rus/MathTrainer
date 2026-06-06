<template>
  <div class="results" v-if="result">
    <!-- Praise -->
    <h2 class="results__praise">{{ praise }}</h2>

    <!-- Stats -->
    <div class="results__stats">
      <div class="results__stat" style="animation-delay: 0.1s">
        <span class="results__stat-icon">⏱</span>
        <span class="results__stat-value">{{ result.duration }} мин</span>
        <span class="results__stat-label">Время</span>
      </div>
      <div class="results__stat" style="animation-delay: 0.2s">
        <span class="results__stat-icon">✅</span>
        <span class="results__stat-value">{{ result.correct }} / {{ result.total }}</span>
        <span class="results__stat-label">Правильных</span>
      </div>
      <div class="results__stat" style="animation-delay: 0.3s">
        <span class="results__stat-icon">🔥</span>
        <span class="results__stat-value">{{ result.bestStreak }}</span>
        <span class="results__stat-label">Лучший стрик</span>
      </div>
      <div class="results__stat" style="animation-delay: 0.4s">
        <span class="results__stat-icon">⭐</span>
        <span class="results__stat-value">{{ result.score }}</span>
        <span class="results__stat-label">Очков</span>
      </div>
    </div>

    <!-- New Record Badge -->
    <div v-if="result.isNewRecord" class="results__record">
      🏆 Новый рекорд!
    </div>

    <!-- Action Buttons -->
    <div class="results__actions">
      <button class="results__btn results__btn--primary" @click="emit('retry')">
        🔄 Ещё!
      </button>
      <button class="results__btn results__btn--secondary" @click="emit('home')">
        🏠 Домой
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { ChallengeResult } from '@/types/challenge'

interface Props {
  result: ChallengeResult
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
  home: []
}>()

const praise = computed(() => {
  const accuracy = props.result.accuracy
  if (accuracy >= 0.9) return 'Гений! 🎉'
  if (accuracy >= 0.75) return 'Отлично! 🌟'
  if (accuracy >= 0.6) return 'Молодец! 👍'
  return 'Попробуй ещё! 💪'
})

onMounted(() => {
  // canvas-confetti burst on results
  try {
    import('canvas-confetti').then(({ default: confetti }) => {
      const duration = 3000
      const end = Date.now() + duration
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    })
  } catch {
    // confetti not available — graceful degradation
  }
})
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  animation: results-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes results-enter {
  0% { opacity: 0; transform: translateY(30px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.results__praise {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  animation: praise-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

@keyframes praise-bounce {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.results__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.results__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-sm, 12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  opacity: 0;
  animation: stat-enter 0.4s ease forwards;
}

@keyframes stat-enter {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.results__stat-icon {
  font-size: 24px;
  line-height: 1;
}

.results__stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.results__stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.results__record {
  font-size: 22px;
  font-weight: 700;
  color: #ffd700;
  padding: 8px 24px;
  border-radius: var(--radius-md, 15px);
  background: rgba(255, 215, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.4);
  animation: record-glow 1.5s ease-in-out infinite alternate;
  text-shadow: 0 1px 4px rgba(255, 215, 0, 0.5);
}

@keyframes record-glow {
  0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
  100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); }
}

.results__actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.results__btn {
  padding: 14px 28px;
  font-size: 17px;
  font-weight: 600;
  font-family: var(--font-family, 'Rubik', sans-serif);
  border: none;
  border-radius: var(--radius-md, 15px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.results__btn--primary {
  color: #333;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  box-shadow: 0 4px 15px rgba(255, 170, 0, 0.4);
}

.results__btn--primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 20px rgba(255, 170, 0, 0.5);
}

.results__btn--secondary {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.results__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .results__praise { font-size: 26px; }
  .results__stat-value { font-size: 18px; }
  .results__btn { padding: 12px 20px; font-size: 15px; }
}
</style>
