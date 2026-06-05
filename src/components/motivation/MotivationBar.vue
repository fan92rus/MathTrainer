<template>
  <div class="motivation-bar">
    <!-- Стрик (информационный, без перехода) -->
    <div class="motivation-item streak-item">
      <StreakCounter :streak="currentStreak" />
    </div>

    <!-- Очки -->
    <div class="motivation-item points-item">
      <span class="item-icon">⭐</span>
      <span class="item-value">{{ totalScore }}</span>
    </div>

    <!-- Ачивки -->
    <button class="motivation-item achievements-item" @click="$emit('achievementsClick')">
      <span class="item-icon">🏆</span>
      <span class="item-value">{{ unlockedCount }}/{{ totalCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * MotivationBar — верхняя панель мотивации
 *
 * Показывает: стрик 🔥, очки ⭐, ачивки 🏆
 */
import { computed } from 'vue'
import StreakCounter from './StreakCounter.vue'
import { useStreaksStore } from '@/store/streaks'
import { useScoresStore } from '@/store/scores'
import { useAchievementsStore } from '@/store/achievements'

defineEmits<{
  achievementsClick: []
}>()

const streaksStore = useStreaksStore()
const scoresStore = useScoresStore()
const achievementsStore = useAchievementsStore()

const currentStreak = computed(() => streaksStore.currentStreak)
const totalScore = computed(() => scoresStore.getTotalScore)
const unlockedCount = computed(() => achievementsStore.unlockedCount)
const totalCount = computed(() => achievementsStore.totalCount)
</script>

<style scoped>
.motivation-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vw, 24px);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin: 0 auto 12px;
  max-width: 400px;
  width: fit-content;
}

.motivation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.motivation-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.motivation-item:active {
  transform: scale(0.96);
}

.points-item {
  cursor: default;
}

.points-item:hover {
  background: none;
}

.item-icon {
  font-size: clamp(18px, 3vw, 22px);
  line-height: 1;
}

.item-value {
  font-size: clamp(14px, 2.5vw, 16px);
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .motivation-bar {
    gap: 8px;
    padding: 6px 12px;
    border-radius: 12px;
  }

  .motivation-item {
    padding: 2px 4px;
    gap: 4px;
  }

  .item-icon {
    font-size: 16px;
  }

  .item-value {
    font-size: 13px;
  }
}
</style>
