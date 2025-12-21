<template>
  <div class="city-view">
    <!-- Babylon.js компонент города -->
    <BabylonCity />
  </div>
</template>

<script setup lang="ts">
import BabylonCity from '@/components/city/BabylonCity.vue';
</script>

<style scoped>
.city-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>