<template>
  <div class="level-2-display">
    <!-- Визуализация целое и части (яблоки) -->
    <AppleVisualization
      :apples="problem.whole"
      :parts="visualizationParts"
      :highlight-part="highlightPartIndex"
      :hide-whole="isUnknownMinuend"
      size="medium"
    />

    <!-- Уравнение -->
    <div class="equation-display">
      {{ problem.expression }}
    </div>

    <!-- Вопрос -->
    <div class="question-text">
      {{ questionText }}
    </div>

    <!-- Поле ввода -->
    <div class="answer-input-container">
      <label class="answer-label">x =</label>
      <input
        ref="answerInputRef"
        v-model.number="inputValue"
        data-testid="answer-input"
        type="number"
        class="answer-input"
        :class="inputClass"
        :disabled="showResult"
        @keyup.enter="checkAnswer"
      />
    </div>

    <!-- Кнопка проверки -->
    <button
      data-testid="check-button"
      type="button"
      class="check-button"
      :disabled="!canCheck || showResult"
      @click="checkAnswer"
    >
      Проверить
    </button>

    <!-- Сообщение о результате -->
    <div v-if="showResult" class="result-message" :class="resultClass">
      {{ resultMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppleVisualization from './AppleVisualization.vue';
import type { EquationWholePartProblem } from '@/types';

/**
 * Props интерфейс для Level2Display
 */
export interface Level2DisplayProps {
  /** Задача уравнения */
  problem: EquationWholePartProblem;
  /** Показывать результат (для обратной связи) */
  showResult?: boolean;
}

const props = withDefaults(defineProps<Level2DisplayProps>(), {
  showResult: false,
});

const emit = defineEmits<Level2DisplayEmits>();

/**
 * События компонента
 */
export interface Level2DisplayEmits {
  /** Завершение ответа */
  complete: [result: CompletionResult];
  /** Запрос подсказки */
  hint: [];
}

export interface CompletionResult {
  /** Введённое значение */
  value: number;
  /** Правильность ответа */
  isCorrect: boolean;
  /** Временная метка */
  timestamp: number;
}

// Состояние
const inputValue = ref<number | null>(null);
const isCorrect = ref(false);
// eslint-disable-next-line no-undef
const answerInputRef = ref<HTMLInputElement | null>(null);

/**
 * Части для визуализации в зависимости от типа уравнения
 * Скрываем ту часть, которая соответствует x в уравнении
 */
const visualizationParts = computed<[number | undefined, number | undefined]>(() => {
  switch (props.problem.equationType) {
    case 'unknownAddend':
      // x + a = b => [?, a] - x это первая часть, скрываем её
      return [undefined, props.problem.knownPart];
    case 'unknownSubtrahend':
      // a - x = b => [b, ?] - x это вторая часть (вычитаемое), скрываем её
      return [props.problem.knownPart, undefined];
    case 'unknownMinuend':
      // x - a = b => [?, ?] - x это целое, обе части известны, но скрываем чтобы не давать ответ
      return [props.problem.knownPart, props.problem.whole - props.problem.knownPart];
    default:
      return [undefined, props.problem.knownPart];
  }
});

/**
 * Какую часть подсветить
 */
const highlightPartIndex = computed<0 | 1 | undefined>(() => {
  switch (props.problem.equationType) {
    case 'unknownAddend':
      return 0; // Подсветить левую часть (неизвестную)
    case 'unknownSubtrahend':
      return 1; // Подсветить правую часть (неизвестную)
    case 'unknownMinuend':
      return undefined; // Подсветить всё (целое неизвестно)
    default:
      return 0;
  }
});

/**
 * Является ли тип уравнения "неизвестное уменьшаемое" (x - a = b)
 */
const isUnknownMinuend = computed(() => {
  return props.problem.equationType === 'unknownMinuend';
});

/**
 * Текст вопроса в зависимости от типа уравнения
 */
const questionText = computed(() => {
  switch (props.problem.equationType) {
    case 'unknownAddend':
      return 'Сколько яблок в первой части?';
    case 'unknownSubtrahend':
      return 'Сколько яблок забрали?';
    case 'unknownMinuend':
      return 'Сколько яблок было всего?';
    default:
      return 'Чему равно x?';
  }
});

/**
 * Класс для поля ввода
 */
const inputClass = computed(() => {
  if (!props.showResult) return '';
  return isCorrect.value ? 'correct' : 'incorrect';
});

/**
 * Класс для сообщения о результате
 */
const resultClass = computed(() => {
  return isCorrect.value ? 'success' : 'error';
});

/**
 * Текст сообщения о результате
 */
const resultMessage = computed(() => {
  if (isCorrect.value) {
    return `✅ Правильно! x = ${props.problem.correctAnswer}`;
  }

  const diff = Math.abs((inputValue.value ?? 0) - props.problem.correctAnswer);

  if (inputValue.value === null) {
    return '❌ Введи число';
  } else if (diff === 1) {
    return '❌ Очень близко! Попробуй прибавить или вычесть 1';
  } else {
    return `❌ Неправильно. Правильный ответ: ${props.problem.correctAnswer}`;
  }
});

/**
 * Показывать результат
 */
const showResult = computed(() => {
  return props.showResult;
});

/**
 * Можно ли проверять ответ
 */
const canCheck = computed(() => {
  return inputValue.value !== null;
});

/**
 * Проверка ответа
 */
function checkAnswer(): void {
  if (!canCheck.value || showResult.value) return;

  const value = inputValue.value!;
  const isAnswerCorrect = value === props.problem.correctAnswer;
  isCorrect.value = isAnswerCorrect;

  // Эмитим событие завершения
  emit('complete', {
    value,
    isCorrect: isAnswerCorrect,
    timestamp: Date.now()
  });

  if (answerInputRef.value) {
    answerInputRef.value.blur();
  }
}

// Watch для сброса состояния при новой задаче
watch(() => props.problem.id, () => {
  inputValue.value = null;
  isCorrect.value = false;
});
</script>

<style scoped>
.level-2-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

/* Уравнение */
.equation-display {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #333;
  padding: 16px 32px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  text-align: center;
}

/* Вопрос */
.question-text {
  font-size: clamp(16px, 3.5vw, 20px);
  font-weight: 600;
  color: #667eea;
  text-align: center;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  max-width: 400px;
}

/* Поле ввода */
.answer-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-label {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.answer-input {
  width: clamp(80px, 20vw, 120px);
  padding: 10px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: clamp(16px, 4vw, 24px);
  text-align: center;
  transition: all 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.answer-input.correct {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
  animation: correct-pulse 0.5s ease;
}

.answer-input.incorrect {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
  animation: incorrect-shake 0.5s ease;
}

@keyframes correct-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Кнопка проверки */
.check-button {
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.check-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.check-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Сообщение о результате */
.result-message {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 500;
  text-align: center;
  max-width: 400px;
  animation: message-fade-in 0.3s ease;
}

.result-message.success {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.result-message.error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid #f44336;
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Мобильные стили */
@media (max-width: 480px) {
  .level-2-display {
    padding: 8px;
    gap: 12px;
  }

  .equation-display {
    font-size: clamp(18px, 4.5vw, 24px);
    padding: 8px 12px;
  }

  .question-text {
    font-size: clamp(13px, 3vw, 16px);
    padding: 8px 12px;
  }

  .answer-input-container {
    gap: 6px;
  }

  .answer-label {
    font-size: clamp(16px, 4vw, 20px);
  }

  .answer-input {
    width: clamp(60px, 18vw, 80px);
    padding: 8px 10px;
    font-size: clamp(16px, 4vw, 20px);
  }

  .check-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .result-message {
    font-size: clamp(10px, 2.2vw, 12px);
    padding: 8px 12px;
  }
}
</style>
