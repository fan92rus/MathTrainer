<template>
  <div class="step-progress">
    <!-- Линия прогресса -->
    <div class="progress-line">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- Точки этапов -->
    <div class="progress-dots">
      <div
        v-for="(step, index) in displaySteps"
        :key="step.id"
        class="step-dot-wrapper"
        :class="{
          'clickable': step.clickable && !isCurrentStep(step.id),
          'disabled': !step.clickable && !isCurrentStep(step.id)
        }"
        @click="handleStepClick(step.id, step.clickable)"
      >
        <!-- Точка этапа -->
        <div
          class="step-dot"
          :class="{
            'active': isCurrentStep(step.id),
            'completed': isCompleted(step.id),
            'pending': !isCompleted(step.id) && !isCurrentStep(step.id)
          }"
        >
          <!-- Иконка для завершённых этапов -->
          <span v-if="isCompleted(step.id)" class="dot-icon">✓</span>
          <!-- Номер этапа -->
          <span v-else class="dot-number">{{ index + 1 }}</span>
        </div>

        <!-- Подпись этапа -->
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InteractiveStep } from '@/composables/useInteractiveSubtraction';

export interface StepInfo {
  id: InteractiveStep;
  label: string;
  clickable: boolean;
}

export interface Props {
  /** Все этапы по порядку */
  steps: InteractiveStep[];
  /** Текущий этап */
  currentStep: InteractiveStep;
  /** Показывать ли все этапы или только активные */
  showAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAll: true
});

const emit = defineEmits<{
  stepClick: [step: InteractiveStep];
}>();

// Этапы для отображения (включая INTRO и COMPLETE)
const displaySteps = computed<StepInfo[]>(() => {
  // Фильтруем служебные этапы, если нужно
  const stepsToShow = props.showAll
    ? props.steps
    : props.steps.filter(s => s !== InteractiveStep.INTRO && s !== InteractiveStep.COMPLETE);

  return stepsToShow.map(step => ({
    id: step,
    label: getStepLabel(step),
    clickable: isClickable(step)
  }));
});

// Получить метку этапа
function getStepLabel(step: InteractiveStep): string {
  const labels: Record<InteractiveStep, string> = {
    [InteractiveStep.INTRO]: 'Начало',
    [InteractiveStep.BORROW]: 'Занять',
    [InteractiveStep.SUBTRACT_UNITS]: 'Единицы',
    [InteractiveStep.SUBTRACT_TENS]: 'Десятки',
    [InteractiveStep.COMPLETE]: 'Готово'
  };
  return labels[step] || '';
}

// Проверка, является ли этап текущим
function isCurrentStep(step: InteractiveStep): boolean {
  return props.currentStep === step;
}

// Проверка, завершён ли этап
function isCompleted(step: InteractiveStep): boolean {
  const currentIndex = props.steps.indexOf(props.currentStep);
  const stepIndex = props.steps.indexOf(step);
  return stepIndex < currentIndex;
}

// Проверка, можно ли кликнуть на этап
function isClickable(step: InteractiveStep): boolean {
  // Можно кликать только на завершённые этапы
  return isCompleted(step);
}

// Процент заполнения
const progressPercent = computed(() => {
  const currentIndex = props.steps.indexOf(props.currentStep);
  const totalSteps = props.steps.length - 1; // Не считаем COMPLETE
  return (currentIndex / totalSteps) * 100;
});

// Обработка клика по этапу
function handleStepClick(step: InteractiveStep, clickable: boolean) {
  if (clickable) {
    emit('stepClick', step);
  }
}
</script>

<style scoped>
.step-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 500px;
  padding: 6px;
}

/* Линия прогресса */
.progress-line {
  position: relative;
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* Точки этапов */
.progress-dots {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3px;
}

.step-dot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  cursor: default;
}

.step-dot-wrapper.clickable {
  cursor: pointer;
}

.step-dot-wrapper.clickable:hover .step-dot {
  transform: scale(1.1);
}

.step-dot {
  width: clamp(22px, 5vw, 30px);
  height: clamp(22px, 5vw, 30px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(9px, 2.2vw, 12px);
  font-weight: 700;
  transition: all 0.3s ease;
  position: relative;
}

/* Точка в ожидании */
.step-dot.pending {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  color: #999;
}

/* Активная точка */
.step-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #667eea;
  color: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  animation: pulse-active 2s infinite;
}

@keyframes pulse-active {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
  }
}

/* Завершённая точка */
.step-dot.completed {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border: 2px solid #4caf50;
  color: white;
}

.dot-icon {
  font-size: clamp(10px, 2.5vw, 13px);
  animation: check-in 0.3s ease;
}

@keyframes check-in {
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

.dot-number {
  font-size: clamp(9px, 2.2vw, 11px);
}

/* Подпись этапа */
.step-label {
  font-size: clamp(8px, 2vw, 10px);
  font-weight: 600;
  color: #666;
  text-align: center;
  white-space: nowrap;
}

.step-dot-wrapper.clickable .step-label {
  color: #667eea;
}

.step-dot.active + .step-label {
  color: #667eea;
  font-weight: 700;
}

.step-dot.completed + .step-label {
  color: #4caf50;
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .step-progress {
    padding: 12px;
    gap: 12px;
  }

  .progress-dots {
    gap: 4px;
  }

  .step-label {
    font-size: 9px;
  }
}

@media (max-width: 360px) {
  .step-progress {
    padding: 8px;
  }

  .step-dot {
    width: 28px;
    height: 28px;
  }

  .dot-icon {
    font-size: 12px;
  }

  .dot-number {
    font-size: 11px;
  }

  .step-label {
    font-size: 8px;
  }
}
</style>
