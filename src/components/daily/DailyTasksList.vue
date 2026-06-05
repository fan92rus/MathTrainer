<template>
  <div class="daily-tasks-list">
    <!-- Прогресс дня -->
    <div v-if="showDayProgress" class="day-progress">
      <div class="progress-header">
        <h2 class="progress-title">Прогресс дня</h2>
        <span v-if="showDate" class="date">{{ todayDate }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        {{ stats.completed }} / {{ stats.total }} заданий выполнено
      </div>
    </div>

    <!-- Список заданий -->
    <div class="tasks-list">
      <DailyTaskCard
        v-for="task in dailyTasks"
        :key="task.id"
        :task="task"
      />
    </div>

    <!-- Награды за выполнение всех заданий -->
    <div v-if="allCompleted && showCompletionReward" class="completion-reward">
      <h2 class="completion-title">🎉 Все задания выполнены!</h2>
      <p class="completion-text">Отличная работа! Завтра будут новые задания.</p>
      <div class="reward-summary">
        <div class="reward-summary-item">
          <span class="reward-icon">🪙</span>
          <span class="reward-label">Монеток:</span>
          <span class="reward-value">{{ stats.totalCoins }}</span>
        </div>
        <div class="reward-summary-item">
          <span class="reward-icon">⭐</span>
          <span class="reward-label">Опыта:</span>
          <span class="reward-value">{{ stats.totalExp }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DailyTaskCard from './DailyTaskCard.vue';
import { useDailyTasks } from '@/composables/useDailyTasks';

interface Props {
  showDayProgress?: boolean;
  showDate?: boolean;
  showCompletionReward?: boolean;
}

withDefaults(defineProps<Props>(), {
  showDayProgress: true,
  showDate: true,
  showCompletionReward: true,
});

const { dailyTasks, stats, allCompleted } = useDailyTasks();

const todayDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const progressPercentage = computed(() => {
  return stats.value.percentage;
});
</script>

<style scoped>
.daily-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.day-progress {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0;
}

.date {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.5s ease;
  border-radius: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
  font-weight: 600;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.completion-reward {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #f59e0b;
}

.completion-title {
  font-size: 1.5rem;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.completion-text {
  font-size: 1rem;
  color: #78350f;
  margin: 0 0 1.5rem 0;
}

.reward-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.reward-summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #92400e;
}

.reward-label {
  font-weight: 500;
}

@media (max-width: 640px) {
  .day-progress {
    padding: 1rem;
  }

  .progress-title {
    font-size: 1.1rem;
  }

  .reward-summary {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
