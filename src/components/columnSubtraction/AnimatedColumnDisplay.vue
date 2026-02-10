<template>
  <div class="animated-column-display">
    <!-- Верхнее число (уменьшаемое) -->
    <div class="number-row minuend">
      <div
        class="digit"
        :class="{
          'crossed-out': state.crossedOutMinuendTens,
          'active-step': isHighlighted('tens'),
          'modified': isModifiedTens
        }"
      >
        {{ displayTens }}
      </div>
      <div
        class="digit"
        :class="{
          'active-step': isHighlighted('units'),
          'highlight-problem': isHighlighted('units') && state.step === AnimationStep.HIGHLIGHT_PROBLEM,
          'modified': isModifiedUnits
        }"
      >
        {{ displayUnits }}
      </div>
    </div>

    <!-- Знак минус -->
    <div class="minus-sign">−</div>

    <!-- Нижнее число (вычитаемое) -->
    <div class="number-row subtrahend">
      <div
        class="digit subtrahend-digit"
        :class="{
          'crossed-out': state.crossedOutSubtrahendTens,
          'active-step': isHighlighted('tens') && state.step === AnimationStep.SUBTRACT_TENS
        }"
      >
        {{ subtrahendTens }}
      </div>
      <div
        class="digit subtrahend-digit"
        :class="{
          'active-step': isHighlighted('units'),
          'highlight-problem': isHighlighted('units') && state.step === AnimationStep.HIGHLIGHT_PROBLEM
        }"
      >
        {{ subtrahendUnits }}
      </div>
    </div>

    <!-- Точка заимствования -->
    <div v-if="state.borrowDotVisible" class="borrow-dot">•</div>

    <!-- Линия -->
    <div class="line"></div>

    <!-- Результат -->
    <div v-if="showResult" class="number-row result">
      <div
        class="digit result-digit"
        :class="{
          'result-reveal': state.resultTens !== null,
          'result-final': state.resultTens !== null && state.resultUnits !== null
        }"
      >
        {{ state.resultTens ?? '' }}
      </div>
      <div
        class="digit result-digit"
        :class="{
          'result-reveal': state.resultUnits !== null,
          'result-final': state.resultTens !== null && state.resultUnits !== null
        }"
      >
        {{ state.resultUnits ?? '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AnimationStep, type StepState } from '@/composables/useSubtractionAnimation';

export interface Props {
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Состояние текущего шага */
  state: StepState;
}

const props = withDefaults(defineProps<Props>(), {});

// Разбиваем числа на разряды
const minuendTens = Math.floor(props.minuend / 10);
const minuendUnits = props.minuend % 10;
const subtrahendTens = Math.floor(props.subtrahend / 10);
const subtrahendUnits = props.subtrahend % 10;

// Отображаемые значения
const displayTens = computed(() => {
  // На шаге SHOW_BORROWING и далее показываем уменьшенное количество десятков
  if (props.state.crossedOutMinuendTens) {
    return minuendTens;
  }
  return minuendTens;
});

const displayUnits = computed(() => {
  return props.state.unitsDigitValue;
});

// Проверки для классов
function isHighlighted(place: 'tens' | 'units'): boolean {
  return props.state.highlightedDigits.includes(place);
}

const isModifiedTens = computed(() => {
  return props.state.crossedOutMinuendTens;
});

const isModifiedUnits = computed(() => {
  return props.state.unitsDigitValue !== minuendUnits;
});

// Показывать результат
const showResult = computed(() => {
  return props.state.resultUnits !== null || props.state.resultTens !== null;
});
</script>

<style scoped>
.animated-column-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-left: clamp(35px, 10vw, 50px);
  margin: 16px 0;
}

.number-row {
  display: flex;
  gap: 4px;
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

.digit {
  width: clamp(45px, 9vw, 65px);
  height: clamp(45px, 9vw, 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(32px, 8vw, 48px);
  font-weight: 600;
  color: var(--color-text-math, #333);
  position: relative;
  transition: all 0.3s ease;
}

.result-digit {
  color: var(--color-success, #4caf50);
  font-weight: 700;
}

/* Точка заимствования */
.borrow-dot {
  position: absolute;
  top: 8px;
  right: calc(50% + 20px);
  font-size: clamp(24px, 6vw, 36px);
  color: var(--color-warning, #ff9800);
  font-weight: 700;
  animation: dotBounce 0.5s ease-out;
}

@keyframes dotBounce {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .animated-column-display {
    padding: 12px;
    padding-left: clamp(30px, 10vw, 40px);
  }

  .digit {
    width: clamp(38px, 10vw, 50px);
    height: clamp(38px, 10vw, 50px);
    font-size: clamp(26px, 7vw, 36px);
  }

  .minus-sign {
    left: 6px;
    font-size: clamp(24px, 6vw, 32px);
  }

  .borrow-dot {
    right: calc(50% + 16px);
    font-size: clamp(20px, 5vw, 28px);
  }
}

@media (max-width: 360px) {
  .animated-column-display {
    padding: 8px;
    padding-left: clamp(25px, 9vw, 35px);
  }

  .minus-sign {
    left: 4px;
  }

  .borrow-dot {
    right: calc(50% + 12px);
  }
}
</style>
