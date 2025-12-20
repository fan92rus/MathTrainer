import { ref, computed, type Ref } from 'vue';
import type { MathProblem, EquationProblem, GameResult } from '@/types';
import { calculateExercisePoints } from '@/utils/gradeHelpers';

// Тип для функции-генератора задач
type ProblemGenerator = (previousX?: number | null) => MathProblem | EquationProblem;

// Тип для колбэка при правильном ответе
 
type OnCorrectCallback = (_points: number) => void;

export interface UseGameLogic {
  // Состояние
  score: Ref<number>;
  currentQuestion: Ref<number>;
  answered: Ref<boolean>;
  selectedIndex: Ref<number | null>;
  gameOver: Ref<boolean>;
  currentLevel: Ref<number>;
  problems: Ref<(MathProblem | EquationProblem)[]>;
  correctAnswers: Ref<number>;
  totalAnswers: Ref<number>;
  errorsPerQuestion: Ref<number[]>;
  manualMode: Ref<boolean>;

  // Вычисляемые свойства
  progressPercent: Ref<number>;
  currentProblem: Ref<MathProblem | EquationProblem | null>;

  // Методы
  initializeGame: () => void;

  selectAnswer: (_index: number, _correctIndex: number, _onCorrect?: OnCorrectCallback) => void;
  nextQuestion: () => void;

  addProblem: (_problem: MathProblem) => void;

  generateAllProblems: (_generator: ProblemGenerator) => void;
  getGameResult: () => GameResult;

  setManualMode: (_enabled: boolean) => void;
}

export function useGameLogic(totalQuestions: number = 10): UseGameLogic {
  // Состояние игры
  const score = ref<number>(0);
  const currentQuestion = ref<number>(0);
  const answered = ref<boolean>(false);
  const selectedIndex = ref<number | null>(null);
  const gameOver = ref<boolean>(false);
  const currentLevel = ref<number>(1);
  const problems = ref<(MathProblem | EquationProblem)[]>([]);
  const correctAnswers = ref<number>(0);
  const totalAnswers = ref<number>(0);
  const errorsPerQuestion = ref<number[]>([]); // Массив для хранения количества ошибок по каждому вопросу
  const manualMode = ref<boolean>(false); // Флаг ручного режима решения

  // Вычисляемые свойства
  const progressPercent = computed<number>(() => {
    return (currentQuestion.value / totalQuestions) * 100;
  });

  const currentProblem = computed<MathProblem | EquationProblem | null>(() => {
    return problems.value[currentQuestion.value] || null;
  });

  // Методы
  const initializeGame = (): void => {
    score.value = 0;
    currentQuestion.value = 0;
    answered.value = false;
    selectedIndex.value = null;
    gameOver.value = false;
    currentLevel.value = 1;
    problems.value = [];
    correctAnswers.value = 0;
    totalAnswers.value = 0;
    errorsPerQuestion.value = [];
  };

  const selectAnswer = (
    index: number,
    correctIndex: number,
    onCorrect?: OnCorrectCallback
  ): void => {
    // Блокируем, если уже выбран правильный ответ
    if (answered.value && selectedIndex.value === correctIndex) return;

    // Считаем общий ответ только при первом выборе
    if (!answered.value) {
      totalAnswers.value++;
      // Инициализируем счетчик ошибок для текущего вопроса
      if (errorsPerQuestion.value.length <= currentQuestion.value) {
        errorsPerQuestion.value[currentQuestion.value] = 0;
      }
    }

    selectedIndex.value = index;

    // Если ответ правильный
    if (index === correctIndex) {
      answered.value = true;
      // Начисляем очки в зависимости от количества ошибок
      // Важно: используем текущее количество ошибок до увеличения счетчика
      const errors = errorsPerQuestion.value[currentQuestion.value] || 0;
      const points = calculateExercisePoints(errors);
      console.log(
        `Правильный ответ! Вопрос ${currentQuestion.value}, ошибок: ${errors}, очков: ${points}`
      );
      score.value += points;
      correctAnswers.value++;
      if (onCorrect) onCorrect(points); // Передаем количество очков в колбэк

      // Автоматический переход к следующему вопросу через 4 секунды (чтобы показать пошаговое решение)
      setTimeout(() => {
        nextQuestion();
      }, 4000);
    }
    // Если ответ неправильный, увеличиваем счетчик ошибок
    else {
      if (errorsPerQuestion.value[currentQuestion.value] === undefined) {
        errorsPerQuestion.value[currentQuestion.value] = 0;
      }
      errorsPerQuestion.value[currentQuestion.value]++;
      console.log(
        `Неправильный ответ! Вопрос ${currentQuestion.value}, всего ошибок: ${errorsPerQuestion.value[currentQuestion.value]}`
      );
    }
  };

  const nextQuestion = (): void => {
    currentQuestion.value++;
    answered.value = false;
    selectedIndex.value = null;

    if (currentQuestion.value >= totalQuestions) {
      gameOver.value = true;
    } else {
      // Увеличиваем уровень каждые 3 вопроса
      if (currentQuestion.value % 3 === 0) {
        currentLevel.value++;
      }
    }
  };

  const addProblem = (problem: MathProblem | EquationProblem): void => {
    problems.value.push(problem);
  };

  const generateAllProblems = (generator: ProblemGenerator): void => {
    let previousX: number | null = null;

    for (let i = 0; i < totalQuestions; i++) {
      // Передаем предыдущее значение X в генератор
      const problem = generator(previousX);
      addProblem(problem);

      // Обновляем предыдущее значение X для следующей итерации
      previousX = ('xValue' in problem) ? (problem as EquationProblem).xValue : null;
    }
  };

  const getGameResult = (): GameResult => {
    return {
      score: score.value,
      totalScore: score.value, // Временное решение, пока не реализовано накопление очков
      correctAnswers: correctAnswers.value,
      totalAnswers: totalAnswers.value,
      timeSpent: 0, // Будет вычисляться вне композабла
      averageTime: 0, // Будет вычисляться вне композабла
      achievements: []
    };
  };

  const setManualMode = (enabled: boolean): void => {
    manualMode.value = enabled;
  };

  return {
    // Состояние
    score,
    currentQuestion,
    answered,
    selectedIndex,
    gameOver,
    currentLevel,
    problems,
    correctAnswers,
    totalAnswers,
    errorsPerQuestion,
    manualMode,

    // Вычисляемые свойства
    progressPercent,
    currentProblem,

    // Методы
    initializeGame,
    selectAnswer,
    nextQuestion,
    addProblem,
    generateAllProblems,
    getGameResult,
    setManualMode
  };
}

// Композабл для управления таймером
export function useGameTimer() {
  const startTime = ref<number>(0);
  const elapsedTime = ref<number>(0);
  const isRunning = ref<boolean>(false);
  let intervalId: number | null = null;

  const start = (): void => {
    if (!isRunning.value) {
      startTime.value = Date.now();
      isRunning.value = true;
      intervalId = window.setInterval(() => {
        elapsedTime.value = Date.now() - startTime.value;
      }, 100); // Обновляем каждые 100мс для более точного подсчета
    }
  };

  const stop = (): number => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning.value = false;
    return elapsedTime.value;
  };

  const reset = (): void => {
    stop();
    elapsedTime.value = 0;
    startTime.value = 0;
  };

  const getTimeInSeconds = (): number => {
    return Math.floor(elapsedTime.value / 1000);
  };

  const getFormattedTime = (): string => {
    const seconds = getTimeInSeconds();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    startTime: readonly(startTime),
    elapsedTime: readonly(elapsedTime),
    isRunning: readonly(isRunning),
    start,
    stop,
    reset,
    getTimeInSeconds,
    getFormattedTime
  };
}

// Композабл для управления звуками
export interface UseSoundOptions {
  enabled: boolean;
  volume: number; // от 0 до 1
}

export function useSound(options: Partial<UseSoundOptions> = {}) {
  const soundOptions: UseSoundOptions = {
    enabled: true,
    volume: 0.5,
    ...options
  };

  const playSound = (type: 'correct' | 'incorrect' | 'complete'): void => {
    if (!soundOptions.enabled) return;

    // Создаем аудио контекст для генерации звуков
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = soundOptions.volume;

    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        break;
      case 'incorrect':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.3); // C6
        break;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const toggleSound = (): void => {
    soundOptions.enabled = !soundOptions.enabled;
  };

  const setVolume = (volume: number): void => {
    soundOptions.volume = Math.max(0, Math.min(1, volume));
  };

  return {
    playSound,
    toggleSound,
    setVolume,
    isEnabled: () => soundOptions.enabled,
    getVolume: () => soundOptions.volume
  };
}

// Вспомогательная функция для создания readonly ref
function readonly<T>(ref: Ref<T>): Readonly<Ref<T>> {
  return ref as Readonly<Ref<T>>;
}
