<template>
  <div class="city-container">
    <div class="city-header">
      <h1>Город</h1>
      <BackButton />
    </div>
    <div id="phaser-game" class="game-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import BackButton from '@/components/common/BackButton.vue'
import { CityGame } from '@/game/CityGame'

let gameInstance: CityGame | null = null

onMounted(() => {
  // Инициализация игры при монтировании компонента
  gameInstance = new CityGame('phaser-game')
  gameInstance.start()
})

onUnmounted(() => {
  // Очистка игры при размонтировании компонента
  if (gameInstance) {
    gameInstance.destroy()
    gameInstance = null
  }
})
</script>

<style scoped>
.city-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.city-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #2c3e50;
  color: white;
  flex-shrink: 0;
}

.city-header h1 {
  margin: 0;
  font-size: 1.2rem;
}

.game-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
}
</style>