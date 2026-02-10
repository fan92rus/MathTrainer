<template>
  <div class="interactive-subtraction">
    <!-- Пример в интерактивном режиме -->
    <div class="example-container">
      <InteractiveColumnDisplay
        :minuend="minuend"
        :subtrahend="subtrahend"
        :current-step="interactive.currentStep.value"
        :borrowed="borrowed"
        :units-correct="interactive.currentState.value.unitsCorrect"
        :tens-correct="interactive.currentState.value.tensCorrect"
        :units-answer="interactive.currentState.value.unitsAnswer"
        :tens-answer="interactive.currentState.value.tensAnswer"
        :units-error="unitsError"
        :tens-error="tensError"
        @borrow-click="handleBorrowClick"
        @units-submit="handleUnitsSubmit"
        @tens-submit="handleTensSubmit"
      />
    </div>

    <!-- Прогресс этапов -->
    <div class="progress-container">
      <StepProgress
        :steps="interactive.allSteps"
        :current-step="interactive.currentStep.value"
        :show-all="true"
      />
    </div>

    <!-- Кнопка пропуска (только для обучения) -->
    <button v-if="showSkipButton" class="skip-button" @click="handleSkip">
      Пропустить объяснение
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useInteractiveSubtraction, InteractiveStep } from '@/composables/useInteractiveSubtraction';
import InteractiveColumnDisplay from './InteractiveColumnDisplay.vue';
import StepProgress from './StepProgress.vue';

export interface Props {
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Показывать кнопку пропуска */
  showSkipButton?: boolean;
  /** Автоматически переходить к следующему шагу */
  autoAdvance?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSkipButton: false,
  autoAdvance: true
});

const emit = defineEmits<{
  'complete': [result: number];
  'step-change': [step: InteractiveStep];
  'error': [step: InteractiveStep, errorCount: number];
}>();

// Инициализация интерактивного вычитания
const interactive = useInteractiveSubtraction(props.minuend, props.subtrahend);

// Состояние ошибок
const unitsError = ref(false);
const tensError = ref(false);

// Время правильного ответа (для автоперехода)
const unitsCorrectTime = ref<number | null>(null);
const tensCorrectTime = ref<number | null>(null);
const completeStepTime = ref<number | null>(null);

// Интервал для периодической проверки
let advanceCheckInterval: ReturnType<typeof setInterval> | null = null;

// Выполнено ли заимствование (только если требуется заимствование и мы прошли этап BORROW)
const borrowed = computed(() => {
  const step = interactive.currentStep.value;
  const needsBorrowing = interactive.needsBorrowing.value;
  const isAfterBorrow = step === InteractiveStep.SUBTRACT_UNITS ||
    step === InteractiveStep.SUBTRACT_TENS ||
    step === InteractiveStep.COMPLETE;
  return needsBorrowing && isAfterBorrow;
});

// Обработка клика "Занять"
function handleBorrowClick() {
  interactive.performBorrow();
}

// Запуск периодической проверки автоперехода
function startAdvanceCheck() {
  if (advanceCheckInterval) clearInterval(advanceCheckInterval);

  advanceCheckInterval = setInterval(() => {
    const now = Date.now();
    const currentStep = interactive.currentStep.value;

    // Проверяем единицы
    if (currentStep === InteractiveStep.SUBTRACT_UNITS &&
        interactive.currentState.value.unitsCorrect === true &&
        unitsCorrectTime.value) {
      if (now - unitsCorrectTime.value >= 1000) {
        unitsCorrectTime.value = null;
        interactive.nextStep();
        return;
      }
    }

    // Проверяем десятки
    if (currentStep === InteractiveStep.SUBTRACT_TENS &&
        interactive.currentState.value.tensCorrect === true &&
        tensCorrectTime.value) {
      if (now - tensCorrectTime.value >= 1000) {
        tensCorrectTime.value = null;
        interactive.nextStep();
        return;
      }
    }

    // Проверяем COMPLETE - пауза 2 секунды перед завершением
    if (currentStep === InteractiveStep.COMPLETE && completeStepTime.value) {
      if (now - completeStepTime.value >= 2000) {
        completeStepTime.value = null;
        stopAdvanceCheck();
        emit('complete', interactive.finalResult.value);
        return;
      }
    }
  }, 100);
}

// Остановка проверки
function stopAdvanceCheck() {
  if (advanceCheckInterval) {
    clearInterval(advanceCheckInterval);
    advanceCheckInterval = null;
  }
}

// Обработка ввода единиц
function handleUnitsSubmit(value: number) {
  const isCorrect = interactive.submitUnits(value);

  if (isCorrect) {
    unitsError.value = false;
    unitsCorrectTime.value = Date.now();
    if (props.autoAdvance) {
      startAdvanceCheck();
    }
  } else {
    unitsError.value = true;
    // Сброс ошибки через анимацию
    setTimeout(() => {
      unitsError.value = false;
    }, 500);

    emit('error', InteractiveStep.SUBTRACT_UNITS, interactive.currentState.value.errorCount);
  }
}

// Обработка ввода десятков
function handleTensSubmit(value: number) {
  const isCorrect = interactive.submitTens(value);

  if (isCorrect) {
    tensError.value = false;
    tensCorrectTime.value = Date.now();
    if (props.autoAdvance) {
      startAdvanceCheck();
    }
  } else {
    tensError.value = true;
    setTimeout(() => {
      tensError.value = false;
    }, 500);

    emit('error', InteractiveStep.SUBTRACT_TENS, interactive.currentState.value.errorCount);
  }
}

// Пропустить объяснение
function handleSkip() {
  interactive.currentStep.value = InteractiveStep.COMPLETE;
}

// Отслеживание изменений шага (только для уведомлений)
watch(() => interactive.currentStep.value, (newStep) => {
  emit('step-change', newStep);

  // Фиксируем время при переходе на COMPLETE
  if (newStep === InteractiveStep.COMPLETE && props.autoAdvance) {
    completeStepTime.value = Date.now();
    startAdvanceCheck();
  }
});

// Автоматический переход с INTRO при autoAdvance
onMounted(() => {
  if (props.autoAdvance && interactive.currentStep.value === InteractiveStep.INTRO) {
    setTimeout(() => {
      interactive.nextStep();
    }, 1500); // Переход через 1.5 секунды
  }
});

// Очистка интервала при размонтировании
onUnmounted(() => {
  stopAdvanceCheck();
});

// Метод для сброса
function reset() {
  stopAdvanceCheck();
  interactive.reset();
  unitsError.value = false;
  tensError.value = false;
  unitsCorrectTime.value = null;
  tensCorrectTime.value = null;
  completeStepTime.value = null;
}

// Метод для перехода к конкретному шагу
function goToStep(step: InteractiveStep) {
  const stepIndex = interactive.allSteps.indexOf(step);
  if (stepIndex >= 0) {
    interactive.currentStep.value = step;
  }
}

// Экспортируем методы для родительского компонента
defineExpose({
  reset,
  goToStep,
  currentState: interactive.currentState,
  currentStep: interactive.currentStep
});
</script>

<style scoped>
.interactive-subtraction {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.example-container {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.progress-container {
  width: 100%;
}

.skip-button {
  padding: 10px 20px;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 500;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skip-button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .interactive-subtraction {
    gap: 10px;
  }

  .example-container {
    padding: 8px;
  }

  .skip-button {
    padding: 6px 12px;
    font-size: 10px;
  }
}

@media (max-width: 360px) {
  .interactive-subtraction {
    gap: 8px;
  }

  .example-container {
    padding: 6px;
  }
}
</style>
