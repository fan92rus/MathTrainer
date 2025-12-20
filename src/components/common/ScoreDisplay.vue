<template>
  <div class="stats-bar">
    <div class="score-display">
      <div class="score-item">
        <div class="score-label">Текущие</div>
        <div class="score-value">⭐ {{ currentScore }}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Всего</div>
        <div class="score-value total-score-value">⭐ {{ totalScore }}</div>
      </div>
    </div>
    <div class="progress-info">Вопрос {{ currentQuestion + 1 }} из {{ totalQuestions }}</div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    currentScore?: number;
    totalScore?: number;
    currentQuestion?: number;
    totalQuestions?: number;
  }

  withDefaults(defineProps<Props>(), {
    currentScore: 0,
    totalScore: 0,
    currentQuestion: 0,
    totalQuestions: 10
  });
</script>
