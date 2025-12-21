<template>
  <button class="back-button" @click="goBack">
    <span class="back-icon">←</span>
    <span class="back-text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = withDefaults(defineProps<{
  text?: string;
  to?: string;
}>(), {
  text: 'Назад'
});

const router = useRouter();

const goBack = () => {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.back-text {
  line-height: 1;
}
</style>