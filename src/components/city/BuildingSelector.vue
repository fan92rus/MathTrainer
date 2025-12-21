<template>
  <div class="building-selector">
    <h3 class="selector-title">Выберите здание для постройки</h3>
    <div class="buildings-grid">
      <div
        v-for="building in availableBuildings"
        :key="building.id"
        class="building-option"
        :class="{
          selected: selectedBuildingId === building.id,
          disabled: !canBuild(building)
        }"
        @click="selectBuilding(building)"
      >
        <div class="building-icon">{{ building.icon }}</div>
        <div class="building-info">
          <div class="building-name">{{ building.name }}</div>
          <div class="building-cost">
            <span class="cost-icon">🪙</span>
            <span class="cost-value">{{ building.baseCost }}</span>
          </div>
        </div>
        <div v-if="!isUnlocked(building)" class="locked-overlay">
          <span class="lock-icon">🔒</span>
          <div class="unlock-requirement">
            Требуется уровень {{ getRequiredLevel(building) }}
          </div>
        </div>
      </div>
    </div>
    <div class="selector-actions">
      <button
        class="build-button"
        :disabled="!selectedBuildingId || !canBuildSelected"
        @click="confirmBuild"
      >
        Построить ({{ selectedBuildingCost }} 🪙)
      </button>
      <button class="cancel-button" @click="$emit('cancel')">
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayerStore } from '@/store/player';
import type { BuildingTemplate } from '@/types/gamification';

const props = defineProps<{
  availableBuildings: BuildingTemplate[];
}>();

const emit = defineEmits<{
  build: [buildingId: string];
  cancel: [];
}>();

const playerStore = usePlayerStore();
const selectedBuildingId = ref<string>('');

const selectedBuilding = computed(() => {
  return props.availableBuildings.find(b => b.id === selectedBuildingId.value);
});

const selectedBuildingCost = computed(() => {
  return selectedBuilding.value?.baseCost || 0;
});

const isUnlocked = (building: BuildingTemplate): boolean => {
  return playerStore.isBuildingUnlocked(building.id);
};

const getRequiredLevel = (building: BuildingTemplate): number => {
  return building.requirements?.playerLevel || 1;
};

const canBuild = (building: BuildingTemplate): boolean => {
  return isUnlocked(building) && playerStore.currency.coins >= building.baseCost;
};

const canBuildSelected = computed(() => {
  if (!selectedBuilding.value) return false;
  return canBuild(selectedBuilding.value);
});

const selectBuilding = (building: BuildingTemplate) => {
  if (isUnlocked(building)) {
    selectedBuildingId.value = building.id;
  }
};

const confirmBuild = () => {
  if (selectedBuildingId.value && canBuildSelected.value) {
    emit('build', selectedBuildingId.value);
  }
};
</script>

<style scoped>
.building-selector {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  max-width: 500px;
  width: 100%;
}

.selector-title {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.buildings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.building-option {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.building-option:hover:not(.disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.building-option.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.building-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.building-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.building-info {
  text-align: center;
}

.building-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.building-cost {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: bold;
  color: #059669;
}

.cost-icon {
  font-size: 1rem;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.lock-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.unlock-requirement {
  font-size: 0.8rem;
  text-align: center;
}

.selector-actions {
  display: flex;
  gap: 1rem;
}

.build-button,
.cancel-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.build-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.build-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.02);
}

.build-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  background: #f3f4f6;
  color: #6b7280;
}

.cancel-button:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .buildings-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .building-icon {
    font-size: 2rem;
  }

  .selector-actions {
    flex-direction: column;
  }
}
</style>