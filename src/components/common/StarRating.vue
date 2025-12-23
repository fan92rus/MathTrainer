<template>
  <div class="stars-container">
    <span v-for="n in 3" :key="n" class="star" :class="{ filled: score >= n * 20 }">★</span>
  </div>
</template>

<script setup lang="ts">
  export interface Props {
    score?: number;
  }

  withDefaults(defineProps<Props>(), {
    score: 0
  });
</script>
