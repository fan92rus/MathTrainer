<template>
  <div class="streak-counter" :class="{ 'has-streak': streak > 0 }">
    <StreakFlame :streak="streak" />
    <div class="streak-info">
      <span class="streak-number">{{ streak }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StreakCounter — отображение текущего стрика с огоньком
 */
import StreakFlame from './StreakFlame.vue'

defineProps<{
  streak: number
}>()
</script>

<style scoped>
.streak-counter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 152, 0, 0.08);
  transition: all 0.3s ease;
}

.streak-counter.has-streak {
  background: rgba(255, 152, 0, 0.15);
}

.streak-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.streak-number {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
  color: #ff6b35;
  line-height: 1;
  min-width: 1ch;
  text-align: center;
}

@media (max-width: 480px) {
  .streak-counter {
    padding: 4px 8px;
    gap: 4px;
  }

  .streak-number {
    font-size: clamp(16px, 3.5vw, 20px);
  }
}
</style>
