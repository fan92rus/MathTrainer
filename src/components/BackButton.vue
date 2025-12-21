<template>
  <button class="back-button" @click="goBack">
    <span class="back-icon">←</span>
    <span class="back-text">Назад</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = (): void => {
  router.back()
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
  text-decoration: none;
}

.back-button:hover {
  background: #e0e0e0;
  color: #333;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 18px;
  font-weight: bold;
}

.back-text {
  font-weight: 500;
}

/* Мобильная адаптация */
@media (max-width: 600px) {
  .back-button {
    padding: 8px 12px;
    font-size: 14px;
  }

  .back-icon {
    font-size: 16px;
  }
}
</style>