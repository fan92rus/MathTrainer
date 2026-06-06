<template>
  <div
    class="drop-target"
    :class="{
      'drop-target--hover': isHovering,
      'drop-target--correct': isCorrect === true,
      'drop-target--wrong': isCorrect === false,
    }"
    ref="targetEl"
  >
    <span v-if="displayValue === null" class="drop-target__placeholder">?</span>
    <span v-else class="drop-target__value">{{ displayValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Текущее значение в drop-зоне (null = пусто) */
  value?: number | null
  /** Результат проверки: true = правильно, false = ошибка, null = ещё не проверено */
  isCorrect?: boolean | null
  /** Курсор/блок находится над зоной */
  isHovering?: boolean
}>(), {
  value: null,
  isCorrect: null,
  isHovering: false,
})

const displayValue = computed(() => props.value ?? null)
</script>

<style scoped>
.drop-target {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 72px;
  border-radius: 12px;
  border: 3px dashed rgba(255, 255, 255, 0.3);
  font-size: 32px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.drop-target--hover {
  border-color: #667eea;
  transform: scale(1.1);
  background: rgba(102, 126, 234, 0.15);
  animation: target-pulse 1s ease-in-out infinite;
}

.drop-target--correct {
  border-color: #4caf50;
  border-style: solid;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.drop-target--wrong {
  border-color: #ff9800;
  border-style: solid;
  background: rgba(255, 152, 0, 0.15);
  animation: shake 0.4s ease;
}

.drop-target__placeholder {
  opacity: 0.5;
}

@keyframes target-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(102, 126, 234, 0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
