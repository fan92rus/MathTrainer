<template>
  <div class="building-card" :class="{ disabled: !isUnlocked }">
    <div class="building-icon">{{ building.icon }}</div>
    <div class="building-info">
      <h3 class="building-name">{{ building.name }}</h3>
      <p class="building-description">{{ building.description }}</p>
      <div class="building-cost">
        <span class="cost-icon">🪙</span>
        <span class="cost-value">{{ buildingCost }}</span>
      </div>
    </div>
    <button
      class="build-button"
      :disabled="!canBuild"
      @click="$emit('build', building.id)"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BuildingTemplate } from '@/types/gamification';
import { usePlayerStore } from '@/store/player';

const props = defineProps<{
  building: BuildingTemplate;
}>();

const emit = defineEmits<{
  build: [id: string];
}>();

const playerStore = usePlayerStore();

const isUnlocked = computed(() => {
  return playerStore.isBuildingUnlocked(props.building.id);
});

const canBuild = computed(() => {
  return isUnlocked.value && playerStore.currency.coins >= props.building.baseCost;
});

const buildingCost = computed(() => {
  return props.building.baseCost;
});

const buttonLabel = computed(() => {
  if (!isUnlocked.value) {
    const requirements = [];
    if (props.building.requirements?.playerLevel) {
      requirements.push(`Уровень ${props.building.requirements.playerLevel}`);
    }
    return requirements.length > 0 ? requirements.join(', ') : 'Недоступно';
  }
  if (!canBuild.value) {
    return 'Недостаточно монет';
  }
  return 'Построить';
});
</script>

<style scoped>
.building-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.building-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.building-card.disabled {
  opacity: 0.6;
  background: #f9fafb;
}

.building-icon {
  font-size: 3rem;
  line-height: 1;
  flex-shrink: 0;
}

.building-info {
  flex-grow: 1;
  min-width: 0;
}

.building-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.building-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.building-cost {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
  font-weight: bold;
  color: #059669;
}

.cost-icon {
  font-size: 1.2rem;
}

.build-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.build-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: scale(1.05);
}

.build-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .building-card {
    flex-direction: column;
    text-align: center;
  }

  .building-icon {
    font-size: 2.5rem;
  }

  .build-button {
    width: 100%;
  }
}
</style>