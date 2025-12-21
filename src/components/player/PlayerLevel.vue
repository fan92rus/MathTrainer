<template>
  <div class="player-level">
    <div class="level-info">
      <span class="level-label">Уровень {{ level }}</span>
      <span class="level-title">{{ levelTitle }}</span>
    </div>
    <div class="experience-bar">
      <div class="experience-progress" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    <div class="experience-text">
      {{ experience }} / {{ experienceToNext }} XP
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/store/player';

const playerStore = usePlayerStore();

const level = computed(() => playerStore.player.level);
const experience = computed(() => playerStore.player.experience);
const experienceToNext = computed(() => playerStore.player.experienceToNext);

const progressPercentage = computed(() => {
  return (experience.value / experienceToNext.value) * 100;
});

const levelTitle = computed(() => {
  const titles: { [key: number]: string } = {
    1: 'Новичок',
    2: 'Ученик',
    3: 'Строитель',
    5: 'Архитектор',
    7: 'Мэр',
    10: 'Основатель мегаполиса',
  };

  // Найти подходящий заголовок
  const sortedLevels = Object.keys(titles)
    .map(Number)
    .sort((a, b) => b - a);

  for (const lvl of sortedLevels) {
    if (level.value >= lvl) {
      return titles[lvl];
    }
  }

  return 'Новичок';
});
</script>

<style scoped>
.player-level {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  max-width: 300px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.level-title {
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
}

.experience-bar {
  width: 100%;
  height: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.experience-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
  border-radius: 0.5rem;
}

.experience-text {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}
</style>