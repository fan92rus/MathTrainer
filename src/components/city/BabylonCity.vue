<template>
  <div class="babylon-city">
    <!-- Canvas для Babylon.js -->
    <canvas ref="canvasRef" class="city-canvas"></canvas>

    <!-- UI интерфейс -->
    <div class="city-ui">
      <!-- Верхняя панель с ресурсами -->
      <div class="top-panel">
        <div class="resource-item">
          <span class="resource-icon">💰</span>
          <span class="resource-value">{{ playerStore.currency.coins }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-icon">💎</span>
          <span class="resource-value">{{ playerStore.currency.crystals }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-icon">👥</span>
          <span class="resource-value">{{ cityStore.city.population }}</span>
        </div>
      </div>

      <!-- Панель покупки зданий -->
      <div class="build-panel" v-if="showBuildPanel">
        <h3 class="panel-title">🏗️ Постройки</h3>
        <div class="buildings-grid">
          <div
            v-for="building in availableBuildings"
            :key="building.id"
            class="building-card"
            @click="selectBuilding(building)"
            :class="{
              'selected': selectedBuilding?.id === building.id,
              'affordable': canAfford(building)
            }"
          >
            <div class="building-icon">{{ building.icon }}</div>
            <div class="building-name">{{ building.name }}</div>
            <div class="building-cost">💰 {{ building.baseCost }}</div>
          </div>
        </div>
        <button class="close-btn" @click="showBuildPanel = false">✖</button>
      </div>

      <!-- Информация о здании -->
      <div class="building-info" v-if="hoveredBuilding">
        <h4>{{ hoveredBuilding.name }}</h4>
        <p v-if="hoveredBuilding.description">{{ hoveredBuilding.description }}</p>
        <p v-if="hoveredBuilding.level">Уровень: {{ hoveredBuilding.level }}</p>
      </div>

      <!-- Кнопки управления -->
      <div class="controls">
        <button class="control-btn" @click="showBuildPanel = !showBuildPanel">
          🏗️ {{ showBuildPanel ? 'Закрыть' : 'Построить' }}
        </button>
        <button class="control-btn" @click="resetCamera">
          🎯 Центр
        </button>
        <button class="control-btn zoom-in" @click="zoomIn">
          ➕
        </button>
        <button class="control-btn zoom-out" @click="zoomOut">
          ➖
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { HTMLCanvasElement } from '@/types/dom'
import { useCityStore } from '@/store/city'
import { usePlayerStore } from '@/store/player'
import { CityRenderer } from '@/utils/city/babylonRenderer'
import type { BuildingTemplate, Building } from '@/types/gamification'

const canvasRef = ref<HTMLCanvasElement>()
const cityStore = useCityStore()
const playerStore = usePlayerStore()

// UI состояние
const showBuildPanel = ref(false)
const selectedBuilding = ref<BuildingTemplate | null>(null)
const hoveredBuilding = ref<Building | null>(null)

// Babylon.js рендерер
let cityRenderer: CityRenderer | null = null

const availableBuildings = cityStore.getAvailableBuildings()

// Проверка можно ли купить здание
const canAfford = (building: BuildingTemplate) => {
  return playerStore.currency.coins >= building.baseCost
}

// Выбор здания для строительства
const selectBuilding = (building: BuildingTemplate) => {
  if (!canAfford(building)) return

  selectedBuilding.value = building
  showBuildPanel.value = false

  if (cityRenderer) {
    cityRenderer.enterBuildMode(building)
  }
}

// Управление камерой
const resetCamera = () => {
  if (cityRenderer) {
    cityRenderer.resetCamera()
  }
}

const zoomIn = () => {
  if (cityRenderer) {
    cityRenderer.zoom(2)
  }
}

const zoomOut = () => {
  if (cityRenderer) {
    cityRenderer.zoom(-2)
  }
}

// Инициализация Babylon.js
const initBabylon = async () => {
  if (!canvasRef.value) return

  await nextTick()

  cityRenderer = new CityRenderer(canvasRef.value)

  // Обработчики событий
  cityRenderer.on('hover', (building: Building | null) => {
    hoveredBuilding.value = building
  })

  cityRenderer.on('buildRequest', async (template: BuildingTemplate, x: number, y: number) => {
    console.log('buildRequest:', template.id, x, y, 'Текущие монеты:', playerStore.currency.coins)

    // Проверяем можем ли мы позволить это здание
    if (!canAfford(template)) {
      console.log('Недостаточно денег для:', template.name)
      // Недостаточно денег
      cityRenderer?.exitBuildMode()
      selectedBuilding.value = null
      return
    }

    // Сначала списываем деньги
    const paymentSuccess = playerStore.spendCoins(template.baseCost)
    console.log('Результат списания:', paymentSuccess, 'Осталось монет:', playerStore.currency.coins)

    if (paymentSuccess) {
      // Деньги списаны успешно, создаем здание
      const result = cityStore.buildBuilding(template.id, x, y)
      console.log('Результат buildBuilding:', result, 'Всего зданий:', cityStore.city.buildings.length)

      if (result) {
        // Успешно добавили в store
        // Создаем 3D модель
        if (cityRenderer) {
          await cityRenderer.createBuilding(template, x, y)
        }
        console.log('Здание успешно создано и добавлено в store')
      } else {
        // Не удалось добавить в store (неизвестная ошибка)
        console.log('Ошибка добавления в store, возвращаем деньги')
        playerStore.addCoins(template.baseCost)
      }
    } else {
      console.log('Ошибка списания денег')
    }

    // Сбрасываем режим строительства
    cityRenderer?.exitBuildMode()
    selectedBuilding.value = null
    console.log('Компонент: режим строительства сброшен')
  })

  // Загрузка существующих зданий
  const loadExistingBuildings = async () => {
    for (const building of cityStore.city.buildings) {
      if (cityRenderer) {
        await cityRenderer.addBuilding(building)
      }
    }
  }
  loadExistingBuildings()
}

onMounted(async () => {
  await initBabylon()
})

onUnmounted(() => {
  if (cityRenderer) {
    cityRenderer.dispose()
  }
})
</script>

<style scoped>
.babylon-city {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.city-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.city-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.top-panel {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.resource-icon {
  font-size: 1.3rem;
}

.resource-value {
  color: #1f2937;
  min-width: 3ch;
  text-align: right;
}

.build-panel {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  max-height: 50vh;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

.panel-title {
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 1.2rem;
  color: #1f2937;
}

.buildings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.building-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.building-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.building-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.building-card.affordable {
  opacity: 1;
}

.building-card:not(.affordable) {
  opacity: 0.5;
  cursor: not-allowed;
}

.building-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.building-name {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.building-cost {
  font-size: 0.85rem;
  color: #059669;
  font-weight: 600;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ef4444;
}

.building-info {
  position: absolute;
  top: 5rem;
  left: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  backdrop-filter: blur(10px);
  min-width: 200px;
}

.building-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.building-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: auto;
}

.control-btn {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 2rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  font-size: 1rem;
  min-width: 44px;
  min-height: 44px;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
}

.zoom-in, .zoom-out {
  padding: 0.5rem;
  font-size: 1.2rem;
  min-width: 44px;
  min-height: 44px;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .top-panel {
    top: 0.5rem;
    padding: 0.5rem 1rem;
    gap: 0.75rem;
  }

  .resource-item {
    font-size: 1rem;
  }

  .build-panel {
    width: 95%;
    bottom: 0.5rem;
    border-radius: 1rem 1rem 0 0;
    max-height: 60vh;
  }

  .buildings-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .controls {
    bottom: 0.5rem;
    right: 0.5rem;
  }

  .control-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .building-info {
    top: 4rem;
    left: 0.5rem;
    right: 0.5rem;
    min-width: auto;
  }
}
</style>