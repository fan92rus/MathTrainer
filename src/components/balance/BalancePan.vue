<template>
  <div class="balance-pan" :class="[`balance-pan--${side}`, { 'balance-pan--active': isActive }]">
    <!-- Bowl shape (SVG arc) -->
    <svg viewBox="0 0 120 50" class="balance-pan__bowl" :class="{ 'balance-pan__bowl--glow': isBalanced }">
      <!-- Bowl arc -->
      <path
        d="M 10 5 Q 60 45 110 5"
        fill="none"
        :stroke="bowlColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <!-- Bowl bottom line -->
      <line
        x1="10" y1="5" x2="110" y2="5"
        :stroke="bowlColor"
        stroke-width="2"
      />
    </svg>

    <!-- Apples display -->
    <div class="balance-pan__content">
      <div class="balance-pan__apples">
        <span
          v-for="i in Math.min(visibleApples, 12)"
          :key="i"
          class="balance-pan__apple"
        >🍎</span>
        <span v-if="overflowCount > 0" class="balance-pan__overflow">
          +{{ overflowCount }}
        </span>
      </div>
      <div class="balance-pan__value" :class="{ 'balance-pan__value--unknown': value === null }">
        {{ value !== null ? value : '?' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Числовое значение на чаше (null = неизвестное) */
  value: number | null
  /** Сторона весов */
  side: 'left' | 'right'
  /** Чаша активна (подсвечивается при preview) */
  isActive?: boolean
  /** Весы сбалансированы */
  isBalanced?: boolean
}>(), {
  isActive: false,
  isBalanced: false,
})

/** Сколько яблок показать (максимум 12 видимых) */
const visibleApples = computed(() => {
  if (props.value === null) return 0
  return Math.min(props.value, 12)
})

/** Сколько яблок скрыто за "+N" */
const overflowCount = computed(() => {
  if (props.value === null || props.value <= 12) return 0
  return props.value - 12
})

/** Цвет чаши */
const bowlColor = computed(() => {
  if (props.isBalanced) return '#4caf50'
  if (props.isActive) return '#667eea'
  return 'rgba(0, 0, 0, 0.2)'
})
</script>

<style scoped>
.balance-pan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
}

.balance-pan__bowl {
  width: 100px;
  height: 40px;
  transition: all 0.3s ease;
}

.balance-pan__bowl--glow {
  filter: drop-shadow(0 0 6px rgba(76, 175, 80, 0.5));
}

.balance-pan__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: -12px;
}

.balance-pan__apples {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  justify-content: center;
  max-width: 100px;
  line-height: 1;
}

.balance-pan__apple {
  font-size: 14px;
}

.balance-pan__overflow {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 600;
  align-self: center;
}

.balance-pan__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  font-family: inherit;
  text-align: center;
}

.balance-pan__value--unknown {
  color: var(--color-text-muted);
  animation: pan-unknown-pulse 1.5s ease-in-out infinite;
}

@keyframes pan-unknown-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Active pan highlight */
.balance-pan--active .balance-pan__bowl {
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.4));
}

@media (max-width: 480px) {
  .balance-pan__bowl {
    width: 80px;
    height: 32px;
  }

  .balance-pan__apple {
    font-size: 12px;
  }

  .balance-pan__value {
    font-size: 17px;
  }

  .balance-pan__content {
    margin-top: -8px;
  }
}
</style>
