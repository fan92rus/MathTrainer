<template>
  <div class="column-display" :class="{ 'borrowing': needsBorrowing, 'show-hint': showHint }">
    <!-- Верхнее число (уменьшаемое) -->
    <div class="number-row minuend">
      <div
        v-for="(digit, index) of minuendDigits"
        :key="`minuend-${index}`"
        class="digit"
        :class="{ 'active': activePlace === 'tens' && index === 0, 'borrowing-digit': needsBorrowing && index === 1 }"
      >
        {{ digit }}
        <!-- Точка заимствования над единицами -->
        <span v-if="needsBorrowing && index === 1 && showBorrowDot" class="borrow-dot">•</span>
      </div>
    </div>

    <!-- Знак минус между числами -->
    <div class="minus-sign">−</div>

    <!-- Нижнее число (вычитаемое) -->
    <div class="number-row subtrahend">
      <div
        v-for="(digit, index) of subtrahendDigits"
        :key="`subtrahend-${index}`"
        class="digit"
        :class="{ 'active': activePlace === 'tens' && index === 0 }"
      >
        {{ digit }}
      </div>
    </div>

    <!-- Линия под числами -->
    <div class="line"></div>

    <!-- Результат (показывается при showResult) -->
    <div v-if="showResult" class="number-row result">
      <div
        v-for="(digit, index) of resultDigits"
        :key="`result-${index}`"
        class="digit result-digit"
      >
        {{ digit }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Требуется ли заимствование */
  needsBorrowing?: boolean;
  /** Показывать точку заимствования */
  showBorrowDot?: boolean;
  /** Показывать результат */
  showResult?: boolean;
  /** Активный разряд для подсветки */
  activePlace?: 'tens' | 'units' | null;
  /** Показывать подсказки */
  showHint?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  needsBorrowing: false,
  showBorrowDot: false,
  showResult: false,
  activePlace: null,
  showHint: false
});

// Разбиваем числа на цифры
const minuendDigits = computed(() => {
  const tens = Math.floor(props.minuend / 10);
  const units = props.minuend % 10;
  return [tens, units];
});

const subtrahendDigits = computed(() => {
  const tens = Math.floor(props.subtrahend / 10);
  const units = props.subtrahend % 10;
  return [tens, units];
});

const resultDigits = computed(() => {
  const result = props.minuend - props.subtrahend;
  const tens = Math.floor(result / 10);
  const units = result % 10;
  return [tens, units];
});
</script>

<style scoped>
.column-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-left: clamp(35px, 10vw, 50px);
}

.number-row {
  display: flex;
  gap: 0;
  justify-content: center;
  align-items: center;
}

.minus-sign {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(28px, 7vw, 42px);
  font-weight: 600;
  color: #667eea;
}

.subtrahend {
  position: relative;
}

.digit {
  width: clamp(40px, 8vw, 60px);
  height: clamp(40px, 8vw, 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(28px, 7vw, 42px);
  font-weight: 600;
  color: var(--color-text-math);
  position: relative;
  transition: all 0.3s ease;
}

/* Подсветка активного разряда */
.digit.active {
  background: var(--gradient-primary);
  color: white;
  border-radius: 8px;
}

/* Подсветка единиц при заимствовании */
.digit.borrowing-digit {
  color: var(--color-warning);
  animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Точка заимствования */
.borrow-dot {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(20px, 5vw, 30px);
  color: var(--color-warning);
  animation: dotAppear 0.4s ease-out;
}

@keyframes dotAppear {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

/* Линия под числами */
.line {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  margin: 8px 0;
  border-radius: 2px;
}

/* Результат */
.result-digit {
  color: var(--color-success);
  font-weight: 700;
  animation: resultSlide 0.5s ease-out;
}

@keyframes resultSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .column-display {
    padding: 12px;
  }

  .digit {
    width: clamp(35px, 10vw, 45px);
    height: clamp(35px, 10vw, 45px);
    font-size: clamp(22px, 6vw, 32px);
  }
}

/* Адаптивность для маленьких экранов */
@media (max-width: 360px) {
  .column-display {
    padding: 8px;
    padding-left: clamp(28px, 9vw, 35px);
  }

  .minus-sign {
    left: 4px;
    font-size: clamp(20px, 6vw, 28px);
  }

  .number-row {
    gap: 0;
  }

  .digit {
    width: clamp(30px, 9vw, 40px);
    height: clamp(30px, 9vw, 40px);
    font-size: clamp(18px, 5vw, 28px);
  }
}
</style>
