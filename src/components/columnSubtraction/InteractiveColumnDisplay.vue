<template>
  <div class="interactive-column-display">
    <!-- Верхнее число (уменьшаемое) -->
    <div class="number-row minuend">
      <!-- Десятки -->
      <div
        class="digit tens-digit"
        :class="{
          'clickable': canClickBorrow,
          'highlight-pulse': canClickBorrow,
          'active-step': isStepActive('tens')
        }"
        @click="handleTensClick"
      >
        {{ minuendTens }}

        <!-- Точка заимствования над десятками -->
        <span v-if="borrowed" class="borrow-dot">•</span>
      </div>

      <!-- Единицы -->
      <div
        class="digit units-digit"
        :class="{
          'active-step': isStepActive('units'),
          'highlight-pulse': isStepActive('units')
        }"
      >
        <!-- Единичка заимствования над единицами -->
        <span v-if="borrowed" class="borrow-one">1</span>

        {{ minuendUnits }}
      </div>
    </div>

    <!-- Знак минус -->
    <div class="minus-sign">−</div>

    <!-- Нижнее число (вычитаемое) -->
    <div class="number-row subtrahend">
      <div
        class="digit"
        :class="{ 'active-step': isStepActive('tens') }"
      >
        {{ subtrahendTens }}
      </div>
      <div
        class="digit"
        :class="{ 'active-step': isStepActive('units') }"
      >
        {{ subtrahendUnits }}
      </div>
    </div>

    <!-- Линия -->
    <div class="line"></div>

    <!-- Результат -->
    <div class="number-row result">
      <!-- Десятки результата -->
      <div class="digit result-digit">
        <span v-if="showResultTens">{{ displayTensResult }}</span>
        <input
          v-else-if="currentStep === 'tens'"
          ref="tensInputRef"
          v-model="tensInput"
          type="number"
          class="digit-input"
          :class="{ 'error': tensError, 'success': tensCorrect }"
          @keyup.enter="submitTens"
          :disabled="tensCorrect"
        />
        <span v-else class="placeholder">_</span>
        <span v-if="tensCorrect" class="checkmark">✓</span>
      </div>

      <!-- Единицы результата -->
      <div class="digit result-digit">
        <span v-if="showResultUnits">{{ displayUnitsResult }}</span>
        <input
          v-else-if="currentStep === 'units'"
          ref="unitsInputRef"
          v-model="unitsInput"
          type="number"
          class="digit-input"
          :class="{ 'error': unitsError, 'success': unitsCorrect }"
          @keyup.enter="submitUnits"
          :disabled="unitsCorrect"
        />
        <span v-else class="placeholder">_</span>
        <span v-if="unitsCorrect" class="checkmark">✓</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { InteractiveStep } from '@/composables/useInteractiveSubtraction';

export interface Props {
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Текущий этап */
  currentStep: InteractiveStep;
  /** Выполнено ли заимствование */
  borrowed?: boolean;
  /** Правильно ли вычитание единиц */
  unitsCorrect?: boolean;
  /** Правильно ли вычитание десятков */
  tensCorrect?: boolean;
  /** Ответ на единицах */
  unitsAnswer?: number;
  /** Ответ на десятках */
  tensAnswer?: number;
  /** Ошибка на единицах */
  unitsError?: boolean;
  /** Ошибка на десятках */
  tensError?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  borrowed: false,
  unitsCorrect: undefined,
  tensCorrect: undefined,
  unitsAnswer: undefined,
  tensAnswer: undefined,
  unitsError: false,
  tensError: false
});

const emit = defineEmits<{
  'borrow-click': [];
  'units-submit': [value: number];
  'tens-submit': [value: number];
}>();

// Разбиваем числа на разряды (computed свойства)
const minuendTens = computed(() => Math.floor(props.minuend / 10));
const minuendUnits = computed(() => props.minuend % 10);
const subtrahendTens = computed(() => Math.floor(props.subtrahend / 10));
const subtrahendUnits = computed(() => props.subtrahend % 10);

// Вводимые значения
const unitsInput = ref<number | ''>('');
const tensInput = ref<number | ''>('');

// Ref для элементов input
const unitsInputRef = ref<HTMLInputElement | null>(null);
const tensInputRef = ref<HTMLInputElement | null>(null);

// Можно ли кликнуть по десяткам для заимствования
const canClickBorrow = computed(() => {
  return props.currentStep === InteractiveStep.BORROW && !props.borrowed;
});

// Показывать результат единиц
const showResultUnits = computed(() => {
  return props.currentStep === InteractiveStep.COMPLETE ||
    (props.currentStep === InteractiveStep.SUBTRACT_TENS && props.unitsCorrect);
});

// Показывать результат десятков
const showResultTens = computed(() => {
  return props.currentStep === InteractiveStep.COMPLETE;
});

// Отображаемый результат единиц
const displayUnitsResult = computed(() => {
  if (props.unitsAnswer !== undefined && props.unitsCorrect) {
    return props.unitsAnswer;
  }
  return '';
});

// Отображаемый результат десятков
const displayTensResult = computed(() => {
  if (props.tensAnswer !== undefined && props.tensCorrect) {
    return props.tensAnswer;
  }
  return '';
});

// Проверка, активен ли разряд
function isStepActive(place: 'tens' | 'units'): boolean {
  if (place === 'units') {
    return props.currentStep === InteractiveStep.SUBTRACT_UNITS;
  }
  return props.currentStep === InteractiveStep.SUBTRACT_TENS;
}

// Обработка клика по десяткам
function handleTensClick() {
  if (canClickBorrow.value) {
    emit('borrow-click');
  }
}

// Отправка ответа единиц
function submitUnits() {
  if (unitsInput.value !== '') {
    emit('units-submit', Number(unitsInput.value));
  }
}

// Отправка ответа десятков
function submitTens() {
  if (tensInput.value !== '') {
    emit('tens-submit', Number(tensInput.value));
  }
}

// Сброс ввода при смене этапа
watch(() => props.currentStep, (newStep) => {
  if (newStep === InteractiveStep.SUBTRACT_UNITS) {
    unitsInput.value = '';
  } else if (newStep === InteractiveStep.SUBTRACT_TENS) {
    tensInput.value = '';
  }
});

// Сброс ввода при ошибке
watch(() => props.unitsCorrect, (isCorrect) => {
  if (isCorrect) {
    unitsInput.value = props.unitsAnswer ?? '';
  }
});

watch(() => props.tensCorrect, (isCorrect) => {
  if (isCorrect) {
    tensInput.value = props.tensAnswer ?? '';
  }
});

// Автоматическая отправка при вводе единиц
watch(unitsInput, (newValue) => {
  if (newValue !== '' && props.currentStep === InteractiveStep.SUBTRACT_UNITS && !props.unitsCorrect) {
    submitUnits();
  }
});

// Автоматическая отправка при вводе десятков
watch(tensInput, (newValue) => {
  if (newValue !== '' && props.currentStep === InteractiveStep.SUBTRACT_TENS && !props.tensCorrect) {
    submitTens();
  }
});

// Переключение фокуса на десятки после правильного ответа на единицы
watch(() => props.currentStep, (newStep) => {
  if (newStep === InteractiveStep.SUBTRACT_TENS) {
    // Небольшая задержка чтобы DOM успел обновиться
    setTimeout(() => {
      tensInputRef.value?.focus();
    }, 50);
  } else if (newStep === InteractiveStep.SUBTRACT_UNITS) {
    setTimeout(() => {
      unitsInputRef.value?.focus();
    }, 50);
  }
});
</script>

<style scoped>
.interactive-column-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-left: clamp(32px, 8vw, 45px);
  padding-bottom: 16px;
}

.number-row {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.minus-sign {
  position: absolute;
  left: 6px;
  top: 25%;
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 600;
  color: #667eea;
}

.digit {
  width: clamp(36px, 8vw, 52px);
  height: clamp(36px, 8vw, 52px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 6vw, 36px);
  font-weight: 600;
  color: #333;
  position: relative;
  transition: all 0.3s ease;
}

/* Кликабельный десяток для заимствования */
.digit.clickable {
  cursor: pointer;
  border-radius: 8px;
  animation: pulse-glow 1.5s infinite;
}

.digit.clickable:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: scale(1.05);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0);
  }
}

/* Точка заимствования над десятками */
.borrow-dot {
  position: absolute;
  top: -10px;
  right: 6px;
  font-size: clamp(28px, 7vw, 36px);
  color: #ff9800;
  font-weight: 700;
  animation: bounce-in 0.4s ease-out;
}

/* Единичка заимствования над единицами */
.borrow-one {
  position: absolute;
  top: 0px;
  right: 3px;
  font-size: 22px;
  color: #4caf50;
  font-weight: 700;
  animation: bounce-in 0.4s ease-out;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(3px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Активный шаг */
.digit.active-step {
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 2px solid #667eea;
}

.digit.highlight-pulse {
  animation: highlight-pulse 1.5s infinite;
}

@keyframes highlight-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
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
  position: relative;
  color: #4caf50;
  font-weight: 700;
  min-width: clamp(40px, 9vw, 56px);
  min-height: clamp(55px, 12vw, 70px);
}

.result-digit .checkmark {
  position: absolute;
  bottom: -5px;
  right: -5px;
  font-size: clamp(16px, 4vw, 20px);
  color: #4caf50;
  animation: checkmark-appear 0.3s ease-out;
}

@keyframes checkmark-appear {
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

/* Placeholder для пустого результата */
.placeholder {
  color: #ccc;
  font-size: clamp(20px, 5vw, 32px);
}

/* Поле ввода для цифры */
.digit-input {
  width: 100%;
  height: clamp(36px, 8vw, 52px);
  text-align: center;
  font-size: clamp(22px, 6vw, 32px);
  font-weight: 600;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  color: #333;
  outline: none;
  transition: all 0.2s ease;

  /* Убираем стрелки вверх/вниз */
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
}

/* Убираем стрелки для WebKit браузеров */
.digit-input::-webkit-outer-spin-button,
.digit-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.digit-input:focus {
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.digit-input.error {
  border-color: #f44336;
  background: #ffebee;
  animation: shake 0.3s ease;
}

.digit-input.success {
  border-color: #4caf50;
  background: #e8f5e9;
  color: #4caf50;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .interactive-column-display {
    padding: 10px;
    padding-left: clamp(26px, 8vw, 38px);
  }

  .digit {
    width: clamp(32px, 8vw, 44px);
    height: clamp(32px, 8vw, 44px);
    font-size: clamp(20px, 5vw, 28px);
  }

  .digit-input {
    font-size: clamp(18px, 5vw, 26px);
  }
}

@media (max-width: 360px) {
  .interactive-column-display {
    padding: 8px;
    padding-left: clamp(22px, 7vw, 32px);
  }

  .minus-sign {
    left: 5px;
  }
}
</style>
