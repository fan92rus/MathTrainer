<template>
  <div class="babylon-city">
    <!-- Canvas для Babylon.js -->
    <canvas ref="canvasRef" class="city-canvas"></canvas>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Построение здания...</p>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <div class="notification-content">
        <span class="notification-icon">{{ notification.icon }}</span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button class="notification-close" @click="hideNotification">×</button>
    </div>

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
        <p v-if="hoveredBuilding.level">Уровень: {{ hoveredBuilding.level }}</p>
        <p>Тип: {{ getBuildingTypeName(hoveredBuilding.type) }}</p>
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
import { useCityStore } from '@/store/city'
import { usePlayerStore } from '@/store/player'
import { CityRenderer } from '@/utils/city/babylonRenderer'
import { useBuildingLogic } from '@/composables/useBuildingLogic'
import type { BuildingTemplate, Building } from '@/types/gamification'
import ErrorHandler from '@/utils/ErrorHandler'

const canvasRef = ref<HTMLCanvasElement>()
const cityStore = useCityStore()
const playerStore = usePlayerStore()

// Используем composable для логики построения
const {
  isLoading,
  lastError,
  handleBuildingRequest,
  checkBuildingAffordability,
  getSuccessMessage,
  getErrorMessage,
  clearError
} = useBuildingLogic()

// UI состояние
const showBuildPanel = ref(false)
const selectedBuilding = ref<BuildingTemplate | null>(null)
const hoveredBuilding = ref<Building | null>(null)

// Уведомления
const notification = ref({
  show: false,
  message: '',
  type: 'success', // 'success' | 'error'
  icon: '✅'
})

// Babylon.js рендерер
let cityRenderer: CityRenderer | null = null

const availableBuildings = cityStore.getAvailableBuildings()

// Проверка можно ли купить здание
const canAfford = (building: BuildingTemplate) => {
  return checkBuildingAffordability(building)
}

// Показать уведомление
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = {
    show: true,
    message,
    type,
    icon: type === 'success' ? '✅' : '❌'
  }
  
  // Автоматически скрыть через 3 секунды
  setTimeout(() => {
    hideNotification()
  }, 3000)
}

// Скрыть уведомление
const hideNotification = () => {
  notification.value.show = false
}

// Получить название типа здания на русском
const getBuildingTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'residential': 'Жилое',
    'public': 'Общественное',
    'entertainment': 'Развлекательное',
    'infrastructure': 'Инфраструктура',
    'special': 'Особое'
  }
  return typeNames[type] || type
}

// Выбор здания для строительства
const selectBuilding = (building: BuildingTemplate) => {
  if (!canAfford(building)) {
    showNotification(`Недостаточно монет для строительства "${building.name}"`, 'error')
    return
  }

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
    ErrorHandler.log(`buildRequest: ${template.id} в позиции (${x}, ${y}), текущие монеты: ${playerStore.currency.coins}`, 'info')

    try {
      // Используем composable для обработки запроса на построение
      const result = await handleBuildingRequest(template, x, y)
      
      if (result.success) {
        // Успешное построение - создаем 3D модель
        if (cityRenderer) {
          cityRenderer.createBuilding(template, x, y)
        }
        
        // Показываем уведомление об успехе
        showNotification(getSuccessMessage(template), 'success')
        
        ErrorHandler.log('Здание успешно создано и добавлено в store', 'info')
      } else {
        // Ошибка построения
        showNotification(result.message || 'Ошибка при построении здания', 'error')
        ErrorHandler.log(`Ошибка построения: ${result.message}`, 'warn')
      }
    } catch (error) {
      ErrorHandler.handle(error as Error, 'BabylonCity.buildRequest')
      showNotification(ErrorHandler.getUserMessage(error as Error), 'error')
    } finally {
      // Всегда сбрасываем режим строительства
      if (cityRenderer) {
        cityRenderer.exitBuildMode()
      }
      selectedBuilding.value = null
      ErrorHandler.log('Компонент: режим строительства сброшен', 'info')
    }
  })

  // Загрузка существующих зданий
  cityStore.city.buildings.forEach(building => {
    cityRenderer?.addBuilding(building)
  })
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

/* Стили для индикатора загрузки */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: none;
}

.loading-spinner {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

/* Стили для уведомлений */
.notification {
  position: absolute;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
  max-width: 90%;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideInDown 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.notification.success {
  background: rgba(34, 197, 94, 0.95);
  color: white;
}

.notification.error {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-message {
  font-weight: 500;
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideInDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* Мобильная адаптация для уведомлений */
@media (max-width: 768px) {
  .notification {
    top: 4rem;
    min-width: 250px;
    padding: 0.75rem 1rem;
  }
  
  .loading-spinner {
    padding: 1.5rem;
  }
}
</style>