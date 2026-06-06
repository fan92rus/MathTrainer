<template>
  <div class="prestart">
    <h2 class="prestart__title">⚡ Скоростной вызов</h2>
    <p class="prestart__subtitle">Сколько времени у тебя?</p>

    <div class="prestart__durations">
      <button
        v-for="d in durations"
        :key="d"
        class="prestart__duration-card"
        :class="{ 'prestart__duration-card--selected': selectedDuration === d }"
        @click="selectDuration(d)"
      >
        <span class="prestart__duration-number">{{ d }}</span>
        <span class="prestart__duration-label">мин</span>
      </button>
    </div>

    <p v-if="bestScore > 0" class="prestart__best">
      🏆 Лучший: {{ bestScore }} очков
    </p>

    <button
      class="prestart__start"
      :disabled="!selectedDuration"
      @click="handleStart"
    >
      Начать!
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChallengeDuration } from '@/types/challenge'
import { useChallengeRecordsStore } from '@/store/challengeRecords'

interface Props {
  exerciseType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [duration: ChallengeDuration]
}>()

const recordsStore = useChallengeRecordsStore()

const durations: ChallengeDuration[] = [1, 2, 3]
const selectedDuration = ref<ChallengeDuration | null>(null)

const bestScore = computed(() => {
  const record = recordsStore.getRecord(props.exerciseType)
  return record?.bestScore ?? 0
})

function selectDuration(d: ChallengeDuration) {
  selectedDuration.value = d
}

function handleStart() {
  if (selectedDuration.value !== null) {
    emit('start', selectedDuration.value)
  }
}
</script>

<style scoped>
.prestart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 24px;
  animation: prestart-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes prestart-enter {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.prestart__title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary, #667eea), var(--color-primary-dark, #764ba2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prestart__subtitle {
  font-size: 18px;
  color: var(--color-text-secondary, #666);
  margin: 0;
}

.prestart__durations {
  display: flex;
  gap: 16px;
}

.prestart__duration-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 3px solid var(--color-border-light, #e0e6ff);
  border-radius: var(--radius-md, 15px);
  background: var(--color-bg, #fff);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.prestart__duration-card:hover {
 background: var(--color-bg-light, #f8f9ff);
  transform: translateY(-2px);
  border-color: var(--color-primary, #667eea);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.prestart__duration-card--selected {
  background: linear-gradient(135deg, var(--color-primary, #667eea), var(--color-primary-dark, #764ba2));
  border-color: var(--color-primary, #667eea);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: scale(1.08);
}

.prestart__duration-card--selected .prestart__duration-number,
.prestart__duration-card--selected .prestart__duration-label {
  color: #fff;
}

.prestart__duration-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text, #333);
  line-height: 1;
}

.prestart__duration-label {
  font-size: 13px;
  color: var(--color-text-muted, #999);
  margin-top: 2px;
}

.prestart__best {
  font-size: 16px;
  color: var(--color-star-filled, #ffd700);
  font-weight: 600;
  margin: 0;
}

.prestart__start {
  margin-top: 8px;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-family, 'Rubik', sans-serif);
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary, #667eea), var(--color-primary-dark, #764ba2));
  border: none;
  border-radius: var(--radius-md, 15px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
  min-height: 56px;
}

.prestart__start:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.prestart__start:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.prestart__start:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 480px) {
  .prestart { padding: 24px 16px; gap: 20px; }
  .prestart__title { font-size: 24px; }
  .prestart__subtitle { font-size: 16px; }
  .prestart__duration-card { width: 72px; height: 72px; }
  .prestart__duration-number { font-size: 28px; }
  .prestart__start { padding: 14px 36px; font-size: 18px; }
}

@media (max-width: 360px) {
  .prestart__duration-card { width: 64px; height: 64px; }
  .prestart__duration-number { font-size: 24px; }
  .prestart__start { padding: 12px 28px; font-size: 16px; }
}
</style>
