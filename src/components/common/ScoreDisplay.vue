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
    <div class="progress-info">
      Вопрос {{ currentQuestion + 1 }} из {{ totalQuestions }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScoreDisplay',
  props: {
    currentScore: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    currentQuestion: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 10
    }
  }
}
</script>