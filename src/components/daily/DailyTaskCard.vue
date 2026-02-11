<template>
  <div
    class="daily-task-card"
    :class="{
      'completed': task.completed,
      'in-progress': task.current > 0 && !task.completed
    }"
  >
    <!-- Статус иконка -->
    <div class="task-icon">
      <span v-if="task.completed" class="completed-icon">✅</span>
      <span v-else-if="task.current > 0" class="progress-icon">
        {{ Math.round((task.current / task.target) * 100) }}%
      </span>
      <span v-else class="pending-icon">⭕</span>
    </div>

    <!-- Содержимое задания -->
    <div class="task-content">
      <h3 class="task-title">{{ task.description }}</h3>
      <div class="task-progress">
        <div class="mini-progress-bar">
          <div
            class="mini-progress-fill"
            :style="{ width: Math.min((task.current / task.target) * 100, 100) + '%' }"
          ></div>
        </div>
        <span class="task-counter">{{ task.current }} / {{ task.target }}</span>
      </div>
    </div>

    <!-- Награды -->
    <div class="task-rewards">
      <div class="reward-item coins">
        <span class="reward-icon">🪙</span>
        <span class="reward-value">{{ task.reward.coins }}</span>
      </div>
      <div class="reward-item experience">
        <span class="reward-icon">⭐</span>
        <span class="reward-value">{{ task.reward.experience }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyTask } from '@/store/dailyTasks/types';

interface Props {
  task: DailyTask;
}

defineProps<Props>();
</script>

<style scoped>
.daily-task-card {
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

.daily-task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.daily-task-card.completed {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #86efac;
}

.daily-task-card.in-progress {
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
  color: #3b82f6;
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

.daily-task-card.completed .mini-progress-fill {
  background: linear-gradient(90deg, #10b981, #059669);
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

.reward-item.coins {
  color: #059669;
}

.reward-item.experience {
  color: #7c3aed;
}

.reward-icon {
  font-size: 1rem;
}

.reward-value {
  min-width: 1.5rem;
  text-align: right;
}

@media (max-width: 640px) {
  .daily-task-card {
    padding: 0.75rem;
  }

  .task-title {
    font-size: 1rem;
  }

  .mini-progress-bar {
    min-width: 60px;
  }

  .task-rewards {
    flex-direction: row;
    gap: 1rem;
  }
}
</style>
