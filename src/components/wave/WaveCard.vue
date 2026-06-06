<template>
  <div class="wave-card" :class="`wave-card--${position}`">
    <div class="wave-card__expression">{{ problem.expression }} = ?</div>
    <div class="wave-card__options">
      <button
        v-for="(opt, i) in problem.options"
        :key="i"
        class="wave-card__option"
        @click="emit('answer', i)"
      >
        {{ opt }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MathProblem } from '@/types'

defineProps<{
  problem: MathProblem
  position: 'hidden' | 'entering' | 'current' | 'leaving' | 'passed'
}>()

const emit = defineEmits<{
  answer: [index: number]
}>()
</script>

<style scoped>
.wave-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: var(--color-bg);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.12);
  border: 2px solid var(--color-border-light);
  min-width: 240px;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.5s ease;
  will-change: transform, opacity;
}

.wave-card--hidden {
  transform: translateX(120%) scale(0.7);
  opacity: 0;
  pointer-events: none;
}

.wave-card--entering {
  transform: translateX(60%) scale(0.85);
  opacity: 0.5;
  filter: blur(2px);
  pointer-events: none;
}

.wave-card--current {
  transform: translateX(0) scale(1);
  opacity: 1;
}

.wave-card--leaving {
  transform: translateX(-120%) scale(0.8);
  opacity: 0;
  pointer-events: none;
}

.wave-card--passed {
  transform: translateX(-120%) scale(0.8);
  opacity: 0;
  pointer-events: none;
}

.wave-card__expression {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-math);
}

.wave-card__options {
  display: flex;
  gap: 8px;
}

.wave-card__option {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 2px solid var(--color-border-light);
  background: var(--color-bg-light);
  color: var(--color-text);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Rubik', 'Nunito', sans-serif;
}

.wave-card__option:hover {
  background: var(--color-bg-accent);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.wave-card__option:active {
  transform: scale(0.95);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .wave-card {
    min-width: 200px;
    padding: 16px;
  }
  .wave-card__expression {
    font-size: 22px;
  }
  .wave-card__option {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
}
</style>
