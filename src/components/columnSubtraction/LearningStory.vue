<template>
  <div class="learning-story">
    <!-- Прогресс -->
    <div class="progress-dots" role="progressbar" :aria-valuenow="currentStep + 1" :aria-valuemin="1" :aria-valuemax="6" aria-label="Шаг обучения">
      <span
        v-for="(_step, index) of 6"
        :key="`step-${index}`"
        class="dot"
        :class="{
          'active': index === currentStep,
          'completed': index < currentStep
        }"
        :aria-hidden="true"
      />
    </div>

    <!-- Шаг 0: Введение -->
    <div v-if="currentStep === 0" class="story-step step-0">
      <ShopVisualization :packs="3" :loose-candies="5" />
      <h2>Добро пожаловать в магазин!</h2>
      <p class="instruction">У тебя <strong>3 пачки</strong> по 10 конфет и ещё <strong>5 конфет россыпью</strong>.</p>
      <p class="total">Всего: <strong>35 конфет</strong></p>
      <button class="btn-primary" @click="nextStep">Понятно!</button>
    </div>

    <!-- Шаг 1: Проблема -->
    <div v-else-if="currentStep === 1" class="story-step step-1">
      <ShopVisualization :packs="3" :loose-candies="5" />
      <h2>Покупатель хочет 7 конфет</h2>
      <p class="instruction">У тебя <strong>5 конфет россыпью</strong>. Хватит ли?</p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'yes' }"
          @click="checkAnswer('yes')"
        >
          Да
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'no' }"
          @click="checkAnswer('no')"
        >
          Нет
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'dont-know' }"
          @click="checkAnswer('dont-know')"
        >
          Не знаю
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 2: Решение -->
    <div v-else-if="currentStep === 2" class="story-step step-2">
      <ShopVisualization :packs="3" :loose-candies="5" />
      <h2>Не хватает!</h2>
      <p class="instruction">Покупателю нужно 7 конфет, а у тебя только 5 россыпью. Что делать?</p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options vertical">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'open' }"
          @click="checkAnswer('open')"
        >
          Вскрыть пачку
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'refuse' }"
          @click="checkAnswer('refuse')"
        >
          Отказать покупателю
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 'give5' }"
          @click="checkAnswer('give5')"
        >
          Дать только 5 конфет
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 3: Сколько пачек -->
    <div v-else-if="currentStep === 3" class="story-step step-3">
      <ShopVisualization :packs="3" :loose-candies="5" />
      <h2>Сколько пачек вскроешь?</h2>
      <p class="instruction">Тебе нужно отдать 7 конфет, есть 5. Не хватает 2 конфеты.</p>

      <div v-if="errorCount > 0 && errorCount >= 2" class="feedback hint">
        💡 Подсказка: в одной пачке 10 конфет. Этого хватит!
      </div>
      <div v-else-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 1 }"
          @click="checkAnswer(1)"
        >
          1
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 2 }"
          @click="checkAnswer(2)"
        >
          2
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 3 }"
          @click="checkAnswer(3)"
        >
          3
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 4: Подсчёт -->
    <div v-else-if="currentStep === 4" class="story-step step-4">
      <ShopVisualization :packs="2" :loose-candies="15" />
      <h2>Вскрыли 1 пачку</h2>
      <p class="instruction">Было 5 конфет + 10 из пачки. Сколько теперь конфет россыпью?</p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div class="options">
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 10 }"
          @click="checkAnswer(10)"
        >
          10
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 15 }"
          @click="checkAnswer(15)"
        >
          15
        </button>
        <button
          class="option-btn"
          :class="{ selected: selectedAnswer === 5 }"
          @click="checkAnswer(5)"
        >
          5
        </button>
      </div>

      <button v-if="showCorrect" class="btn-primary" @click="nextStep">Далее</button>
    </div>

    <!-- Шаг 5: Результат -->
    <div v-else-if="currentStep === 5" class="story-step step-5">
      <ShopVisualization :packs="2" :loose-candies="8" />
      <h2>15 - 7 = ?</h2>
      <p class="instruction">Отдаём 7 конфет покупателю. Сколько осталось?</p>

      <div v-if="errorCount > 0" class="feedback" :class="{ error: true }">
        {{ errorMessage }}
      </div>

      <div v-if="!showCorrect" class="number-input">
        <input
          v-model="inputAnswer"
          type="number"
          min="0"
          max="99"
          class="answer-input"
          :class="{ error: errorCount > 0 }"
          @keyup.enter="checkNumberAnswer"
        />
        <button class="btn-primary" @click="checkNumberAnswer">Ответить</button>
      </div>

      <div v-else class="success-message">
        <h3>Отлично! ✅</h3>
        <p>Ты прода{{ 7 === 7 ? 'л' : 'ла' }} 7 конфет, у тебя осталось 8 конфет россыпью и 2 пачки.</p>
        <p class="conclusion">Теперь ты понимаешь, как работает заимствование!</p>
        <button class="btn-primary" @click="completeLearning">Завершить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ShopVisualization from './ShopVisualization.vue';

const emit = defineEmits(['complete']);

const currentStep = ref(0);
const errorCount = ref(0);
const selectedAnswer = ref<string | number | null>(null);
const showCorrect = ref(false);
const inputAnswer = ref('');
const errorMessage = ref('');

// Правильные ответы для каждого шага
const correctAnswers: Record<number, string | number> = {
  1: 'no',
  2: 'open',
  3: 1,
  4: 15,
  5: 8
};

// Сообщения об ошибках
const errorMessages: Record<number, string[]> = {
  1: ['5 конфет меньше чем 7. Подумай ещё!', 'Правильно! 5 меньше 7.'],
  2: ['Покупатель хочет купить конфеты!', 'Покупатель хочет именно 7 конфет.'],
  3: ['Подумай: тебе не хватает только 2 конфеты.', 'В одной пачке 10 конфет — этого хватит!'],
  4: ['5 + 10 из пачки = ?', 'Было 5, добавили 10. Сколько получилось?'],
  5: ['Посчитай: 15 минус 7...', 'Попробуй ещё раз!']
};

function nextStep() {
  currentStep.value++;
  errorCount.value = 0;
  selectedAnswer.value = null;
  showCorrect.value = false;
  errorMessage.value = '';
}

function checkAnswer(answer: string | number) {
  selectedAnswer.value = answer;

  if (answer === correctAnswers[currentStep.value]) {
    showCorrect.value = true;
    errorCount.value = 0;
  } else {
    errorCount.value++;
    const messages = errorMessages[currentStep.value];
    if (messages && messages.length > 0) {
      errorMessage.value = messages[Math.min(errorCount.value - 1, messages.length - 1)] || '';
    }

    if (errorCount.value >= 3) {
      // После 3 ошибок показываем правильный ответ
      setTimeout(() => {
        showCorrect.value = true;
        const answer = correctAnswers[currentStep.value];
        if (answer !== undefined) {
          selectedAnswer.value = answer;
        }
      }, 1500);
    }
  }
}

function checkNumberAnswer() {
  const answer = parseInt(inputAnswer.value, 10);
  if (isNaN(answer)) return;

  if (answer === correctAnswers[5]) {
    showCorrect.value = true;
  } else {
    errorCount.value++;
    const messages = errorMessages[5];
    if (messages && messages.length > 0) {
      errorMessage.value = messages[Math.min(errorCount.value - 1, messages.length - 1)] || '';
    }

    if (errorCount.value >= 3) {
      showCorrect.value = true;
      inputAnswer.value = '8';
    }
  }
}

function completeLearning() {
  emit('complete');
}
</script>

<style scoped>
.learning-story {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

/* Прогресс */
.progress-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s ease;
}

.dot.active {
  background: #667eea;
  transform: scale(1.2);
}

.dot.completed {
  background: var(--color-success);
}

/* Шаги истории */
.story-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

h2 {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  text-align: center;
  color: #333;
}

.instruction {
  font-size: clamp(14px, 3vw, 18px);
  text-align: center;
  color: #666;
  line-height: 1.5;
}

.total {
  font-size: clamp(16px, 3.5vw, 20px);
  font-weight: 600;
  color: #667eea;
}

/* Варианты ответов */
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
}

.options.vertical {
  flex-direction: column;
}

.option-btn {
  min-height: clamp(44px, 10vw, 56px);
  min-width: clamp(80px, 20vw, 120px);
  padding: 12px;
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

.option-btn.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Обратная связь */
.feedback {
  padding: 12px;
  border-radius: 12px;
  font-size: clamp(12px, 2.5vw, 16px);
  text-align: center;
  max-width: 400px;
}

.feedback.error {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  color: #8B0000;
  animation: shake 0.5s ease;
}

.feedback.hint {
  background: #FFF9C4;
  color: #F57F17;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Ввод числа */
.number-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.answer-input {
  width: clamp(80px, 20vw, 120px);
  height: clamp(44px, 10vw, 56px);
  font-size: clamp(18px, 4vw, 24px);
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 8px;
}

.answer-input.error {
  border-color: var(--color-error);
  animation: shake 0.5s ease;
}

/* Сообщение об успехе */
.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  animation: successPop 0.6s ease;
}

@keyframes successPop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.success-message h3 {
  font-size: clamp(20px, 5vw, 28px);
  color: var(--color-success);
}

.success-message .conclusion {
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  color: #667eea;
}

/* Кнопки */
.btn-primary {
  min-height: clamp(44px, 10vw, 56px);
  padding: 12px 24px;
  font-size: clamp(14px, 3vw, 18px);
  font-weight: 600;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
}

/* Адаптивность */
@media (max-width: 480px) {
  .learning-story {
    padding: 12px;
  }

  .options {
    gap: 8px;
  }

  .option-btn {
    min-height: clamp(40px, 10vw, 48px);
    min-width: clamp(70px, 18vw, 100px);
    font-size: clamp(13px, 3vw, 16px);
  }
}

@media (max-width: 360px) {
  .learning-story {
    padding: 8px;
  }

  .progress-dots {
    gap: 4px;
  }

  .dot {
    width: 20px;
    height: 20px;
  }
}
</style>
