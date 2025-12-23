<template>
  <div class="daily-tasks-view">
    <BackButton />
    <div class="tasks-container">
      <!-- Прогресс дня -->
      <div class="day-progress">
        <div class="progress-header">
          <h2>Прогресс дня</h2>
          <span class="date">{{ todayDate }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ completedTasksCount }} / {{ totalTasksCount }} заданий выполнено
        </div>
      </div>

      <!-- Список заданий -->
      <div class="tasks-list">
        <div
          v-for="task in dailyTasks"
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed, inProgress: task.current > 0 && !task.completed }"
        >
          <div class="task-icon">
            <span v-if="task.completed" class="completed-icon">✅</span>
            <span v-else-if="task.current > 0" class="progress-icon">{{ Math.round((task.current / task.target) * 100) }}%</span>
            <span v-else class="pending-icon">⭕</span>
          </div>

          <div class="task-content">
            <h3 class="task-title">{{ task.description }}</h3>
            <div class="task-progress">
              <div class="mini-progress-bar">
                <div
                  class="mini-progress-fill"
                  :style="{ width: (task.current / task.target) * 100 + '%' }"
                ></div>
              </div>
              <span class="task-counter">{{ task.current }} / {{ task.target }}</span>
            </div>
          </div>

          <div class="task-rewards">
            <div class="reward-item">
              <span class="reward-icon">🪙</span>
              <span class="reward-value">{{ task.reward.coins }}</span>
            </div>
            <div class="reward-item">
              <span class="reward-icon">⭐</span>
              <span class="reward-value">{{ task.reward.experience }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Награды за выполнение всех заданий -->
      <div v-if="allCompleted" class="completion-reward">
        <h2>🎉 Все задания выполнены!</h2>
        <p>Отличная работа! Завтра будут новые задания.</p>
        <div class="reward-summary">
          <div class="reward-summary-item">
            <span class="reward-icon">🪙</span>
            <span class="reward-label">Монеток:</span>
            <span class="reward-value">{{ totalCoinsReward }}</span>
          </div>
          <div class="reward-summary-item">
            <span class="reward-icon">⭐</span>
            <span class="reward-label">Опыта:</span>
            <span class="reward-value">{{ totalExpReward }}</span>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="action-buttons">
        <button class="action-button primary" @click="goToExercises">
          🎯 Выполнить задания
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/store/player';
import BackButton from '@/components/common/BackButton.vue';

const router = useRouter();
const playerStore = usePlayerStore();

const dailyTasks = computed(() => playerStore.dailyTasks);

const todayDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const completedTasksCount = computed(() => {
  return dailyTasks.value.filter(task => task.completed).length;
});

const totalTasksCount = computed(() => {
  return dailyTasks.value.length;
});

const progressPercentage = computed(() => {
  if (totalTasksCount.value === 0) return 0;
  return (completedTasksCount.value / totalTasksCount.value) * 100;
});

const allCompleted = computed(() => {
  return totalTasksCount.value > 0 && completedTasksCount.value === totalTasksCount.value;
});

const totalCoinsReward = computed(() => {
  return dailyTasks.value.reduce((sum, task) => sum + task.reward.coins, 0);
});

const totalExpReward = computed(() => {
  return dailyTasks.value.reduce((sum, task) => sum + task.reward.experience, 0);
});

const goToExercises = () => {
  router.push('/');
};

onMounted(() => {
  // Генерируем задания при необходимости
  playerStore.generateDailyTasks();
});
</script>

<style scoped>
.daily-tasks-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #dbeafe, #e0f2fe);
  padding: 1rem;
}

.tasks-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tasks-title {
  font-size: 2.5rem;
  color: #1f2937;
  margin: 0 0 2rem 0;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.day-progress {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 2px solid #e5e7eb;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h2 {
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
  margin-bottom: 2rem;
}

.task-item {
  background: white;
  border-radius: 1rem;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.task-item.completed {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #86efac;
}

.task-item.inProgress {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #93c5fd;
}

.task-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.completed-icon {
  background: #10b981;
}

.progress-icon {
  font-weight: bold;
}

.pending-icon {
  background: #f3f4f6;
  color: #9ca3af;
}

.task-content {
  flex-grow: 1;
  min-width: 0;
}

.task-title {
  font-size: 1.1rem;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-progress-bar {
  flex-grow: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  min-width: 100px;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
  border-radius: 0.25rem;
}

.task-counter {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: bold;
  min-width: 3rem;
  text-align: right;
}

.task-rewards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.reward-item:first-child {
  color: #059669;
}

.reward-item:last-child {
  color: #7c3aed;
}

.reward-icon {
  font-size: 1rem;
}

.reward-value {
  min-width: 1.5rem;
  text-align: right;
}

.completion-reward {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #f59e0b;
  margin-bottom: 2rem;
}

.completion-reward h2 {
  font-size: 1.5rem;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.completion-reward p {
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

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
}

.action-button.secondary {
  background: white;
  color: #1f2937;
  border: 2px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .tasks-container {
    padding: 1rem;
  }

  .tasks-title {
    font-size: 2rem;
  }

  .task-item {
    text-align: center;
    gap: 1rem;
  }

  .task-rewards {
    flex-direction: row;
    gap: 1rem;
  }

  .reward-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>