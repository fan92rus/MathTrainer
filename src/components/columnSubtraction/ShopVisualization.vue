<template>
  <div class="shop-visualization">
    <!-- Пачки конфет -->
    <div class="packs-container">
      <div
        v-for="i of Math.min(packs, maxPacksToShow)"
        :key="`pack-${i}`"
        class="pack-item"
        :class="{ 'opening': i === openingPackIndex }"
        v-html="packIcon"
      />
      <span v-if="packs > maxPacksToShow" class="more-packs">+{{ packs - maxPacksToShow }}</span>
    </div>

    <!-- Отдельные конфеты (россыпью) -->
    <div class="candies-container">
      <div
        v-for="i of Math.min(looseCandies, maxCandiesToShow)"
        :key="`candy-${i}`"
        class="candy-item"
        :class="{ 'falling': i <= fallingCandiesCount, 'new': i > looseCandies - fallingCandiesCount }"
        v-html="candyIcon"
      />
      <span v-if="looseCandies > maxCandiesToShow" class="more-candies">+{{ looseCandies - maxCandiesToShow }}</span>
    </div>

    <!-- Текст описания -->
    <div class="description">
      <span class="packs-count">{{ packs }}</span> пачк{{ packsWordEnding }}
      <span v-if="looseCandies > 0"> + <span class="candies-count">{{ looseCandies }}</span> конфет{{ candiesWordEnding }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sealedPackIcon, openPackIcon, candyIcon as candyIconSvg } from './svgIcons';

export interface Props {
  /** Количество пачек (по 10 конфет) */
  packs: number;
  /** Количество отдельных конфет */
  looseCandies: number;
  /** Индекс открываемой пачки (для анимации) */
  openingPackIndex?: number;
  /** Количество выпадающих конфет (для анимации) */
  fallingCandiesCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  openingPackIndex: 0,
  fallingCandiesCount: 0
});

const candyIcon = candyIconSvg;

// Максимальное количество элементов для отображения
const maxPacksToShow = 5;
const maxCandiesToShow = 10;

// Иконка пачки (запечатанная или открытая)
const packIcon = computed(() => {
  return props.openingPackIndex > 0 ? openPackIcon : sealedPackIcon;
});

// Словесные окончания
const packsWordEnding = computed(() => {
  const lastTwo = props.packs % 100;
  const lastOne = props.packs % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'ок';
  if (lastOne === 1) return 'ка';
  if (lastOne >= 2 && lastOne <= 4) return 'ки';
  return 'ок';
});

const candiesWordEnding = computed(() => {
  const lastTwo = props.looseCandies % 100;
  const lastOne = props.looseCandies % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return '';
  if (lastOne === 1) return 'а';
  if (lastOne >= 2 && lastOne <= 4) return 'ы';
  return '';
});
</script>

<style scoped>
.shop-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe4cc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  min-height: 200px;
}

.packs-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.pack-item {
  width: clamp(40px, 8vw, 60px);
  height: clamp(48px, 10vw, 72px);
  transition: transform 0.3s ease;
}

.pack-item:hover {
  transform: scale(1.05);
}

.pack-item.opening {
  animation: packShake 0.5s ease-in-out;
}

.pack-item.opening.opened {
  animation: none;
}

@keyframes packShake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.candies-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  min-height: 40px;
}

.candy-item {
  width: clamp(20px, 5vw, 30px);
  height: clamp(20px, 5vw, 30px);
}

.candy-item.falling {
  animation: candyFall 0.8s ease-in forwards;
}

.candy-item.new {
  animation: candyPop 0.4s ease-out;
}

@keyframes candyFall {
  0% {
    transform: translateY(-30px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
}

@keyframes candyPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.description {
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
}

.packs-count,
.candies-count {
  font-weight: 700;
  color: #667eea;
  font-size: 1.2em;
}

.more-packs,
.more-candies {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(40px, 8vw, 60px);
  height: clamp(48px, 10vw, 72px);
  background: rgba(255, 255, 255, 0.8);
  border: 2px dashed #667eea;
  border-radius: 8px;
  font-size: clamp(12px, 3vw, 16px);
  font-weight: 600;
  color: #667eea;
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .shop-visualization {
    padding: 12px;
    min-height: 160px;
  }

  .pack-item {
    width: clamp(35px, 10vw, 50px);
    height: clamp(42px, 12vw, 60px);
  }

  .candy-item {
    width: clamp(18px, 5vw, 26px);
    height: clamp(18px, 5vw, 26px);
  }
}

@media (max-width: 360px) {
  .shop-visualization {
    padding: 8px;
  }

  .packs-container,
  .candies-container {
    gap: 4px;
  }
}

/* SVG иконки стили */
.candy-pack-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.candy-pack-icon:hover {
  transform: scale(1.05);
}

.candy-pack-icon.open {
  animation: packOpen 0.6s ease-in-out;
}

@keyframes packOpen {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.candy-icon {
  display: inline-block;
  animation: candyPop 0.3s ease-out;
}

@keyframes candyPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.candy-fall {
  animation: candyFall 0.8s ease-in forwards;
}

@keyframes candyFall {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
