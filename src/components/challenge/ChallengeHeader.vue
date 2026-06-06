<template>
  <div class="challenge-header">
    <!-- Circular SVG Timer Ring -->
    <div class="challenge-header__timer">
      <svg viewBox="0 0 100 100" class="challenge-header__timer-svg">
        <!-- Background track -->
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="6"
        />
        <!-- Progress arc -->
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          :stroke="timerColor"
          stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 50 50)"
          class="challenge-header__timer-arc"
        />
        <!-- Time text -->
        <text
          x="50" y="54"
          text-anchor="middle"
          dominant-baseline="middle"
          class="challenge-header__timer-text"
          :class="{
            'challenge-header__timer-text--warning': isWarning,
            'challenge-header__timer-text--critical': isCritical,
          }"
        >{{ formattedTime }}</text>
      </svg>
    </div>

    <!-- Streak Counter -->
    <div
      class="challenge-header__streak"
      :class="{ 'challenge-header__streak--active': currentStreak > 0 }"
    >
      <span class="challenge-header__streak-flame">🔥</span>
      <span class="challenge-header__streak-count">x{{ currentStreak }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  formattedTime: string
  isWarning: boolean
  isCritical: boolean
  currentStreak: number
  timerProgress: number // 1..0 (full → empty)
}

const props = defineProps<Props>()

const radius = 42
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
  // progress 1 = full ring, 0 = empty ring
  return circumference * (1 - props.timerProgress)
})

const timerColor = computed(() => {
  if (props.isCritical) return '#ff4444'
  if (props.isWarning) return '#ffaa00'
  return '#4caf50'
})
</script>

<style scoped>
.challenge-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px 16px;
}

/* Timer Ring */
.challenge-header__timer {
  position: relative;
  width: 64px;
  height: 64px;
}

.challenge-header__timer-svg {
  width: 100%;
  height: 100%;
}

.challenge-header__timer-arc {
  transition: stroke-dashoffset 0.3s linear, stroke 0.5s ease;
}

.challenge-header__timer-text {
  font-size: 22px;
  font-weight: 700;
  fill: #fff;
  font-family: var(--font-family, 'Rubik', sans-serif);
}

.challenge-header__timer-text--warning {
  fill: #ffaa00;
}

.challenge-header__timer-text--critical {
  fill: #ff4444;
  animation: critical-pulse 0.8s ease-in-out infinite;
}

@keyframes critical-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Streak */
.challenge-header__streak {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-sm, 12px);
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.challenge-header__streak--active {
  opacity: 1;
  background: rgba(255, 165, 0, 0.25);
  box-shadow: 0 0 12px rgba(255, 165, 0, 0.3);
}

.challenge-header__streak-flame {
  font-size: 20px;
  line-height: 1;
}

.challenge-header__streak-count {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

@media (max-width: 480px) {
  .challenge-header__timer { width: 56px; height: 56px; }
  .challenge-header__timer-text { font-size: 18px; }
}
</style>
