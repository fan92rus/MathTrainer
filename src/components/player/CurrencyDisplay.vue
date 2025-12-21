<template>
  <div class="currency-display">
    <div class="currency-item">
      <span class="currency-icon">🪙</span>
      <span class="currency-value">{{ formatNumber(coins) }}</span>
    </div>
    <div class="currency-item" v-if="crystals > 0">
      <span class="currency-icon">💎</span>
      <span class="currency-value">{{ formatNumber(crystals) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/store/player';

const playerStore = usePlayerStore();

const coins = computed(() => playerStore.currency.coins);
const crystals = computed(() => playerStore.currency.crystals);

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
</script>

<style scoped>
.currency-display {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #d1d5db;
}

.currency-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.currency-value {
  font-weight: bold;
  font-size: 1.1rem;
  color: #374151;
  min-width: 3rem;
  text-align: right;
}

@media (max-width: 640px) {
  .currency-display {
    gap: 0.5rem;
  }

  .currency-item {
    padding: 0.4rem 0.8rem;
  }

  .currency-icon {
    font-size: 1.2rem;
  }

  .currency-value {
    font-size: 1rem;
    min-width: 2.5rem;
  }
}
</style>