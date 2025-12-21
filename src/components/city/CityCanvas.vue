<template>
  <div class="city-canvas-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
      @mousemove="handleCanvasMove"
      @mouseleave="handleCanvasLeave"
      class="city-canvas"
    ></canvas>

    <!-- UI элементы поверх канваса -->
    <div class="city-ui-overlay">
      <CurrencyDisplay />
      <PlayerLevel />
    </div>

    <!-- Модальное окно здания -->
    <div v-if="selectedBuilding" class="modal-overlay" @click="closeBuildingModal">
      <div class="building-modal" @click.stop>
        <h2 class="modal-title">{{ selectedBuilding.name }}</h2>
        <div class="modal-building-icon">{{ getBuildingIcon(selectedBuilding.name) }}</div>
        <p class="modal-level">
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

    <!-- Подсказка при наведении -->
    <div v-if="hoveredCell" class="tooltip" :style="tooltipStyle">
      {{ hoveredCell.building ? hoveredCell.building.name : 'Построить' }}
    </div>

    <!-- Селектор зданий -->
    <div v-if="showBuildingSelector" class="modal-overlay" @click="onCancelBuild">
      <BuildingSelector
        :available-buildings="availableBuildings"
        @build="onBuildSelected"
        @cancel="onCancelBuild"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { useCityStore } from '@/store/city';
import { usePlayerStore } from '@/store/player';
import CurrencyDisplay from '@/components/player/CurrencyDisplay.vue';
import PlayerLevel from '@/components/player/PlayerLevel.vue';
import BuildingSelector from '@/components/city/BuildingSelector.vue';
import type { Building, GridCell } from '@/types/gamification';
import { GameEngine } from '@/utils/city/gameEngine';

// Ссылки и состояние
const canvas = ref<HTMLCanvasElement>();
const cityStore = useCityStore();
const playerStore = usePlayerStore();

// Размеры канваса
const canvasWidth = ref(800);
const canvasHeight = ref(600);

// Игровое состояние
const selectedBuilding = ref<Building | null>(null);
const hoveredCell = ref<GridCell | null>(null);
const showBuildingSelector = ref(false);
const pendingBuildCell = ref<{ x: number; y: number } | null>(null);

// Игровой движок
let gameEngine: GameEngine | null = null;

// Игровые объекты
const buildings = computed(() => cityStore.city.buildings);
const availableBuildings = computed(() => cityStore.getAvailableBuildings());

// Иконки зданий
const getBuildingIcon = (buildingName: string): string => {
  const icons: { [key: string]: string } = {
    'Маленький домик': '🏠',
    'Коттедж': '🏡',
    'Многоквартирный дом': '🏢',
    'Школа': '🏫',
    'Больница': '🏥',
    'Магазин': '🏪',
    'Парк': '🌳',
    'Игровая площадка': '🎠',
  };
  return icons[buildingName] || '🏛️';
};

// Синхронизация зданий с игровым движком
watch(buildings, (newBuildings) => {
  if (gameEngine) {
    gameEngine.buildings = newBuildings;
  }
}, { deep: true });

// Обработчики событий
const handleCanvasClick = (event: MouseEvent) => {
  if (!canvas.value || !gameEngine) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const gridCoords = gameEngine.isoToGrid(x, y);

  // Проверяем валидность координат
  if (gridCoords.x < 0 || gridCoords.x >= gameEngine.GRID_SIZE ||
      gridCoords.y < 0 || gridCoords.y >= gameEngine.GRID_SIZE) {
    return;
  }

  // Ищем здание на этой клетке
  const building = buildings.value.find(
    b => b.x === gridCoords.x && b.y === gridCoords.y
  );

  if (building) {
    // Показываем информацию о здании
    selectedBuilding.value = building;
  } else {
    // Показываем селектор зданий
    pendingBuildCell.value = gridCoords;
    showBuildingSelector.value = true;
  }
};

const handleCanvasMove = (event: MouseEvent) => {
  if (!canvas.value || !gameEngine) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Обновление наведенной клетки
  const gridCoords = gameEngine.isoToGrid(x, y);

  if (gridCoords.x >= 0 && gridCoords.x < gameEngine.GRID_SIZE &&
      gridCoords.y >= 0 && gridCoords.y < gameEngine.GRID_SIZE) {
    const building = buildings.value.find(
      b => b.x === gridCoords.x && b.y === gridCoords.y
    );
    hoveredCell.value = { x: gridCoords.x, y: gridCoords.y, building };
    gameEngine.hoveredCell = gridCoords;
  } else {
    hoveredCell.value = null;
    gameEngine.hoveredCell = null;
  }
};

const handleCanvasLeave = () => {
  hoveredCell.value = null;
  if (gameEngine) {
    gameEngine.hoveredCell = null;
  }
};

// Стили для подсказки
const tooltipStyle = computed(() => {
  if (!hoveredCell.value || !gameEngine) return {};

  const { x, y } = hoveredCell.value;
  const iso = gameEngine.gridToIso(x, y);

  return {
    transform: `translate(${iso.x}px, ${iso.y - 40}px)`,
  };
});

// Управление модальным окном
const closeBuildingModal = () => {
  selectedBuilding.value = null;
};

const upgradeBuilding = (buildingId: string) => {
  const building = buildings.value.find(b => b.id === buildingId);
  if (!building || !gameEngine) return;

  const cost = Math.floor(building.cost * 0.5);
  if (playerStore.currency.coins < cost) {
    alert('Недостаточно монет для улучшения!');
    return;
  }

  if (cityStore.upgradeBuilding(buildingId)) {
    playerStore.spendCoins(cost);

    // Добавляем анимацию улучшения
    gameEngine.addUpgradeAnimation(buildingId);

    // Создаем частицы монеток
    if (building.x && building.y) {
      gameEngine.createCoinParticles(building.x, building.y, 5);
    }
  }
};

const getUpgradeCost = (building: Building): number => {
  return Math.floor(building.cost * 0.5);
};

const playMiniGame = (building: Building) => {
  if (building.miniGame) {
    alert(`Мини-игра "${building.miniGame.name}" скоро будет доступна!`);
    playerStore.updateTaskProgress('play_3', 1);
  }
};

// Обработчики селектора зданий
const onBuildSelected = (buildingId: string) => {
  if (!pendingBuildCell.value || !gameEngine) return;

  const template = cityStore.getBuildingTemplate(buildingId);
  if (!template) return;

  if (cityStore.buildBuilding(buildingId, pendingBuildCell.value.x, pendingBuildCell.value.y)) {
    playerStore.spendCoins(template.baseCost);
    playerStore.updateTaskProgress('build_1', 1);

    // Добавляем анимацию строительства
    gameEngine.addConstructionAnimation(`${buildingId}_${Date.now()}`);

    // Создаем частицы монеток
    gameEngine.createCoinParticles(pendingBuildCell.value.x, pendingBuildCell.value.y, 3);
  }

  // Закрываем селектор
  showBuildingSelector.value = false;
  pendingBuildCell.value = null;
};

const onCancelBuild = () => {
  showBuildingSelector.value = false;
  pendingBuildCell.value = null;
};

// Обработка изменения размера окна
const handleResize = () => {
  if (canvas.value && gameEngine) {
    const container = canvas.value.parentElement;
    if (container) {
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvasWidth.value = width;
      canvasHeight.value = height;

      gameEngine.resize(width, height);
    }
  }
};

// Инициализация
onMounted(async () => {
  await nextTick();

  if (canvas.value) {
    // Создаем игровой движок
    gameEngine = new GameEngine(canvas.value);

    // Устанавливаем начальные здания
    gameEngine.buildings = buildings.value;

    // Запускаем движок
    gameEngine.start();

    // Добавляем обработчик изменения размера
    window.addEventListener('resize', handleResize);
    handleResize(); // Вызываем сразу для установки размера
  }

  // Проверяем ежедневный бонус
  const bonus = playerStore.checkDailyBonus();
  if (bonus > 0) {
    playerStore.addCoins(bonus);
  }
});

onUnmounted(() => {
  if (gameEngine) {
    gameEngine.stop();
  }

  // Убираем обработчик изменения размера
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.city-canvas-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #dbeafe, #e0f2fe);
  overflow: hidden;
}

.city-canvas {
  cursor: grab;
  display: block;
}

.city-canvas:active {
  cursor: grabbing;
}

.city-ui-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  pointer-events: none;
}

.city-ui-overlay > * {
  pointer-events: auto;
}

.tooltip {
  position: absolute;
  background: rgba(31, 41, 55, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 100;
  top: 0;
  left: 0;
}

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

.modal-building-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
}

.modal-level {
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
</style>