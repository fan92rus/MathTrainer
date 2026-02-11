import { ref, computed, type Ref, type ComputedRef } from 'vue';

/**
 * Шаги анимации вычитания в столбик
 */
export enum AnimationStep {
  /** Начальное состояние */
  INITIAL = 0,
  /** Подсветка проблемы */
  HIGHLIGHT_PROBLEM = 1,
  /** Показ заимствования */
  SHOW_BORROWING = 2,
  /** Вычитание единиц */
  SUBTRACT_UNITS = 3,
  /** Вычитание десятков */
  SUBTRACT_TENS = 4,
  /** Завершено */
  COMPLETED = 5
}

/**
 * Состояние одного шага анимации
 */
export interface StepState {
  /** Номер шага */
  step: AnimationStep;
  /** Текст объяснения */
  explanation: string;
  /** Подсвечиваемые разряды */
  highlightedDigits: ('tens' | 'units')[];
  /** Показывать точку заимствования */
  borrowDotVisible: boolean;
  /** Зачёркнуть десятки в уменьшаемом */
  crossedOutMinuendTens: boolean;
  /** Зачёркнуть десятки в вычитаемом */
  crossedOutSubtrahendTens: boolean;
  /** Изменённое значение единиц (при заимствовании) */
  unitsDigitValue: number;
  /** Значение десятков для отображения */
  tensDigitValue: number;
  /** Результат единиц */
  resultUnits: number | null;
  /** Результат десятков */
  resultTens: number | null;
}

/**
 * API для управления анимацией вычитания
 */
export interface SubtractionAnimationAPI {
  /** Текущий шаг */
  currentStep: Ref<AnimationStep>;
  /** Общее количество шагов */
  totalSteps: ComputedRef<number>;
  /** Состояние текущего шага */
  currentStepState: ComputedRef<StepState>;
  /** Все шаги */
  steps: ComputedRef<StepState[]>;
  /** Можно перейти вперёд */
  canGoNext: ComputedRef<boolean>;
  /** Можно перейти назад */
  canGoPrev: ComputedRef<boolean>;
  /** Требуется ли заимствование */
  needsBorrowing: ComputedRef<boolean>;
  /** Переход к следующему шагу */
  nextStep: () => void;
  /** Переход к предыдущему шагу */
  prevStep: () => void;
  /** Переход к конкретному шагу */
  goToStep: (step: AnimationStep) => void;
  /** Сброс к начальному состоянию */
  reset: () => void;
}

/**
 * Composable для пошаговой анимации вычитания в столбик
 *
 * @param minuend - Уменьшаемое (верхнее число)
 * @param subtrahend - Вычитаемое (нижнее число)
 * @returns API для управления анимацией
 */
export function useSubtractionAnimation(
  minuend: number,
  subtrahend: number
): SubtractionAnimationAPI {
  const currentStep = ref<AnimationStep>(AnimationStep.INITIAL);

  // Разбиваем числа на разряды
  const minuendTens = Math.floor(minuend / 10);
  const minuendUnits = minuend % 10;
  const subtrahendTens = Math.floor(subtrahend / 10);
  const subtrahendUnits = subtrahend % 10;
  const result = minuend - subtrahend;
  const resultTens = Math.floor(result / 10);
  const resultUnits = result % 10;

  // Проверяем, требуется ли заимствование
  const needsBorrowing = computed(() => minuendUnits < subtrahendUnits);

  // Генерируем шаги анимации
  const steps = computed<StepState[]>(() => {
    if (needsBorrowing.value) {
      // Случай с заимствованием
      return [
        {
          step: AnimationStep.INITIAL,
          explanation: `Реши пример: ${minuend} − ${subtrahend}`,
          highlightedDigits: [],
          borrowDotVisible: false,
          crossedOutMinuendTens: false,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits,
          tensDigitValue: minuendTens,
          resultUnits: null,
          resultTens: null
        },
        {
          step: AnimationStep.HIGHLIGHT_PROBLEM,
          explanation: `Смотрим единицы: ${minuendUnits} − ${subtrahendUnits}. Из ${minuendUnits} вычесть ${subtrahendUnits} нельзя!`,
          highlightedDigits: ['units'],
          borrowDotVisible: false,
          crossedOutMinuendTens: false,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits,
          tensDigitValue: minuendTens,
          resultUnits: null,
          resultTens: null
        },
        {
          step: AnimationStep.SHOW_BORROWING,
          explanation: `Занимаем один десяток. ${minuendTens} десятка − 1 = ${minuendTens - 1} десяток осталось`,
          highlightedDigits: ['tens'],
          borrowDotVisible: true,
          crossedOutMinuendTens: true,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits + 10,
          tensDigitValue: minuendTens,
          resultUnits: null,
          resultTens: null
        },
        {
          step: AnimationStep.SUBTRACT_UNITS,
          explanation: `${minuendUnits + 10} − ${subtrahendUnits} = ${resultUnits}`,
          highlightedDigits: ['units'],
          borrowDotVisible: true,
          crossedOutMinuendTens: true,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits + 10,
          tensDigitValue: minuendTens,
          resultUnits: resultUnits,
          resultTens: null
        },
        {
          step: AnimationStep.SUBTRACT_TENS,
          explanation: `${minuendTens - 1} − ${subtrahendTens} = ${resultTens}. Ответ: ${result}!`,
          highlightedDigits: ['tens'],
          borrowDotVisible: true,
          crossedOutMinuendTens: true,
          crossedOutSubtrahendTens: true,
          unitsDigitValue: minuendUnits + 10,
          tensDigitValue: minuendTens,
          resultUnits: resultUnits,
          resultTens: resultTens
        }
      ];
    } else {
      // Случай без заимствования
      return [
        {
          step: AnimationStep.INITIAL,
          explanation: `Реши пример: ${minuend} − ${subtrahend}`,
          highlightedDigits: [],
          borrowDotVisible: false,
          crossedOutMinuendTens: false,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits,
          tensDigitValue: minuendTens,
          resultUnits: null,
          resultTens: null
        },
        {
          step: AnimationStep.HIGHLIGHT_PROBLEM,
          explanation: `Начинаем с единиц: ${minuendUnits} − ${subtrahendUnits} = ${resultUnits}`,
          highlightedDigits: ['units'],
          borrowDotVisible: false,
          crossedOutMinuendTens: false,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits,
          tensDigitValue: minuendTens,
          resultUnits: resultUnits,
          resultTens: null
        },
        {
          step: AnimationStep.SUBTRACT_TENS,
          explanation: `Теперь десятки: ${minuendTens} − ${subtrahendTens} = ${resultTens}. Ответ: ${result}!`,
          highlightedDigits: ['tens'],
          borrowDotVisible: false,
          crossedOutMinuendTens: false,
          crossedOutSubtrahendTens: false,
          unitsDigitValue: minuendUnits,
          tensDigitValue: minuendTens,
          resultUnits: resultUnits,
          resultTens: resultTens
        }
      ];
    }
  });

  const currentStepState = computed<StepState>(() => {
    const step = currentStep.value;
    return steps.value[step] ?? steps.value[0]!;
  });

  const totalSteps = computed(() => steps.value.length - 1);

  const canGoNext = computed(() => {
    return currentStep.value < totalSteps.value;
  });

  const canGoPrev = computed(() => {
    return currentStep.value > AnimationStep.INITIAL;
  });

  function nextStep(): void {
    if (canGoNext.value) {
      currentStep.value++;
    }
  }

  function prevStep(): void {
    if (canGoPrev.value) {
      currentStep.value--;
    }
  }

  function goToStep(step: AnimationStep): void {
    if (step >= AnimationStep.INITIAL && step <= totalSteps.value) {
      currentStep.value = step;
    }
  }

  function reset(): void {
    currentStep.value = AnimationStep.INITIAL;
  }

  return {
    currentStep,
    totalSteps,
    currentStepState,
    steps,
    canGoNext,
    canGoPrev,
    needsBorrowing,
    nextStep,
    prevStep,
    goToStep,
    reset
  };
}
