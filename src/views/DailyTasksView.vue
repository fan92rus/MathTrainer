<template>
  <div class="daily-tasks-view">
    <BackButton />
    <div class="tasks-container">
      <!-- Список заданий с новым компонентом -->
      <DailyTasksList
        :show-day-progress="true"
        :show-date="true"
        :show-completion-reward="true"
      />

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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDailyTasks } from '@/composables/useDailyTasks';
import BackButton from '@/components/common/BackButton.vue';
import DailyTasksList from '@/components/daily/DailyTasksList.vue';

const router = useRouter();
const { ensureTasks } = useDailyTasks();

const goToExercises = () => {
  router.push('/');
};

onMounted(() => {
  // Генерируем задания при необходимости
  ensureTasks();
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

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
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

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
