<template>
  <div class="learning-story">
    <!-- Прогресс -->
    <div
      class="progress-dots"
      role="progressbar"
      :aria-valuenow="currentStep + 1"
      :aria-valuemin="1"
      :aria-valuemax="TOTAL_STEPS"
      aria-label="Шаг обучения"
    >
      <span
        v-for="(_step, index) in TOTAL_STEPS"
        :key="`step-${index}`"
        class="dot"
        :class="{
          'active': index === currentStep,
          'completed': index < currentStep
        }"
        :aria-hidden="true"
      />
    </div>

    <!-- Шаг 0: Введение (Яблоки в корзинке) -->
    <div v-if="currentStep === 0" class="story-step step-0" data-testid="step-0">
      <AppleVisualization :apples="10" :parts="[5, undefined]" />
      <h2>Яблоки в корзинке</h2>
      <p class="instruction">
        Давай научимся решать уравнения с помощью <strong>метода "целое и части"</strong>!
      </p>
      <p class="explanation">
        Представь, что у тебя есть корзинка с яблоками. <br>
        <strong>Целое</strong> — это все яблоки вместе. <br>
        <strong>Части</strong> — это яблоки разделённые на группы.
      </p>
      <p class="rule">
        📏 Правило: <strong>целое = часть₁ + часть₂</strong>
      </p>
      <button class="btn-primary" @click="nextStep">Понятно!</button>
    </div>

    <!-- Шаг 1: Первый тип уравнения (x + a = b) -->
    <div v-else-if="currentStep === 1" class="story-step step-1" data-testid="step-1">
      <AppleVisualization :apples="12" :parts="[7, 5]" :highlight-part="0" />
      <h2>Найди неизвестную часть</h2>
      <p class="instruction">
        В корзинке <strong>12 яблок</strong> (целое). <br>
        На виду <strong>5 яблок</strong> (известная часть). <br>
        Сколько яблок спрятано? (неизвестная часть)
      </p>
      <p class="equation-display">
        x + 5 = 12
      </p>
      <p class="rule">
        📏 Правило: <strong>часть = целое − другая часть</strong>
      </p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 5 }"
          @click="checkAnswer(5)"
        >
          5
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 7 }"
          @click="checkAnswer(7)"
        >
          7
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 12 }"
          @click="checkAnswer(12)"
        >
          12
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 2: Второй тип уравнения (a - x = b) -->
    <div v-else-if="currentStep === 2" class="story-step step-2" data-testid="step-2">
      <AppleVisualization :apples="12" :parts="[5, 7]" :highlight-part="1" />
      <h2>Найди вычитаемое</h2>
      <p class="instruction">
        В корзинке было <strong>12 яблок</strong> (целое). <br>
        Осталось <strong>5 яблок</strong> (известная часть). <br>
        Сколько яблок забрали? (неизвестная часть)
      </p>
      <p class="equation-display">
        12 − x = 5
      </p>
      <p class="rule">
        📏 Правило: <strong>часть = целое − другая часть</strong>
      </p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 5 }"
          @click="checkAnswer(5)"
        >
          5
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 7 }"
          @click="checkAnswer(7)"
        >
          7
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 17 }"
          @click="checkAnswer(17)"
        >
          17
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 3: Третий тип уравнения (x - a = b) -->
    <div v-else-if="currentStep === 3" class="story-step step-3" data-testid="step-3">
      <AppleVisualization :apples="12" :parts="[5, 7]" :highlight-all="true" />
      <h2>Найди уменьшаемое (целое)</h2>
      <p class="instruction">
        Забрали <strong>5 яблок</strong> (известная часть). <br>
        Осталось <strong>7 яблок</strong> (другая часть). <br>
        Сколько яблок было изначально? (целое)
      </p>
      <p class="equation-display">
        x − 5 = 7
      </p>
      <p class="rule">
        📏 Правило: <strong>целое = часть₁ + часть₂</strong>
      </p>

      <div v-if="errorCount > 0 && errorCount >= 2" class="feedback hint">
        💡 Подсказка: части нужно сложить!
      </div>
      <div v-else-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 2 }"
          @click="checkAnswer(2)"
        >
          2
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 12 }"
          @click="checkAnswer(12)"
        >
          12
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 7 }"
          @click="checkAnswer(7)"
        >
          7
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 4: Практика (интерактивное решение) -->
    <div v-else-if="currentStep === 4" class="story-step step-4" data-testid="step-4">
      <AppleVisualization :apples="15" :parts="[8, undefined]" />
      <h2>Твой ход!</h2>
      <p class="instruction">
        В корзинке <strong>15 яблок</strong>. <br>
        На виду <strong>8 яблок</strong>. <br>
        Сколько яблок спрятано?
      </p>
      <p class="equation-display">
        x + 8 = 15
      </p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div v-if="!showCorrect" class="number-input">
        <input
          v-model.number="inputAnswer"
          type="number"
          min="0"
          max="100"
          class="answer-input"
          :class="{ error: errorCount > 0 }"
          @keyup.enter="checkNumberAnswer"
          placeholder="?"
        />
        <button class="btn-primary" @click="checkNumberAnswer">Ответить</button>
      </div>

      <div v-else class="success-message">
        <p>✅ Правильно! 7 + 8 = 15</p>
        <button class="btn-primary" @click="nextStep">Далее</button>
      </div>
    </div>

    <!-- Шаг 5: Завершение -->
    <div v-else-if="currentStep === 5" class="story-step step-5" data-testid="step-5">
      <div class="completion-animation">🎉</div>
      <h2>Отлично!</h2>
      <p class="instruction">
        Ты научился решать уравнения методом "целое и части"!
      </p>
      <div class="summary">
        <p>📏 <strong>Правила:</strong></p>
        <ul>
          <li>целое = часть₁ + часть₂</li>
          <li>часть = целое − другая часть</li>
        </ul>
      </div>
      <p class="next-step">
        Теперь пройди диагностику, чтобы проверить свои знания!
      </p>
      <button
        class="btn-primary btn-large"
        data-testid="complete-button"
        @click="complete"
      >
        Начать диагностику
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppleVisualization from './AppleVisualization.vue';

/**
 * События компонента
 */
export interface LearningStoryEmits {
  /** Завершение обучения */
  complete: [];
}

const emit = defineEmits<LearningStoryEmits>();

// Константы
const TOTAL_STEPS = 6;

// Состояние
const currentStep = ref(0);
const selectedAnswer = ref<number | null>(null);
const inputAnswer = ref<number | null>(null);
const errorCount = ref(0);
const errorMessage = ref('');

// Правильные ответы для каждого шага
const CORRECT_ANSWERS: Record<number, number> = {
  1: 7,  // x + 5 = 12 => x = 7
  2: 7,  // 12 - x = 5 => x = 7
  3: 12, // x - 5 = 7 => x = 12
  4: 7,  // x + 8 = 15 => x = 7
};

/**
 * Показывать правильный ответ
 */
const showCorrect = computed(() => {
  const currentCorrect = CORRECT_ANSWERS[currentStep.value];
  if (currentCorrect === undefined) return false;
  return selectedAnswer.value === currentCorrect || inputAnswer.value === currentCorrect;
});

/**
 * Проверка ответа (кнопки с вариантами)
 */
function checkAnswer(answer: number): void {
  selectedAnswer.value = answer;

  if (answer === CORRECT_ANSWERS[currentStep.value]) {
    // Правильный ответ
    errorCount.value = 0;
    errorMessage.value = '';
  } else {
    // Неправильный ответ
    errorCount.value++;
    showError();
  }
}

/**
 * Проверка числового ответа
 */
function checkNumberAnswer(): void {
  if (inputAnswer.value === null) return;

  const answer = inputAnswer.value;

  if (answer === CORRECT_ANSWERS[currentStep.value]) {
    // Правильный ответ
    errorCount.value = 0;
    errorMessage.value = '';
  } else {
    // Неправильный ответ
    errorCount.value++;
    showError();
  }
}

/**
 * Показать ошибку
 */
function showError(): void {
  const step = currentStep.value;

  switch (step) {
    case 1:
      errorMessage.value = 'Подумай: 12 − 5 = ?';
      break;
    case 2:
      errorMessage.value = 'Подумай: 12 − 5 = ?';
      break;
    case 3:
      errorMessage.value = errorCount.value >= 2
        ? '💡 Подсказка: части нужно сложить! 5 + 7 = ?'
        : 'Неверно. Попробуй ещё раз!';
      break;
    case 4:
      errorMessage.value = 'Подумай: 15 − 8 = ?';
      break;
    default:
      errorMessage.value = 'Неверно. Попробуй ещё раз!';
  }
}

/**
 * Переход к следующему шагу
 */
function nextStep(): void {
  if (currentStep.value < TOTAL_STEPS - 1) {
    currentStep.value++;
    selectedAnswer.value = null;
    inputAnswer.value = null;
    errorCount.value = 0;
    errorMessage.value = '';
  }
}

/**
 * Завершение обучения
 */
function complete(): void {
  emit('complete');
}
</script>

<style scoped>
.learning-story {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Прогресс */
.progress-dots {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.dot.active {
  background: #667eea;
  transform: scale(1.3);
}

.dot.completed {
  background: #4caf50;
}

/* Шаги обучения */
.story-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: step-fade-in 0.5s ease;
}

@keyframes step-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 600;
  color: #333;
  margin: 20px 0;
}

.instruction {
  font-size: clamp(14px, 3vw, 18px);
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
  max-width: 600px;
}

.explanation {
  font-size: clamp(14px, 3vw, 18px);
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}

.rule {
  font-size: clamp(14px, 3vw, 18px);
  color: #667eea;
  font-weight: 500;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin: 16px 0;
}

.equation-display {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #333;
  margin: 20px 0;
  padding: 16px 32px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
}

/* Варианты ответов */
.options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 24px 0;
}

.options.vertical {
  flex-direction: column;
  align-items: stretch;
  max-width: 300px;
}

.option-btn {
  padding: 16px 32px;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #667eea;
  min-width: 80px;
}

.option-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.option-btn.selected {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.option-btn.correct {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.option-btn.incorrect {
  background: #f44336;
  border-color: #f44336;
  color: white;
  animation: incorrect-shake 0.5s ease;
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Числовой ввод */
.number-input {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 24px 0;
}

.answer-input {
  width: clamp(80px, 20vw, 120px);
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: clamp(20px, 4vw, 28px);
  text-align: center;
  transition: all 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.answer-input.error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
  animation: incorrect-shake 0.5s ease;
}

/* Обратная связь */
.feedback {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 500;
  margin: 16px 0;
  animation: message-fade-in 0.3s ease;
}

.feedback.error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid #f44336;
}

.feedback.hint {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
  border: 1px solid #ffc107;
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

/* Успешное сообщение */
.success-message {
  padding: 20px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 2px solid #4caf50;
  animation: success-pop 0.5s ease;
}

@keyframes success-pop {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}

.success-message p {
  font-size: clamp(16px, 3.5vw, 20px);
  color: #4caf50;
  font-weight: 600;
  margin: 0 0 16px 0;
}

/* Завершение */
.completion-animation {
  font-size: clamp(48px, 10vw, 80px);
  margin-bottom: 20px;
  animation: bounce-in 0.6s ease;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.summary {
  background: rgba(102, 126, 234, 0.1);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: left;
}

.summary ul {
  margin: 12px 0;
  padding-left: 24px;
}

.summary li {
  font-size: clamp(14px, 3vw, 18px);
  color: #555;
  line-height: 1.6;
  margin-bottom: 8px;
}

.next-step {
  font-size: clamp(14px, 3vw, 18px);
  color: #666;
  margin: 20px 0;
}

/* Кнопки */
.btn-primary {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-large {
  padding: 18px 48px;
  font-size: clamp(16px, 3.5vw, 20px);
}

/* Мобильные стили - всё в один экран без скролла */
@media (max-width: 480px) {
  .learning-story {
    padding: 8px;
  }

  .progress-dots {
    gap: 6px;
    margin-bottom: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .dot.active {
    transform: scale(1.2);
  }

  h2 {
    margin: 8px 0;
    font-size: clamp(16px, 4vw, 20px);
  }

  .instruction {
    font-size: clamp(12px, 2.8vw, 14px);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .explanation {
    font-size: clamp(11px, 2.5vw, 13px);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .rule {
    font-size: clamp(11px, 2.5vw, 13px);
    padding: 6px 10px;
    margin: 8px 0;
  }

  .equation-display {
    font-size: clamp(18px, 4.5vw, 24px);
    margin: 8px 0;
    padding: 8px 12px;
  }

  .options {
    gap: 8px;
    margin: 12px 0;
  }

  .option-btn {
    padding: 10px 16px;
    font-size: clamp(16px, 3.5vw, 20px);
    min-width: 60px;
  }

  .number-input {
    gap: 6px;
    margin: 12px 0;
  }

  .answer-input {
    width: clamp(60px, 18vw, 80px);
    padding: 8px 10px;
    font-size: clamp(16px, 4vw, 20px);
  }

  .feedback {
    padding: 6px 10px;
    font-size: clamp(10px, 2.2vw, 12px);
    margin: 8px 0;
  }

  .success-message {
    padding: 10px;
  }

  .success-message p {
    font-size: clamp(13px, 3vw, 16px);
    margin-bottom: 8px;
  }

  .completion-animation {
    font-size: clamp(32px, 8vw, 48px);
    margin-bottom: 8px;
  }

  .summary {
    padding: 10px;
    margin: 10px 0;
  }

  .summary li {
    font-size: clamp(11px, 2.5vw, 13px);
    margin-bottom: 4px;
  }

  .next-step {
    font-size: clamp(11px, 2.5vw, 13px);
    margin: 10px 0;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: clamp(12px, 2.8vw, 14px);
  }

  .btn-large {
    padding: 12px 32px;
    font-size: clamp(14px, 3.2vw, 16px);
  }
}

/* Планшеты и большие экраны - ограничиваем рост элементов */
@media (min-width: 481px) {
  .learning-story {
    padding: 12px;
    max-height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  h2 {
    margin: 10px 0;
    font-size: 20px;
  }

  .instruction {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 10px;
  }

  .explanation {
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 10px;
  }

  .rule {
    font-size: 13px;
    padding: 8px 14px;
    margin: 10px 0;
  }

  .equation-display {
    font-size: 24px;
    margin: 10px 0;
    padding: 10px 16px;
  }

  .option-btn {
    padding: 12px 20px;
    font-size: 18px;
  }

  .answer-input {
    width: 80px;
    padding: 10px 12px;
    font-size: 18px;
  }
}
</style>
