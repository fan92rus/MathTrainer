<template>
  <div class="progress-bar">
    <div class="progress" :style="{ width: progressPercent + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    progressPercent?: number;
  }

  withDefaults(defineProps<Props>(), {
    progressPercent: 0
  });
</script>
