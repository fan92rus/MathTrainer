<template>
  <div class="daily-tasks-widget">
    <h3 class="tasks-title">📅 Ежедневные задания</h3>
    <div class="tasks-list">
      <DailyTaskCard
        v-for="task in dailyTasks"
        :key="task.id"
        :task="task"
      />
    </div>
    <div v-if="allCompleted" class="all-completed">
      <h4>🎉 Все задания выполнены!</h4>
      <p>Отличная работа! Завтра будут новые задания.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDailyTasks } from '@/composables/useDailyTasks';
import DailyTaskCard from '@/components/daily/DailyTaskCard.vue';

const { dailyTasks, allCompleted, ensureTasks } = useDailyTasks();

onMounted(() => {
  ensureTasks();
});
</script>

<style scoped>
.daily-tasks-widget {
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

.all-completed {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 0.75rem;
  border: 2px solid #86efac;
  margin-top: 1rem;
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
  .daily-tasks-widget {
    padding: 1rem;
  }
}
</style>
