<template>
  <div class="step-panel" :class="stepClass">
    <!-- Заголовок этапа -->
    <div class="step-header">
      <span class="step-number">Шаг {{ stepNumber }} из {{ totalSteps }}</span>
      <h3 class="step-title">{{ title }}</h3>
    </div>

    <!-- Объяснение -->
    <p class="step-explanation">{{ explanation }}</p>

    <!-- Инструкция-действие -->
    <div class="step-instruction">
      <span class="instruction-icon">→</span>
      <span>{{ instruction }}</span>
    </div>

    <!-- Подсказка при ошибке -->
    <div v-if="showHint" class="hint-message">
      <span class="hint-icon">💡</span>
      <span>Правильный ответ: <strong>{{ correctAnswer }}</strong></span>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error && !showHint" class="error-message">
      <span class="error-icon">❌</span>
      <span>Попробуй ещё раз!</span>
    </div>

    <!-- Кнопка "Далее" -->
    <button
      v-if="showNextButton"
      class="next-button"
      :disabled="!canProceed"
      @click="handleNext"
    >
      {{ nextButtonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InteractiveStep, type InteractiveState } from '@/composables/useInteractiveSubtraction';

export interface Props {
  /** Состояние этапа */
  state: InteractiveState;
  /** Общее количество этапов */
  totalSteps: number;
  /** Показывать кнопку "Далее" */
  showNextButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showNextButton: true
});

const emit = defineEmits<{
  'next': [];
}>();

// Номер текущего этапа (от 1)
const stepNumber = computed(() => {
  const stepOrder: Record<InteractiveStep, number> = {
    [InteractiveStep.INTRO]: 1,
    [InteractiveStep.BORROW]: 2,
    [InteractiveStep.SUBTRACT_UNITS]: 2,
    [InteractiveStep.SUBTRACT_TENS]: 3,
    [InteractiveStep.COMPLETE]: 4
  };

  // Если заимствование не требуется, нумерация другая
  if (props.state.step === InteractiveStep.SUBTRACT_UNITS && !hasBorrowStep.value) {
    return 2; // Первый этап после intro
  }

  return stepOrder[props.state.step] || 1;
});

// Проверка, есть ли этап заимствования
const hasBorrowStep = computed(() => {
  // Если текущий этап BORROW, значит заимствование есть
  // Если перешли к SUBTRACT_UNITS после BORROW, тоже значит есть
  return props.state.step === InteractiveStep.BORROW;
});

// CSS класс для этапа
const stepClass = computed(() => {
  return `step-${props.state.step}`;
});

// Иконка этапа
const icon = computed(() => {
  const icons: Record<InteractiveStep, string> = {
    [InteractiveStep.INTRO]: '📝',
    [InteractiveStep.BORROW]: '🔄',
    [InteractiveStep.SUBTRACT_UNITS]: '🔢',
    [InteractiveStep.SUBTRACT_TENS]: '🔢',
    [InteractiveStep.COMPLETE]: '🎉'
  };
  return icons[props.state.step] || '';
});

// Заголовок этапа
const title = computed(() => {
  const titles: Record<InteractiveStep, string> = {
    [InteractiveStep.INTRO]: 'Начинаем решение',
    [InteractiveStep.BORROW]: 'Занимаем десяток',
    [InteractiveStep.SUBTRACT_UNITS]: 'Вычитаем единицы',
    [InteractiveStep.SUBTRACT_TENS]: 'Вычитаем десятки',
    [InteractiveStep.COMPLETE]: 'Готово!'
  };
  return titles[props.state.step] || '';
});

// Объяснение
const explanation = computed(() => props.state.explanation);

// Инструкция
const instruction = computed(() => props.state.instruction);

// Показывать подсказку
const showHint = computed(() => props.state.showHint);

// Есть ошибка
const error = computed(() => {
  if (props.state.step === InteractiveStep.SUBTRACT_UNITS) {
    return props.state.unitsCorrect === false;
  }
  if (props.state.step === InteractiveStep.SUBTRACT_TENS) {
    return props.state.tensCorrect === false;
  }
  return false;
});

// Успех
const success = computed(() => {
  if (props.state.step === InteractiveStep.SUBTRACT_UNITS) {
    return props.state.unitsCorrect === true;
  }
  if (props.state.step === InteractiveStep.SUBTRACT_TENS) {
    return props.state.tensCorrect === true;
  }
  return props.state.step === InteractiveStep.COMPLETE;
});

// Правильный ответ для подсказки
const correctAnswer = computed(() => {
  if (props.state.step === InteractiveStep.SUBTRACT_UNITS && props.state.unitsAnswer !== undefined) {
    return props.state.unitsAnswer;
  }
  if (props.state.step === InteractiveStep.SUBTRACT_TENS && props.state.tensAnswer !== undefined) {
    return props.state.tensAnswer;
  }
  return '';
});

// Можно ли перейти дальше
const canProceed = computed(() => props.state.canProceed);

// Текст кнопки "Далее"
const nextButtonText = computed(() => {
  if (props.state.step === InteractiveStep.COMPLETE) {
    return 'Следующий пример →';
  }
  return 'Далее →';
});

// Обработка нажатия "Далее"
function handleNext() {
  if (canProceed.value) {
    emit('next');
  }
}
</script>

<style scoped>
.step-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-radius: 12px;
  border: 2px solid #667eea;
  max-width: 500px;
  width: 100%;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  text-align: center;
}

.step-number {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  font-size: clamp(10px, 2.2vw, 12px);
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
}

.step-title {
  font-size: clamp(12px, 3vw, 16px);
  font-weight: 700;
  color: #333;
  margin: 0;
}

.step-explanation {
  font-size: clamp(11px, 2.5vw, 13px);
  color: #555;
  text-align: center;
  line-height: 1.3;
  margin: 0;
}

.step-instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  background: white;
  border-radius: 8px;
  font-size: clamp(11px, 2.5vw, 13px);
  color: #667eea;
  font-weight: 600;
}

.instruction-icon {
  font-size: clamp(14px, 3.5vw, 18px);
}

/* Подсказка */
.hint-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-radius: 8px;
  font-size: clamp(10px, 2.2vw, 12px);
  color: #f57c00;
}

.hint-icon {
  font-size: clamp(12px, 3vw, 16px);
}

/* Ошибка */
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-radius: 8px;
  font-size: clamp(10px, 2.2vw, 12px);
  color: #c62828;
  animation: shake-in 0.3s ease;
}

@keyframes shake-in {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-icon {
  font-size: clamp(16px, 4vw, 20px);
}

/* Кнопка Далее */
.next-button {
  width: 100%;
  padding: 8px 16px;
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.next-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.next-button:active:not(:disabled) {
  transform: translateY(0);
}

.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .step-panel {
    padding: 16px;
    gap: 10px;
  }

  .step-icon {
    font-size: 28px;
  }

  .step-title {
    font-size: 16px;
  }

  .step-explanation {
    font-size: 13px;
  }

  .step-instruction {
    padding: 10px 12px;
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .step-panel {
    padding: 12px;
    gap: 8px;
  }
}
</style>
