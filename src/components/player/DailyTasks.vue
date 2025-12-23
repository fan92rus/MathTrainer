<template>
  <div class="daily-tasks">
    <h3 class="tasks-title">📅 Ежедневные задания</h3>
    <div class="tasks-list">
      <div
        v-for="task in dailyTasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <div class="task-info">
          <div class="task-description">{{ task.description }}</div>
          <div class="task-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (task.current / task.target) * 100 + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              {{ task.current }} / {{ task.target }}
            </div>
          </div>
        </div>
        <div class="task-reward">
          <div class="reward-coins">
            <span class="reward-icon">🪙</span>
            <span class="reward-value">{{ task.reward.coins }}</span>
          </div>
          <div class="reward-exp">
            <span class="reward-icon">⭐</span>
            <span class="reward-value">{{ task.reward.experience }}</span>
          </div>
        </div>
        <div v-if="task.completed" class="task-status">
          <span class="completed-icon">✅</span>
        </div>
      </div>
    </div>
    <div v-if="allCompleted" class="all-completed">
      <h4>🎉 Все задания выполнены!</h4>
      <p>Отличная работа! Завтра будут новые задания.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePlayerStore } from '@/store/player';

const playerStore = usePlayerStore();

const dailyTasks = computed(() => playerStore.dailyTasks);

const allCompleted = computed(() => {
  return dailyTasks.value.length > 0 && dailyTasks.value.every(task => task.completed);
});

onMounted(() => {
  playerStore.generateDailyTasks();
});
</script>

<style scoped>
.daily-tasks {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  max-width: 400px;
}

.tasks-title {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.task-item.completed {
  background: #ecfdf5;
  border-color: #86efac;
}

.task-info {
  flex-grow: 1;
  min-width: 0;
}

.task-description {
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex-grow: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: bold;
  min-width: 3rem;
  text-align: right;
}

.task-reward {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  min-width: 60px;
}

.reward-coins,
.reward-exp {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: bold;
}

.reward-coins {
  color: #059669;
}

.reward-exp {
  color: #7c3aed;
}

.reward-icon {
  font-size: 0.9rem;
}

.reward-value {
  min-width: 1.5rem;
  text-align: right;
}

.task-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.completed-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.all-completed {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 0.75rem;
  border: 2px solid #86efac;
}

.all-completed h4 {
  font-size: 1.1rem;
  color: #065f46;
  margin: 0 0 0.5rem 0;
}

.all-completed p {
  font-size: 0.9rem;
  color: #047857;
  margin: 0;
}

@media (max-width: 640px) {
  .daily-tasks {
    padding: 1rem;
  }

  .task-item {
    align-items: stretch;
    gap: 0.75rem;
  }

  .task-reward {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }

  .reward-coins,
  .reward-exp {
    flex-direction: column;
    align-items: center;
  }
}
</style>