<template>
  <div class="city-view">
    <!-- Верхняя панель с меню строительства -->
    <div class="city-header">
      <h1 class="city-title">Мой Город</h1>
      <div class="construction-toggle">
        <button
          class="toggle-button"
          @click="showConstructionPanel = !showConstructionPanel"
          :class="{ active: showConstructionPanel }"
        >
          🏗️ Построить
        </button>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="city-content">
      <!-- Игровое поле на Canvas -->
      <div class="city-canvas-wrapper">
        <CityCanvas />
      </div>

      <!-- Панель строительства -->
      <div v-if="showConstructionPanel" class="construction-panel">
        <h2 class="panel-title">Доступные здания</h2>
        <div class="buildings-list">
          <BuildingCard
            v-for="building in availableBuildings"
            :key="building.id"
            :building="building"
            @build="onBuild"
          />
        </div>
      </div>
    </div>

    <!-- Модальное окно здания -->
    <div v-if="selectedBuilding" class="modal-overlay" @click="closeBuildingModal">
      <div class="building-modal" @click.stop>
        <h2 class="modal-title">{{ selectedBuilding.name }}</h2>
        <div class="modal-icon">{{ getBuildingIcon(selectedBuilding.name) }}</div>
        <p class="modal-description">
          Уровень: {{ selectedBuilding.level }}/{{ selectedBuilding.maxLevel }}
        </p>
        <div v-if="selectedBuilding.miniGame" class="mini-game-section">
          <h3>Мини-игра: {{ selectedBuilding.miniGame.name }}</h3>
          <p>{{ selectedBuilding.miniGame.description }}</p>
          <button class="play-button" @click="playMiniGame(selectedBuilding)">
            Играть 🎮
          </button>
        </div>
        <div v-if="selectedBuilding.produces" class="production-section">
          <h3>Производство</h3>
          <p>
            Производит {{ selectedBuilding.produces.amount }}
            {{ selectedBuilding.produces.type === 'coins' ? '🪙 монет' : '💎 кристаллов' }}
            каждые {{ selectedBuilding.produces.interval / 60 }} часов
          </p>
        </div>
        <div class="modal-actions">
          <button
            v-if="selectedBuilding.level < selectedBuilding.maxLevel"
            class="upgrade-button"
            @click="upgradeBuilding(selectedBuilding.id)"
          >
            Улучшить ({{ getUpgradeCost(selectedBuilding) }} 🪙)
          </button>
          <button class="close-button" @click="closeBuildingModal">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCityStore } from '@/store/city';
import { usePlayerStore } from '@/store/player';
import CityCanvas from '@/components/city/CityCanvas.vue';
import BuildingCard from '@/components/city/BuildingCard.vue';
import type { Building } from '@/types/gamification';

const cityStore = useCityStore();
const playerStore = usePlayerStore();

const availableBuildings = computed(() => cityStore.getAvailableBuildings());
const showConstructionPanel = ref(false);

// Здесь не нужен дополнительный код, так как CityCanvas обрабатывает всю логику
</script>

<style scoped>
.city-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #dbeafe, #e0f2fe);
  overflow: hidden;
}

.city-header {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.city-title {
  font-size: 2rem;
  color: #1f2937;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.construction-toggle {
  pointer-events: auto;
}

.toggle-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toggle-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.toggle-button.active {
  background: linear-gradient(135deg, #10b981, #059669);
}

.city-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.city-canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.construction-panel {
  position: absolute;
  top: 5rem;
  right: 1rem;
  width: 320px;
  max-height: calc(100vh - 7rem);
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 20;
  border: 2px solid #e5e7eb;
}

.panel-title {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.buildings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.building-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
}

.modal-description {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.mini-game-section,
.production-section {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.mini-game-section h3,
.production-section h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.play-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 0.5rem;
}

.play-button:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.02);
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.upgrade-button,
.close-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upgrade-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.upgrade-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.close-button {
  background: #f3f4f6;
  color: #6b7280;
}

.close-button:hover {
  background: #e5e7eb;
}

@media (max-width: 1024px) {
  .city-content {
    grid-template-columns: 1fr;
  }

  .city-grid {
    max-width: 400px;
  }
}

@media (max-width: 640px) {
  .city-header {
    flex-direction: column;
    text-align: center;
  }

  .city-title {
    font-size: 1.5rem;
  }

  .city-grid {
    grid-template-columns: repeat(6, 1fr);
    max-width: 300px;
  }

  .building-icon {
    font-size: 1.2rem;
  }
}
</style>