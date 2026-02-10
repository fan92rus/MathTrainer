<template>
  <Transition name="animated-modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <!-- Кнопка закрытия -->
        <button class="modal-close" @click="emit('close')" aria-label="Закрыть">
          ✕
        </button>

        <!-- Заголовок -->
        <h3 class="modal-title">Решение по шагам</h3>

        <!-- Анимированный пример -->
        <AnimatedColumnDisplay
          :minuend="minuend"
          :subtrahend="subtrahend"
          :state="animation.currentStepState.value"
        />

        <!-- Текст объяснения -->
        <div class="explanation-container">
          <p class="explanation-text explanation-text">
            {{ animation.currentStepState.value.explanation }}
          </p>
        </div>

        <!-- Прогресс-индикатор -->
        <div class="progress-dots">
          <button
            v-for="(_, index) in animation.totalSteps.value + 1"
            :key="index"
            class="progress-dot"
            :class="{
              'active': index === animation.currentStep.value,
              'completed': index < animation.currentStep.value
            }"
            :aria-label="`Перейти к шагу ${index + 1}`"
            @click="animation.goToStep(index)"
          />
        </div>

        <!-- Кнопки навигации -->
        <div class="navigation-controls">
          <button
            class="nav-button nav-button-prev"
            :disabled="!animation.canGoPrev.value"
            @click="animation.prevStep"
          >
            ← Назад
          </button>

          <span class="step-counter">
            {{ animation.currentStep.value + 1 }} / {{ animation.totalSteps.value + 1 }}
          </span>

          <button
            class="nav-button nav-button-next"
            :disabled="!animation.canGoNext.value && !isLastStep"
            @click="handleNext"
          >
            {{ isLastStep ? 'Готово!' : 'Далее →' }}
          </button>
        </div>

        <!-- Клавиатурные подсказки -->
        <div class="keyboard-hint">
          <span class="hint-key">←</span>
          <span class="hint-key">→</span>
          для навигации,
          <span class="hint-key">Esc</span>
          для закрытия
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted, computed } from 'vue';
import AnimatedColumnDisplay from './AnimatedColumnDisplay.vue';
import { useSubtractionAnimation } from '@/composables/useSubtractionAnimation';

export interface Props {
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Показывать модальное окно */
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false
});

const emit = defineEmits<{
  'close': [];
  'complete': [];
}>();

// Инициализация анимации
const animation = useSubtractionAnimation(props.minuend, props.subtrahend);

// Проверяем, последний ли это шаг
const isLastStep = computed(() => {
  return !animation.canGoNext.value;
});

// Обработка нажатия "Далее"
function handleNext() {
  if (animation.canGoNext.value) {
    animation.nextStep();
  } else {
    emit('complete');
    emit('close');
  }
}

// Обработка клавиатурных сокращений
function handleKeydown(event: KeyboardEvent) {
  if (!props.show) return;

  switch (event.key) {
    case 'ArrowRight':
      if (animation.canGoNext.value) {
        event.preventDefault();
        animation.nextStep();
      }
      break;
    case 'ArrowLeft':
      if (animation.canGoPrev.value) {
        event.preventDefault();
        animation.prevStep();
      }
      break;
    case 'Escape':
      event.preventDefault();
      emit('close');
      break;
  }
}

// Сброс при открытии
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    animation.reset();
  }
});

// Регистрация обработчиков клавиатуры
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

.modal-close:active {
  transform: scale(0.95);
}

.modal-title {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
}

.explanation-container {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-radius: 12px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.explanation-text {
  font-size: clamp(14px, 3vw, 18px);
  color: #333;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.progress-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-dot:hover:not(.active) {
  background: #bdbdbd;
  transform: scale(1.1);
}

.navigation-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.nav-button {
  padding: 12px 20px;
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.nav-button-prev {
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  color: #333;
}

.nav-button-prev:hover:not(:disabled) {
  background: linear-gradient(135deg, #d0d0d0 0%, #e5e5e5 100%);
  transform: translateX(-2px);
}

.nav-button-next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-button-next:hover:not(:disabled) {
  transform: translateX(2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.step-counter {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  color: #666;
  min-width: 60px;
  text-align: center;
}

.keyboard-hint {
  font-size: clamp(11px, 2.5vw, 13px);
  color: #999;
  text-align: center;
  padding-top: 8px;
}

.hint-key {
  display: inline-block;
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-family: monospace;
  margin: 0 2px;
}

/* Modal transitions */
.animated-modal-enter-active {
  animation: modalSlideIn 0.3s ease-out;
}

.animated-modal-leave-active {
  animation: modalSlideOut 0.2s ease-in;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

/* Адаптивность для мобильных */
@media (max-width: 480px) {
  .modal-content {
    padding: 20px;
    gap: 12px;
    border-radius: 16px;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    top: 12px;
    right: 12px;
  }

  .modal-title {
    font-size: 18px;
  }

  .explanation-container {
    padding: 12px;
    min-height: 50px;
  }

  .explanation-text {
    font-size: 14px;
  }

  .navigation-controls {
    gap: 12px;
  }

  .nav-button {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 80px;
  }

  .step-counter {
    font-size: 14px;
    min-width: 50px;
  }

  .progress-dot {
    width: 10px;
    height: 10px;
  }

  .keyboard-hint {
    display: none;
  }
}

@media (max-width: 360px) {
  .modal-content {
    padding: 16px;
  }

  .nav-button {
    padding: 8px 12px;
    font-size: 13px;
    min-width: 70px;
  }
}
</style>
