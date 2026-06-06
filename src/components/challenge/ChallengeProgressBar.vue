<template>
  <div class="challenge-progress">
    <div class="challenge-progress__track">
      <!-- Milestone markers -->
      <div
        v-for="m in milestones"
        :key="m"
        class="challenge-progress__milestone"
        :class="{ 'challenge-progress__milestone--reached': percent >= m }"
        :style="{ left: m + '%' }"
      />
      <!-- Fill bar -->
      <div
        class="challenge-progress__fill"
        :style="{ width: percent + '%' }"
      />
    </div>
    <span class="challenge-progress__label">
      {{ solved }}
      <template v-if="total > 0"> из {{ total }}</template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  solved: number
  total: number
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
})

const milestones = [25, 50, 75]

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.min((props.solved / props.total) * 100, 100)
})
</script>

<style scoped>
.challenge-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 4px;
}

.challenge-progress__track {
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.15);
  overflow: visible;
}

.challenge-progress__fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #4caf50, #42a5f5, #ab47bc);
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px rgba(66, 165, 245, 0.4);
}

.challenge-progress__milestone {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  transition: background 0.3s ease;
  z-index: 1;
}

.challenge-progress__milestone--reached {
  background: #ffd700;
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}

.challenge-progress__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

@media (max-width: 480px) {
  .challenge-progress__track { height: 8px; }
  .challenge-progress__milestone { height: 14px; width: 3px; }
  .challenge-progress__label { font-size: 12px; }
}
</style>
