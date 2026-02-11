<template>
  <div class="apple-visualization" data-testid="apple-visualization">
    <!-- Корзинка -->
    <div class="basket-container">
      <!-- Целое (общее количество) - скрываем если X -->
      <div v-if="!hideWhole" class="whole-label">
        Всего: <strong>{{ apples }}</strong> {{ appleWord }}
      </div>

      <!-- Квадрат "целое и части" -->
      <div class="whole-part-square" :class="sizeClass">
        <!-- Левая часть -->
        <div class="whole-part-part left-part" :class="{ 'highlight': highlightPart === 0 || highlightAll }">
          <div class="apple-part" data-testid="apple-part">
            <template v-if="parts[0] !== undefined">
              <AppleIcon
                v-for="i in parts[0]"
                :key="`left-${i}`"
                class="apple"
                :class="{ 'highlight-apple': highlightPart === 0 || highlightAll }"
              />
            </template>
            <span v-else class="unknown-part">?</span>
          </div>
          <div class="part-info">
            <div class="part-label">{{ partLabel1 }}</div>
          </div>
        </div>

        <!-- Разделитель -->
        <div class="whole-part-divider" />

        <!-- Правая часть -->
        <div class="whole-part-part right-part" :class="{ 'highlight': highlightPart === 1 || highlightAll }">
          <div class="apple-part" data-testid="apple-part">
            <template v-if="parts[1] !== undefined">
              <AppleIcon
                v-for="i in parts[1]"
                :key="`right-${i}`"
                class="apple"
                :class="{ 'highlight-apple': highlightPart === 1 || highlightAll }"
              />
            </template>
            <span v-else class="unknown-part">?</span>
          </div>
          <div class="part-info">
            <div class="part-label">{{ partLabel2 }}</div>
          </div>
        </div>
      </div>

      <!-- Целое снизу - скрываем если X -->
      <div v-if="!hideWhole" class="whole-bottom-label">
        = {{ wholeLabelText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Props интерфейс для AppleVisualization
 */
export interface AppleVisualizationProps {
  /** Общее количество яблок (целое) */
  apples: number;
  /** Разделение на части [part1, part2], undefined означает неизвестную часть */
  parts: [number | undefined, number | undefined];
  /** Какую часть подсветить (0, 1) или все */
  highlightPart?: 0 | 1;
  /** Подсветить все части */
  highlightAll?: boolean;
  /** Размер визуализации */
  size?: 'small' | 'medium' | 'large';
  /** Скрыть целое (используется когда X - это целое) */
  hideWhole?: boolean;
}

const props = withDefaults(defineProps<AppleVisualizationProps>(), {
  highlightPart: undefined,
  highlightAll: false,
  size: 'medium',
  hideWhole: false
});

/**
 * Правильное словоформа для "яблок"
 */
const appleWord = computed(() => {
  const n = props.apples;
  const lastTwo = n % 100;
  const lastOne = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'яблок';
  if (lastOne === 1) return 'яблоко';
  if (lastOne >= 2 && lastOne <= 4) return 'яблока';
  return 'яблок';
});

/**
 * CSS класс для размера
 */
const sizeClass = computed(() => {
  return `size-${props.size}`;
});

/**
 * Текст метки для первой части
 */
const partLabel1 = computed(() => {
  const count = props.parts[0];
  if (count === undefined) return '';
  return `${count} ${getAppleWord(count)}`;
});

/**
 * Текст метки для второй части
 */
const partLabel2 = computed(() => {
  const count = props.parts[1];
  if (count === undefined) return '';
  return `${count} ${getAppleWord(count)}`;
});

/**
 * Текст для метки целого снизу
 */
const wholeLabelText = computed(() => {
  return `${props.apples} ${appleWord.value}`;
});

/**
 * Словоформа для "яблок" по числу
 */
function getAppleWord(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'яблок';
  if (lastOne === 1) return 'яблоко';
  if (lastOne >= 2 && lastOne <= 4) return 'яблока';
  return 'яблок';
}
</script>

<script lang="ts">
/**
 * Компонент иконки яблока
 */
const AppleIcon = {
  name: 'AppleIcon',
  template: `
    <svg class="apple-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#ff6b6b" stroke="#e55555" stroke-width="2"/>
      <ellipse cx="12" cy="10" rx="3" ry="2" fill="#ff8a8a"/>
      <path d="M12 2 Q14 4 12 6 Q10 4 12 2" fill="#4caf50" stroke="#388e3c" stroke-width="1"/>
      <path d="M12 6 L12 8" stroke="#388e3c" stroke-width="2"/>
    </svg>
  `
};
</script>

<style scoped>
.apple-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.basket-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.whole-label {
  font-size: clamp(14px, 3vw, 18px);
  color: #555;
  font-weight: 500;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

/* Квадрат "целое и части" */
.whole-part-square {
  display: grid;
  grid-template-columns: 1fr 2px 1fr;
  border: 3px solid #667eea;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.whole-part-square.size-small {
  width: clamp(120px, 25vw, 160px);
  height: clamp(120px, 25vw, 160px);
  font-size: clamp(12px, 2.5vw, 14px);
}

.whole-part-square.size-medium {
  width: clamp(160px, 35vw, 240px);
  height: clamp(160px, 35vw, 240px);
  font-size: clamp(14px, 3vw, 18px);
}

.whole-part-square.size-large {
  width: clamp(200px, 45vw, 320px);
  height: clamp(200px, 45vw, 320px);
  font-size: clamp(16px, 3.5vw, 20px);
}

.whole-part-part {
  padding: clamp(8px, 2vw, 16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.whole-part-part.highlight {
  background: rgba(255, 193, 7, 0.15);
}

.whole-part-divider {
  background: #667eea;
  width: 2px;
  height: 100%;
}

.apple-part {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(2px, 0.5vw, 4px);
  justify-content: center;
  align-items: center;
  max-width: 100%;
}

.apple {
  width: clamp(16px, 3.5vw, 24px);
  height: clamp(16px, 3.5vw, 24px);
  transition: all 0.3s ease;
}

.apple.highlight-apple {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255, 193, 7, 0.8));
}

.unknown-part {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 600;
  color: #667eea;
  animation: pulse-question 1.5s ease-in-out infinite;
}

@keyframes pulse-question {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.part-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
}

.part-label {
  font-size: clamp(12px, 2.2vw, 14px);
  color: #888;
  font-weight: 500;
  text-align: center;
}

.whole-bottom-label {
  font-size: clamp(16px, 3.5vw, 20px);
  color: #667eea;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

@media (max-width: 480px) {
  .apple-visualization {
    padding: 8px;
  }

  .basket-container {
    gap: 8px;
  }

  .whole-label {
    font-size: 11px;
    padding: 4px 8px;
  }

  .whole-part-square {
    grid-template-columns: 1fr 1px 1fr;
    border-width: 2px;
  }

  .whole-part-square.size-small {
    width: clamp(100px, 26vw, 130px);
    height: clamp(100px, 26vw, 130px);
  }

  .whole-part-square.size-medium {
    width: clamp(120px, 32vw, 160px);
    height: clamp(120px, 32vw, 160px);
  }

  .whole-part-square.size-large {
    width: clamp(140px, 38vw, 180px);
    height: clamp(140px, 38vw, 180px);
  }

  .whole-part-part {
    padding: 4px;
  }

  .whole-part-divider {
    width: 1px;
  }

  .apple {
    width: clamp(12px, 3vw, 18px);
    height: clamp(12px, 3vw, 18px);
  }

  .unknown-part {
    font-size: clamp(18px, 4vw, 28px);
  }

  .part-label {
    font-size: clamp(10px, 2.4vw, 12px);
  }

  .whole-bottom-label {
    font-size: clamp(12px, 2.8vw, 14px);
    padding: 6px 10px;
  }
}

/* Планшеты и большие экраны - ограничиваем рост визуализации */
@media (min-width: 481px) {
  .apple-visualization {
    padding: 12px;
  }

  .basket-container {
    gap: 10px;
  }

  .whole-label {
    font-size: 13px;
    padding: 6px 12px;
  }

  .whole-part-square.size-small {
    width: 140px;
    height: 140px;
  }

  .whole-part-square.size-medium {
    width: 170px;
    height: 170px;
  }

  .whole-part-square.size-large {
    width: 200px;
    height: 200px;
  }

  .whole-part-part {
    padding: 8px;
  }

  .apple {
    width: 20px;
    height: 20px;
  }

  .unknown-part {
    font-size: 32px;
  }

  .part-label {
    font-size: 12px;
  }

  .whole-bottom-label {
    font-size: 16px;
    padding: 8px 14px;
  }
}
</style>
