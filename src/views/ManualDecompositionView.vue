<!-- global HTMLInputElement -->
<template>
  <div class="app-container" :style="{ '--keyboard-height': keyboardHeight + 'px' }">
    <div class="game-container">
      <div v-if="!gameOver" class="game-container-inner">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <button class="back-button" @click="goToMain">← Назад</button>
            <div class="level-info">
              <span class="level-indicator">Ручной режим: Разложение чисел</span>
            </div>
          </div>
          <h1 class="title">Реши по шагам</h1>
        </div>

        <ScoreDisplay
          :current-score="score"
          :total-score="totalScore"
          :current-question="currentQuestion"
          :total-questions="totalQuestions"
        />

        <!-- Динамический контент в зависимости от шага -->
        <div class="decomposition-container">
          <!-- Шаг 0: Показываем исходный пример -->
          <div v-if="step === 0" class="step-container">
            <div class="expression-large">
              {{ getDisplayExpression() }}
            </div>
            <div class="step-hint">
              <p>👆 Нажми "Начать", чтобы решить этот пример по шагам</p>
            </div>
            <button class="start-button" @click="startDecomposition">Начать решать</button>
          </div>

          <!-- Шаг 1: Разложение второго числа -->
          <div v-if="step === 1" class="step-container">
            <div class="expression-part">
              {{ firstNumber }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              <span class="highlighted-number">{{ secondNumber }}</span>
              = ?
            </div>
            <div class="step-instruction">
              📝
              <span v-if="isAddition"
                >Разложи число <strong>{{ secondNumber }}</strong> на удобные слагаемые</span
              >
              <span v-else
                >Разложи число <strong>{{ secondNumber }}</strong> для удобного вычитания</span
              >
            </div>
            <div class="decomposition-input">
              {{ secondNumber }} =
              <input
                ref="firstPartInput"
                v-model="firstPart"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="next"
                @keyup.enter="checkDecomposition"
                @input="onDecompositionInput"
                @focus="handleInputFocus(firstPartInput)"
                autocomplete="off"
              />
              +
              <input
                ref="secondPartInput"
                v-model="secondPart"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="done"
                @keyup.enter="checkDecomposition"
                @input="onDecompositionInput"
                @focus="handleInputFocus(secondPartInput)"
                autocomplete="off"
              />
            </div>
            <button
              v-if="!decompositionChecked && !isMobileWithKeyboard"
              class="check-button"
              @click="checkDecomposition"
              :disabled="!firstPart || !secondPart"
            >
              Проверить
            </button>

            <!-- Подсказка -->
            <div v-if="!decompositionChecked && showHint" class="hint-box">
              💡 Разложи число на десятки и единицы<br />
              Для примера {{ firstNumber }} + {{ secondNumber }}:<br />
              Важно: сначала десятки, потом единицы!<br />
              Подсказка: {{ secondNumber }} = {{ correctDecomposition.first }} (десятки) +
              {{ correctDecomposition.second }} (единицы)
            </div>

            <!-- Обратная связь -->
            <div v-if="decompositionChecked" class="feedback-box">
              <div v-if="decompositionCorrect" class="correct-feedback">
                ✅ Правильно! {{ secondNumber }} = {{ firstPart }} + {{ secondPart }}
              </div>
              <div v-else>
                <div v-if="decompositionError === 'tens'" class="hint-feedback">
                  💡 Подумай, сколько десятков в числе {{ secondNumber }}?
                  <div class="auto-retry-hint">Исправь значение в поле выше и попробуй снова</div>
                </div>
                <div v-else-if="decompositionError === 'units'" class="retry-feedback">
                  🔄 Попробуй еще раз!
                  <div class="auto-retry-hint">Исправь значение в поле выше и попробуй снова</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Шаг 2: Первая часть решения -->
          <div v-if="step === 2" class="step-container">
            <div class="expression-part">
              {{ firstNumber }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{ firstPart }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{ secondPart }} = ?
            </div>
            <div class="step-instruction">
              📝 <span v-if="isAddition">Сначала реши {{ firstNumber }} + {{ firstPart }}</span>
              <span v-else>Сначала реши {{ firstNumber }} - {{ firstPart }}</span>
            </div>
            <div class="calculation-input">
              {{ firstNumber }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{ firstPart }} =
              <input
                ref="intermediateInput"
                v-model="intermediateResult"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="next"
                @keyup.enter="checkIntermediate"
                @focus="handleInputFocus(intermediateInput)"
                :disabled="intermediateChecked"
                autocomplete="off"
              />
            </div>
            <button
              v-if="!isMobileWithKeyboard"
              class="check-button"
              @click="checkIntermediate"
              :disabled="intermediateChecked || !intermediateResult"
            >
              Проверить
            </button>

            <!-- Обратная связь -->
            <div v-if="intermediateChecked" class="feedback-box">
              <div v-if="intermediateCorrect" class="correct-feedback">
                ✅ Верно! {{ firstNumber }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ firstPart }} = {{ intermediateResult }}
              </div>
              <div v-else class="incorrect-feedback">
                ❌ Неправильно. Попробуй еще раз!
                <br />
                Правильный ответ: {{ firstNumber }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ firstPart }} = {{ correctIntermediate }}
              </div>
              <button class="next-button" @click="nextStep">
                {{ intermediateCorrect ? 'Далее →' : 'Продолжить →' }}
              </button>
            </div>
          </div>

          <!-- Шаг 3: Разложение единиц (если нужно) -->
          <div v-if="step === 3" class="step-container">
            <div class="expression-part">
              {{ intermediateResult }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              <span class="highlighted-number">{{ secondPart }}</span>
              = ?
            </div>
            <div class="step-instruction">
              📝
              <span v-if="isAddition"
                >Разложи число <strong>{{ secondPart }}</strong> для удобного сложения</span
              >
              <span v-else
                >Разложи число <strong>{{ secondPart }}</strong> для удобного вычитания</span
              >
            </div>
            <div
              class="decomposition-input"
              v-if="isAddition && correctDecomposition.needsFurtherDecomposition"
            >
              {{ secondPart }} =
              <input
                ref="furtherFirstInput"
                v-model="furtherFirstPart"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="next"
                @keyup.enter="checkFurther"
                @focus="handleInputFocus(furtherFirstInput)"
                :disabled="furtherChecked"
                autocomplete="off"
              />
              +
              <input
                ref="furtherSecondInput"
                v-model="furtherSecondPart"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="done"
                @keyup.enter="checkFurther"
                @focus="handleInputFocus(furtherSecondInput)"
                :disabled="furtherChecked"
                autocomplete="off"
              />
            </div>
            <button
              v-if="
                isAddition &&
                correctDecomposition.needsFurtherDecomposition &&
                !isMobileWithKeyboard
              "
              class="check-button"
              @click="checkFurther"
              :disabled="furtherChecked || !furtherFirstPart || !furtherSecondPart"
            >
              Проверить
            </button>

            <!-- Обратная связь для разложения -->
            <div
              v-if="furtherChecked && isAddition && correctDecomposition.needsFurtherDecomposition"
              class="feedback-box"
            >
              <div v-if="furtherCorrect" class="correct-feedback">
                ✅ Правильно! {{ secondPart }} = {{ furtherFirstPart }} + {{ furtherSecondPart }}
              </div>
              <div v-else class="incorrect-feedback">
                ❌ Неправильно. Попробуй еще раз!
                <br />
                Правильный ответ: {{ secondPart }} = {{ correctDecomposition.furtherFirst }} +
                {{ correctDecomposition.furtherSecond }}
              </div>
              <button class="next-button" @click="nextStep">
                {{ furtherCorrect ? 'Далее →' : 'Продолжить →' }}
              </button>
            </div>

            <!-- Если дополнительное разложение не нужно -->
            <div
              v-if="!isAddition || !correctDecomposition.needsFurtherDecomposition"
              class="feedback-box"
            >
              <div class="correct-feedback">✅ Можно сразу сложить!</div>
              <button class="next-button" @click="nextStep">Далее →</button>
            </div>
          </div>

          <!-- Шаг 3.5: Промежуточный результат после разложения единиц -->
          <div v-if="step === 3.5" class="step-container">
            <div class="expression-part">
              {{ intermediateResult }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{ furtherFirstPart }} = ?
            </div>
            <div class="step-instruction">
              📝
              <span v-if="isAddition"
                >Сначала реши {{ intermediateResult }} + {{ furtherFirstPart }}</span
              >
              <span v-else>Сначала реши {{ intermediateResult }} - {{ furtherFirstPart }}</span>
            </div>
            <div class="calculation-input">
              {{ intermediateResult }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{ furtherFirstPart }} =
              <input
                ref="furtherIntermediateInput"
                v-model="furtherIntermediate"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="next"
                @keyup.enter="checkFurtherIntermediate"
                @focus="handleInputFocus(furtherIntermediateInput)"
                :disabled="furtherChecked"
                autocomplete="off"
              />
            </div>
            <button
              v-if="!isMobileWithKeyboard"
              class="check-button"
              @click="checkFurtherIntermediate"
              :disabled="furtherChecked || !furtherIntermediate"
            >
              Проверить
            </button>

            <!-- Обратная связь -->
            <div v-if="furtherChecked" class="feedback-box">
              <div v-if="furtherCorrect" class="correct-feedback">
                ✅ Верно! {{ intermediateResult }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ furtherFirstPart }} = {{ furtherIntermediate }}
              </div>
              <div v-else class="incorrect-feedback">
                ❌ Неправильно. Попробуй еще раз!
                <br />
                Правильный ответ: {{ intermediateResult }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ furtherFirstPart }} = {{ correctFurtherIntermediate }}
              </div>
              <button class="next-button" @click="nextStep">
                {{ furtherCorrect ? 'Далее →' : 'Продолжить →' }}
              </button>
            </div>
          </div>

          <!-- Шаг 4: Финальный расчет -->
          <div v-if="step === 4" class="step-container">
            <div class="expression-part">
              {{ furtherIntermediate || intermediateResult || firstNumber }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{
                correctDecomposition.needsFurtherDecomposition && isAddition
                  ? furtherSecondPart
                  : secondPart
              }}
              = ?
            </div>
            <div class="step-instruction">
              📝 <span v-if="isAddition">Теперь прибавь оставшееся число</span>
              <span v-else>Теперь вычти оставшееся число</span>
            </div>
            <div class="calculation-input">
              {{ furtherIntermediate || intermediateResult || firstNumber }}
              <span v-if="isAddition">+</span>
              <span v-else>-</span>
              {{
                correctDecomposition.needsFurtherDecomposition && isAddition
                  ? furtherSecondPart
                  : secondPart
              }}
              =
              <input
                ref="finalInput"
                v-model="finalResult"
                type="number"
                class="number-input"
                placeholder="?"
                inputmode="numeric"
                enterkeyhint="done"
                @keyup.enter="checkFinal"
                @focus="handleInputFocus(finalInput)"
                :disabled="answered"
                autocomplete="off"
              />
            </div>
            <button
              v-if="!isMobileWithKeyboard"
              class="check-button"
              @click="checkFinal"
              :disabled="answered || !finalResult"
            >
              Проверить
            </button>

            <!-- Обратная связь -->
            <div v-if="answered" class="feedback-box">
              <div v-if="isCorrect" class="correct-feedback">
                🎉 Отлично! Ты правильно решил пример!<br />
                {{ firstNumber }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ secondNumber }} = {{ finalResult }}
              </div>
              <div v-else class="incorrect-feedback">
                ❌ Неправильно.<br />
                Правильный ответ: {{ firstNumber }}
                <span v-if="isAddition">+</span>
                <span v-else>-</span>
                {{ secondNumber }} = {{ correctAnswer }}
              </div>
              <button class="next-button" @click="nextQuestion">Следующий пример →</button>
            </div>
          </div>

          <!-- Индикатор прогресса по шагам -->
          <div class="steps-progress">
            <div
              v-for="i in 5"
              :key="i - 1"
              :class="[
                'step-dot',
                {
                  active: i - 1 === step || (i - 1 === 3 && step === 3.5),
                  completed:
                    (i - 1 < step &&
                      !(i - 1 === 3 && !correctDecomposition.needsFurtherDecomposition)) ||
                    (i - 1 === 3 && !correctDecomposition.needsFurtherDecomposition && step >= 3) ||
                    (i - 1 === 4 && answered)
                }
              ]"
            ></div>
          </div>
        </div>

        <SessionStreakBar
          :current-streak="streakTracker.currentStreak.value"
          @milestone="onStreakMilestone"
        />

        <ProgressBar :progress-percent="progressPercent" />

        <StarRating :score="score" />
      </div>

      <GameOver
        v-else
        :correct-answers="correctAnswers"
        :total-answers="totalAnswers"
        :score="score"
        @restart="restartGame"
        @exit="goToMain"
      />
    </div>
  </div>
</template>

<script lang="ts">
/* global HTMLInputElement */
  import { ref, onMounted, computed, nextTick, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useScoresStore } from '../store/scores';
  import { useSettingsStore } from '../store/settings';
  import { useGameLogic } from '../composables/useGameLogic';
  import { useMobileKeyboard } from '../composables/useMobileKeyboard';
  import { useChallengeStreak } from '../composables/useChallengeStreak';
  import { usePlayerStore } from '../store/player';
  import {
    generateDecompositionProblem
  } from '../utils/math/index';
  import type { MathProblem, EquationProblem } from '../types';
  import ScoreDisplay from '../components/common/ScoreDisplay.vue';
  import ProgressBar from '../components/common/ProgressBar.vue';
  import StarRating from '../components/common/StarRating.vue';
  import GameOver from '../components/common/GameOver.vue';
  import SessionStreakBar from '../components/common/SessionStreakBar.vue';

  export default {
    name: 'ManualDecompositionView',
    components: {
      ScoreDisplay,
      ProgressBar,
      StarRating,
      GameOver,
      SessionStreakBar
    },
    setup() {
      const router = useRouter();
      const scoresStore = useScoresStore();
      const settingsStore = useSettingsStore();
      const playerStore = usePlayerStore();
      const streakTracker = useChallengeStreak();
      const totalQuestions = 5;

      // Рефы для полей ввода
      const firstPartInput = ref<HTMLInputElement | null>(null);
      const secondPartInput = ref<HTMLInputElement | null>(null);
      const intermediateInput = ref<HTMLInputElement | null>(null);
      const furtherFirstInput = ref<HTMLInputElement | null>(null);
      const furtherSecondInput = ref<HTMLInputElement | null>(null);
      const furtherIntermediateInput = ref<HTMLInputElement | null>(null);
      const finalInput = ref<HTMLInputElement | null>(null);

      // Используем mobile keyboard composable
      const { keyboardHeight, isKeyboardOpen, focusWithScroll } = useMobileKeyboard();

      // Инициализируем игру
      const {
        score,
        currentQuestion,
        answered,
        selectedIndex,
        gameOver,
        currentLevel,
        progressPercent,
        currentProblem,
        correctAnswers,
        totalAnswers,
        initializeGame,
        selectAnswer,
        problems,
        setManualMode
      } = useGameLogic(totalQuestions);

      // Загружаем общий счет
      const totalScore = computed(() => scoresStore.decompositionScore);

      // Получаем максимальное число для примеров из настроек
      const maxNumber = computed(() => settingsStore.maxDecompositionNumber);

      // Определяем уровень на основе общего количества очков (как в уравнениях)
      const getLevelByScore = (score: number): number => {
        if (score >= 400) return 9;    // 400+ очков: уровень 9
        if (score >= 350) return 8;    // 350-399 очков: уровень 8
        if (score >= 300) return 7;    // 300-349 очков: уровень 7
        if (score >= 250) return 6;    // 250-299 очков: уровень 6
        if (score >= 200) return 5;    // 200-249 очков: уровень 5
        if (score >= 150) return 4;    // 150-199 очков: уровень 4
        if (score >= 100) return 3;    // 100-149 очков: уровень 3
        if (score >= 50) return 2;     // 50-99 очков: уровень 2
        return 1;                      // 0-49 очков: уровень 1
      };

      // Текущий уровень на основе общего счета
      const currentLevelByScore = computed(() => getLevelByScore(totalScore.value));

      // Определяем, нужно ли скрывать кнопку на мобильных с клавиатурой (упрощено для портретного режима)
      const isMobileWithKeyboard = computed(() => {
        console.log('🔍 CHECK isMobileWithKeyboard');

        // Определение мобильного устройства для портретного режима
        const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isPortrait = window.innerHeight >= window.innerWidth;

        // Считаем мобильным если это устройство с touch или по useragent
        const isMobile = isMobileDevice || hasTouch;

        // Высота клавиатуры должна быть значительной для портретного режима
        const hasKeyboard = keyboardHeight.value >= 150;

        // Скрываем кнопку только на мобильных в портретном режиме с открытой клавиатурой
        const shouldHide = isMobile && isPortrait && isKeyboardOpen.value && hasKeyboard;

        const debugInfo = {
          isMobileDevice,
          hasTouch,
          isMobile,
          isPortrait,
          isKeyboardOpen: isKeyboardOpen.value,
          keyboardHeight: keyboardHeight.value,
          hasKeyboard,
          shouldHide,
          'navigator.userAgent': navigator.userAgent || '',
          'window.innerHeight': window.innerHeight,
          'window.innerWidth': window.innerWidth
        };

        console.log('⌨️ isMobileWithKeyboard DEBUG:', debugInfo);

        if (shouldHide) {
          console.log('🚫 КНОПКА БУДЕТ СКРЫТА');
        } else {
          console.log('✅ КНОПКА БУДЕТ ПОКАЗАНА');
        }

        return shouldHide;
      });

      // Состояние для пошагового решения
      const step = ref(0); // 0 - начало, 1 - разложение, 2 - десятки, 3 - единицы (если нужно), 4 - финал
      const firstNumber = ref(0);
      const secondNumber = ref(0);
      const firstPart = ref('');
      const secondPart = ref('');
      const intermediateResult = ref('');
      const finalResult = ref('');

      // Для дополнительного разложения единиц
      const furtherFirstPart = ref('');
      const furtherSecondPart = ref('');
      const furtherIntermediate = ref('');

      // Флаги проверки
      const decompositionChecked = ref(false);
      const decompositionCorrect = ref(false);
      const decompositionError = ref(''); // 'tens', 'units', или ''
      const intermediateChecked = ref(false);
      const intermediateCorrect = ref(false);
      const furtherChecked = ref(false);
      const furtherCorrect = ref(false);
      const isCorrect = ref(false);
      const showHint = ref(false);

      // Правильные ответы для проверки
      const correctDecomposition = ref({
        first: 0,
        second: 0,
        needsFurtherDecomposition: false,
        furtherFirst: 0,
        furtherSecond: 0
      });
      const correctIntermediate = ref(0);
      const correctFurtherIntermediate = ref(0);
      const correctAnswer = ref(0);

      // Получаем выражение для отображения
      const getDisplayExpression = () => {
        if (!currentProblem.value) return '';
        return currentProblem.value.expression;
      };

      // Определяем, это сложение или вычитание
      const isAddition = computed(() => {
        if (!currentProblem.value) return true;
        return currentProblem.value.expression.includes('+');
      });

      // Начинаем разложение
      const startDecomposition = () => {
        const expr = currentProblem.value?.expression || '';
        const match = expr.match(/(\d+)\s*([+-])\s*(\d+)/);

        if (match) {
          firstNumber.value = parseInt(match[1] ?? '0');
          secondNumber.value = parseInt(match[3] ?? '0');
          const operation = match[2]; // '+' или '-'

          // Вычисляем правильное разложение для удобного счета
          if (operation === '+') {
            // Для сложения: проверяем, есть ли переход через десяток
            const lastDigitOfFirst = firstNumber.value % 10;
            const sum = firstNumber.value + secondNumber.value;
            const tensBefore = Math.floor(firstNumber.value / 10);
            const tensAfter = Math.floor(sum / 10);

            if (tensAfter > tensBefore && secondNumber.value <= 9) {
              // Есть переход через десяток для однозначного числа - раскладываем для дополнения до круглого
              const neededForRound = 10 - lastDigitOfFirst;

              // Проверяем, чтобы избежать нулевых компонентов
              if (neededForRound === secondNumber.value || neededForRound === 0) {
                // Число равно ровно столько, сколько нужно для дополнения - не раскладываем
                correctDecomposition.value.first = 0; // Не будем раскладывать
                correctDecomposition.value.second = secondNumber.value;
              } else {
                correctDecomposition.value.first = neededForRound;
                correctDecomposition.value.second = secondNumber.value - neededForRound;
              }
            } else {
              // Для двузначных чисел или без перехода - раскладываем на десятки и единицы
              const tens = Math.floor(secondNumber.value / 10) * 10;

              // Избегаем нулевых компонентов
              if (tens === 0) {
                correctDecomposition.value.first = 0; // Не будем раскладывать
                correctDecomposition.value.second = secondNumber.value;
              } else {
                correctDecomposition.value.first = tens;
                correctDecomposition.value.second = secondNumber.value - tens;
              }
            }

            // Промежуточный результат
            correctIntermediate.value = firstNumber.value + correctDecomposition.value.first;
            correctAnswer.value = firstNumber.value + secondNumber.value;

            // Проверяем, нужен ли дальнейший разложение единиц при сложении
            const lastDigitOfIntermediate = correctIntermediate.value % 10;
            const needsFurtherDecomposition = (lastDigitOfIntermediate + correctDecomposition.value.second) >= 10;

            correctDecomposition.value.needsFurtherDecomposition = needsFurtherDecomposition;

            // Если нужен, вычисляем как разложить единицы
            if (needsFurtherDecomposition) {
              const neededForRoundTen = 10 - lastDigitOfIntermediate;
              correctDecomposition.value.furtherFirst = neededForRoundTen;
              correctDecomposition.value.furtherSecond = correctDecomposition.value.second - neededForRoundTen;
              // Вычисляем промежуточный результат после разложения единиц
              correctFurtherIntermediate.value = correctIntermediate.value + neededForRoundTen;
            }
          } else {
            // Для вычитания: раскладываем вычитаемое число для удобного счета
            const lastDigitOfFirst = firstNumber.value % 10;

            if (lastDigitOfFirst >= secondNumber.value) {
              // Заем не нужен, раскладываем на единицы (от большего к меньшему)
              // Например: 27 - 4 → 4 = 3 + 1
              const remainder = secondNumber.value;
              const firstPart = Math.min(remainder, lastDigitOfFirst);
              const secondPart = remainder - firstPart;

              correctDecomposition.value.first = firstPart;
              correctDecomposition.value.second = secondPart;
              correctIntermediate.value = firstNumber.value - firstPart;
            } else {
              // Нужен заем, раскладываем для удобного вычитания с заемом
              correctDecomposition.value.first = lastDigitOfFirst;
              correctDecomposition.value.second = secondNumber.value - lastDigitOfFirst;
              correctIntermediate.value = firstNumber.value - lastDigitOfFirst; // получаем круглый десяток
            }

            correctAnswer.value = firstNumber.value - secondNumber.value;
          }

          // Проверяем, нужно ли разложение
          if (correctDecomposition.value.first === 0) {
            // Разложение не нужно, переходим сразу к шагу 2
            step.value = 2;
            decompositionChecked.value = true;
            decompositionCorrect.value = true;
            firstPart.value = '0';
            secondPart.value = correctDecomposition.value.second.toString();

            nextTick(() => {
              if (intermediateInput.value) {
                intermediateInput.value.focus();
              }
            });
          } else {
            step.value = 1;
            showHint.value = false;

            nextTick(() => {
              if (firstPartInput.value) {
                firstPartInput.value.focus();
              }
            });
          }
        }
      };

      // Проверяем разложение
      const checkDecomposition = () => {
        const first = parseInt(firstPart.value);
        const second = parseInt(secondPart.value);

        // Порядок важен: сначала десятки, потом единицы!
        const isCorrectTens = first === correctDecomposition.value.first;
        const isCorrectUnits = second === correctDecomposition.value.second;

        if (isCorrectTens && isCorrectUnits) {
          // Правильный ответ
          decompositionCorrect.value = true;
          decompositionError.value = '';
          decompositionChecked.value = true;

          // Автоматический переход через 2 секунды
          setTimeout(() => {
            nextStep();
          }, 2000);
        } else {
          // Неправильный ответ
          decompositionCorrect.value = false;
          decompositionChecked.value = true;

          // Проверяем, есть ли в числе десятки
          if (correctDecomposition.value.first === 0) {
            // В числе нет десятков - всегда "попробуй еще раз"
            decompositionError.value = 'units';
          } else {
            // В числе есть десятки - даем конкретную подсказку
            if (!isCorrectTens) {
              decompositionError.value = 'tens';
            } else if (!isCorrectUnits) {
              decompositionError.value = 'units';
            } else {
              decompositionError.value = 'units';
            }
          }
        }
      };

      // Обработчик ввода при разложении
      const onDecompositionInput = () => {
        // Если были ошибки, сбрасываем их при вводе новых значений
        if (decompositionChecked.value && !decompositionCorrect.value) {
          decompositionChecked.value = false;
          decompositionCorrect.value = false;
          decompositionError.value = '';
        }
      };

      // Обработчик фокуса на полях ввода
      const handleInputFocus = (inputElement: HTMLInputElement | null) => {
        if (inputElement && !inputElement.disabled) {
          focusWithScroll(inputElement, 120);
        }
      };

      // Проверяем промежуточный результат
      const checkIntermediate = () => {
        const result = parseInt(intermediateResult.value);

        // Определяем операцию
        const expr = currentProblem.value?.expression || '';
        const match = expr.match(/(\d+)\s*([+-])\s*(\d+)/);
        const operation = match ? match[2] : '+';

        // Для сложения порядок важен - используем первое слагаемое (десятки)
        // Для вычитания порядок тоже важен - используем первое слагаемое
        const first = parseInt(firstPart.value);

        if (operation === '+') {
          correctIntermediate.value = firstNumber.value + first;
        } else {
          correctIntermediate.value = firstNumber.value - first;
        }

        intermediateCorrect.value = result === correctIntermediate.value;
        intermediateChecked.value = true;

        // Автоматический переход через 1.5 секунды после верного ответа
        if (intermediateCorrect.value) {
          setTimeout(() => {
            nextStep();
          }, 1500);
        }
      };

      // Проверяем дополнительное разложение единиц
      const checkFurther = () => {
        const first = parseInt(furtherFirstPart.value);
        const second = parseInt(furtherSecondPart.value);

        // Проверяем, что разложение правильное
        if (first === correctDecomposition.value.furtherFirst && second === correctDecomposition.value.furtherSecond) {
          furtherCorrect.value = true;
          furtherChecked.value = true;

          // Автоматический переход через 1.5 секунды после верного ответа
          setTimeout(() => {
            nextStep();
          }, 1500);
        } else {
          furtherCorrect.value = false;
          furtherChecked.value = true;
        }
      };

      // Проверяем промежуточный результат после разложения единиц
      const checkFurtherIntermediate = () => {
        const result = parseInt(furtherIntermediate.value);
        furtherCorrect.value = result === correctFurtherIntermediate.value;
        furtherChecked.value = true;

        // Автоматический переход через 1.5 секунды после верного ответа
        if (furtherCorrect.value) {
          setTimeout(() => {
            nextStep();
          }, 1500);
        }
      };

      // Проверяем финальный результат
      const checkFinal = () => {
        const result = parseInt(finalResult.value);

        // Используем уже вычисленный правильный ответ
        isCorrect.value = result === correctAnswer.value;
        answered.value = true;

        if (isCorrect.value) {
          streakTracker.recordCorrect();
        } else {
          streakTracker.recordIncorrect();
        }

        // Начисляем очки

        selectAnswer(0, 0, (earnedPoints) => {
          scoresStore.updateDecompositionScore(earnedPoints);
        });

        // Сохраняем статистику
        if (isCorrect.value) {
          scoresStore.incrementManualDecompositionSolved();

          // Автоматический переход через 2 секунды после верного финального ответа
          setTimeout(() => {
            nextQuestion();
          }, 2000);
        }
        scoresStore.incrementTotalDecompositionAttempted();
      };

      // Переход к следующему шагу
      const nextStep = () => {
        step.value++;

        // Сбрасываем флаги для нового шага
        if (step.value === 2) {
          decompositionChecked.value = false;
          decompositionError.value = '';
          nextTick(() => {
            if (intermediateInput.value) {
              intermediateInput.value.focus();
            }
          });
        } else if (step.value === 3) {
          // Проверяем, нужен ли дополнительный шаг разложения
          if (isAddition.value && correctDecomposition.value.needsFurtherDecomposition) {
            // Шаг разложения единиц
            intermediateChecked.value = false;
            furtherChecked.value = false;
            // Устанавливаем значения для разложения
            furtherFirstPart.value = correctDecomposition.value.furtherFirst.toString();
            furtherSecondPart.value = correctDecomposition.value.furtherSecond.toString();
          } else {
            // Пропускаем шаг разложения, переходим сразу к финалу
            intermediateChecked.value = false;
            step.value = 4;
            nextTick(() => {
              if (finalInput.value) {
                finalInput.value.focus();
              }
            });
          }
        } else if (step.value === 4) {
          // Если было разложение, теперь нужно решить промежуточный результат
          if (isAddition.value && correctDecomposition.value.needsFurtherDecomposition && furtherChecked.value) {
            furtherChecked.value = false;
            step.value = 3.5;
          } else {
            furtherChecked.value = false;
            nextTick(() => {
              if (finalInput.value) {
                finalInput.value.focus();
              }
            });
          }
        } else if (step.value === 3.5) {
          furtherChecked.value = false;
          step.value = 4;
          nextTick(() => {
            if (finalInput.value) {
              finalInput.value.focus();
            }
          });
        } else if (step.value === 5) {
          furtherChecked.value = false;
          nextTick(() => {
            if (finalInput.value) {
              finalInput.value.focus();
            }
          });
        }
      };

      // Следующий вопрос
      const nextQuestion = () => {
        // Сбрасываем все состояния
        step.value = 0;
        firstNumber.value = 0;
        secondNumber.value = 0;
        firstPart.value = '';
        secondPart.value = '';
        intermediateResult.value = '';
        finalResult.value = '';
        furtherFirstPart.value = '';
        furtherSecondPart.value = '';
        furtherIntermediate.value = '';
        decompositionChecked.value = false;
        decompositionCorrect.value = false;
        decompositionError.value = '';
        intermediateChecked.value = false;
        intermediateCorrect.value = false;
        furtherChecked.value = false;
        furtherCorrect.value = false;
        answered.value = false;
        isCorrect.value = false;
        showHint.value = false;

        // Генерируем новую задачу
        const newProblem = generateDecompositionProblem(totalScore.value);
        currentProblem.value = newProblem;
        currentQuestion.value++;
      };

      // Перезапуск игры
      function onStreakMilestone(milestone: number) {
        const bonus = milestone >= 10 ? 10 : milestone >= 7 ? 7 : milestone >= 5 ? 5 : 3;
        playerStore.addCoins(bonus);
      }

      const restartGame = () => {
        initializeGame();
        streakTracker.reset();
        setManualMode(true);

        // Генерируем задачи с использованием максимального числа из настроек и уровня на основе очков
        const manualProblems = [];
        const level = currentLevelByScore.value;
        for (let i = 0; i < totalQuestions; i++) {
          manualProblems.push(generateDecompositionProblem(maxNumber.value, level));
        }
        problems.value = manualProblems;

        if (manualProblems.length > 0) {
          currentProblem.value = manualProblems[0] as MathProblem | EquationProblem;
        }

        // Сбрасываем состояние
        step.value = 0;
        firstNumber.value = 0;
        secondNumber.value = 0;
        firstPart.value = '';
        secondPart.value = '';
        intermediateResult.value = '';
        finalResult.value = '';
        furtherFirstPart.value = '';
        furtherSecondPart.value = '';
        furtherIntermediate.value = '';
        decompositionChecked.value = false;
        decompositionCorrect.value = false;
        decompositionError.value = '';
        intermediateChecked.value = false;
        intermediateCorrect.value = false;
        furtherChecked.value = false;
        furtherCorrect.value = false;
        answered.value = false;
        isCorrect.value = false;
        showHint.value = false;
      };

      // Переход на главную
      const goToMain = () => {
        router.push('/');
      };

      // Инициализация при монтировании
      onMounted(() => {
        scoresStore.loadScores();
        restartGame();
      });

      // Показываем подсказку через 5 секунд на шаге разложения
      const checkShowHint = () => {
        if (step.value === 1 && !decompositionChecked.value) {
          setTimeout(() => {
            if (step.value === 1 && !decompositionChecked.value) {
              showHint.value = true;
            }
          }, 5000);
        }
      };

      // Следим за изменением шага
      watch(step, checkShowHint);

      return {
        score,
        totalScore,
        currentQuestion,
        answered,
        selectedIndex,
        gameOver,
        currentLevel,
        progressPercent,
        currentProblem,
        correctAnswers,
        totalAnswers,
        totalQuestions,
        step,
        firstNumber,
        secondNumber,
        firstPart,
        secondPart,
        intermediateResult,
        finalResult,
        furtherFirstPart,
        furtherSecondPart,
        furtherIntermediate,
        decompositionChecked,
        decompositionCorrect,
        decompositionError,
        intermediateChecked,
        intermediateCorrect,
        furtherChecked,
        furtherCorrect,
        isCorrect,
        showHint,
        correctDecomposition,
        correctIntermediate,
        correctFurtherIntermediate,
        correctAnswer,
        firstPartInput,
        secondPartInput,
        intermediateInput,
        furtherFirstInput,
        furtherSecondInput,
        furtherIntermediateInput,
        finalInput,
        keyboardHeight,
        isKeyboardOpen,
        isMobileWithKeyboard,
        handleInputFocus,
        getDisplayExpression,
        isAddition,
        startDecomposition,
        checkDecomposition,
        onDecompositionInput,
        checkIntermediate,
        checkFurther,
        checkFurtherIntermediate,
        checkFinal,
        nextStep,
        nextQuestion,
        restartGame,
        goToMain,
        streakTracker,
        onStreakMilestone
      };
    }
  };
</script>

<style scoped>
  /* Mobile-first стили */
  .app-container {
    min-height: 100dvh;
    padding-bottom: env(keyboard-inset-height, 0px);
  }

  /* Мобильные устройства - полная ширина приложения */
  @media (max-width: 768px) {
    .app-container {
      width: 100vw;
      padding: 0;
      min-height: 100vh;
    }

    .game-container {
      width: 100vw;
      max-width: none;
      border-radius: 0;
      padding: 15px;
      margin: 0;
    }
  }

  @media (max-width: 480px) {
    .game-container {
      padding: 10px;
    }
  }

  .level-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .level-indicator {
    font-size: clamp(11px, 2.5vw, 14px);
    font-weight: 600;
    color: #4a5568;
  }

  .decomposition-container {
    margin: clamp(15px, 4vw, 25px) 0;
    padding: clamp(20px, 5vw, 35px);
    background-color: #f7fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    min-height: clamp(300px, 60vh, 500px);
    will-change: height;
  }

  .step-container {
    text-align: center;
    padding: 0 clamp(10px, 3vw, 20px);
  }

  .expression-large {
    font-size: clamp(24px, 6vw, 36px);
    font-weight: bold;
    color: #2d3748;
    margin-bottom: clamp(15px, 4vw, 25px);
    line-height: 1.2;
  }

  .expression-part {
    font-size: clamp(20px, 5vw, 28px);
    color: #2d3748;
    margin-bottom: clamp(12px, 3vw, 20px);
    line-height: 1.3;
  }

  .highlighted-number {
    color: #667eea;
    font-weight: bold;
    background-color: #edf2ff;
    padding: clamp(3px, 1vw, 6px) clamp(8px, 2vw, 15px);
    border-radius: 8px;
  }

  .step-hint {
    color: #718096;
    font-size: clamp(16px, 4vw, 20px);
    margin: clamp(20px, 5vw, 35px) 0;
    line-height: 1.4;
  }

  .step-instruction {
    font-size: clamp(16px, 4vw, 20px);
    color: #4a5568;
    margin: clamp(15px, 4vw, 25px) 0;
    padding: clamp(12px, 3vw, 20px);
    background-color: #fff;
    border-radius: 12px;
    border-left: 4px solid #667eea;
    line-height: 1.4;
  }

  .start-button {
    padding: clamp(12px, 3vw, 20px) clamp(24px, 6vw, 40px);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: clamp(16px, 4vw, 20px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    touch-action: manipulation;
    min-height: 48px;
  }

  .start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  .decomposition-input,
  .calculation-input {
    font-size: clamp(18px, 5vw, 26px);
    color: #2d3748;
    margin: clamp(15px, 4vw, 25px) 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2vw, 15px);
    flex-wrap: wrap;
  }

  /* Мобильные устройства - полная ширина для calculation-input */
  .calculation-input {
    width: 100%;
    min-width: 100%;
    flex-wrap: nowrap;
  }

  .number-input {
    width: clamp(70px, 20vw, 120px);
    min-height: 48px;
    padding: clamp(8px, 2vw, 15px);
    font-size: clamp(18px, 4.5vw, 24px);
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
    background-color: white;
    -webkit-appearance: none;
    -moz-appearance: textfield;
  }

  .number-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: scale(1.02);
  }

  .number-input:disabled {
    background-color: #edf2f7;
    color: #4a5568;
    border-color: #cbd5e0;
    transform: none;
  }

  .check-button {
    padding: clamp(10px, 2.5vw, 16px) clamp(20px, 5vw, 35px);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: clamp(14px, 3.5vw, 18px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
    margin: clamp(8px, 2vw, 15px) 0;
    touch-action: manipulation;
    min-height: 48px;
  }

  .check-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
  }

  .check-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint-box {
    margin-top: clamp(15px, 4vw, 25px);
    padding: clamp(12px, 3vw, 20px);
    background-color: #fef5e7;
    border: 1px solid #f9e79f;
    border-radius: 8px;
    color: #7d6608;
    font-size: clamp(14px, 3.5vw, 16px);
    line-height: 1.4;
  }

  .feedback-box {
    margin-top: clamp(15px, 4vw, 25px);
    padding: clamp(12px, 3vw, 20px);
    border-radius: 8px;
  }

  .correct-feedback {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    line-height: 1.4;
  }

  .incorrect-feedback {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    line-height: 1.4;
  }

  .hint-feedback {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    line-height: 1.4;
  }

  .retry-feedback {
    background-color: #d1ecf1;
    border: 1px solid #bee5eb;
    color: #0c5460;
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    line-height: 1.4;
  }

  .auto-retry-hint {
    margin-top: clamp(8px, 2vw, 12px);
    font-size: clamp(12px, 3vw, 14px);
    font-weight: 400;
    color: #6c757d;
    font-style: italic;
  }

  .next-button {
    margin-top: clamp(10px, 2.5vw, 18px);
    padding: clamp(8px, 2vw, 14px) clamp(16px, 4vw, 28px);
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    touch-action: manipulation;
    min-height: 44px;
  }

  .next-button:hover {
    background: #2d3748;
  }

  .steps-progress {
    display: flex;
    justify-content: center;
    gap: clamp(10px, 2.5vw, 20px);
    margin-top: clamp(20px, 5vw, 35px);
  }

  .step-dot {
    width: clamp(10px, 2.5vw, 14px);
    height: clamp(10px, 2.5vw, 14px);
    border-radius: 50%;
    background-color: #e2e8f0;
    transition: all 0.3s ease;
  }

  .step-dot.active {
    background-color: #667eea;
    transform: scale(1.3);
  }

  .step-dot.completed {
    background-color: #48bb78;
  }

  /* Таблеты (min-width: 768px) */
  @media (min-width: 768px) {
    .decomposition-container {
      padding: clamp(25px, 4vw, 40px);
      border-radius: 16px;
    }

    .decomposition-input,
    .calculation-input {
      flex-wrap: nowrap;
    }

    .calculation-input {
      width: auto;
      min-width: auto;
      max-width: 500px;
    }

    .number-input {
      width: 100px;
    }
  }

  /* Десктоп (min-width: 1024px) */
  @media (min-width: 1024px) {
    .app-container {
      padding-bottom: 0;
    }

    .decomposition-container {
      min-height: 450px;
    }

    .expression-large {
      font-size: 36px;
    }

    .expression-part {
      font-size: 28px;
    }

    .step-instruction {
      font-size: 20px;
    }

    .number-input {
      width: 100px;
      font-size: 22px;
    }

    .check-button {
      font-size: 16px;
    }

    .next-button {
      font-size: 16px;
    }

    /* Десктоп - фиксированная ширина для calculation-input */
    .calculation-input {
      width: auto;
      min-width: auto;
      max-width: 600px;
      flex-wrap: nowrap;
    }
  }

  /* Очень маленькие экраны (max-width: 360px) */
  @media (max-width: 360px) {
    .level-info {
      display: none;
    }

    .decomposition-input,
    .calculation-input {
      font-size: 16px;
    }

    .number-input {
      width: 60px;
      font-size: 16px;
    }
  }

  /* Оптимизации для мобильных браузеров */
  @supports (-webkit-touch-callout: none) {
    .number-input {
      -webkit-appearance: none;
      border-radius: 8px;
    }
  }

  /* Предотвращение зума на iOS при фокусе на input */
  @supports (-webkit-appearance: none) {
    .number-input {
      font-size: 16px !important;
    }
  }
</style>
