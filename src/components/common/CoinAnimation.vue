<template>
  <div v-if="show" class="coin-animation">
    <div
      v-for="(_coin, index) in coins"
      :key="index"
      class="coin"
      :style="getCoinStyle(index)"
    >
      🪙
    </div>
    <div class="coin-text" v-if="showText">
      +{{ amount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface Props {
  amount: number;
  showText?: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showText: true,
  duration: 1500
});

const emit = defineEmits<{
  animationEnd: [];
}>();

const show = ref(false);
const coins = ref<number[]>([]);

const getCoinStyle = (index: number) => {
  const angle = (index * 360) / (props.amount || 1);
  const radius = 30 + (index % 3) * 10;
  return {
    '--angle': `${angle}deg`,
    '--radius': `${radius}px`,
    '--delay': `${index * 50}ms`
  };
};

const startAnimation = async () => {
  show.value = true;
  coins.value = Array.from({ length: Math.min(props.amount, 10) }, (_, i) => i);

  await nextTick();

  setTimeout(() => {
    show.value = false;
    emit('animationEnd');
  }, props.duration);
};

onMounted(() => {
  startAnimation();
});
</script>

<style scoped>
.coin-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
}

.coin {
  position: absolute;
  font-size: 24px;
  animation: coinFly var(--duration, 1.5s) ease-out forwards;
  animation-delay: var(--delay, 0ms);
  --duration: 1.5s;
}

.coin-text {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: textFloat 1.5s ease-out forwards;
}

@keyframes coinFly {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(0, 0) scale(1.2);
    opacity: 1;
  }
  40% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(cos(var(--angle)) * var(--radius)),
      calc(sin(var(--angle)) * var(--radius) - 100px)
    ) scale(0.8);
    opacity: 0;
  }
}

@keyframes textFloat {
  0% {
    transform: translateX(-50%) translateY(0);
    opacity: 0;
  }
  20% {
    transform: translateX(-50%) translateY(-10px);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-60px);
    opacity: 0;
  }
}
</style>