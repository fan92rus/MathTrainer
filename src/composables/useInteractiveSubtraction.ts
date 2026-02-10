import { ref, computed, type Ref, type ComputedRef } from 'vue';

/**
 * Этапы интерактивного вычитания
 */
export enum InteractiveStep {
  /** Начальное состояние — показать задачу */
  INTRO = 'intro',
  /** Занять десяток (если нужно) */
  BORROW = 'borrow',
  /** Вычесть единицы */
  SUBTRACT_UNITS = 'units',
  /** Вычесть десятки */
  SUBTRACT_TENS = 'tens',
  /** Завершено — показать результат */
  COMPLETE = 'complete'
}

/**
 * Состояние одного этапа интерактивного вычитания
 */
export interface InteractiveState {
  /** Текущий этап */
  step: InteractiveStep;
  /** Объяснение для этапа */
  explanation: string;
  /** Короткая инструкция-действие */
  instruction: string;
  /** Можно ли перейти к следующему этапу */
  canProceed: boolean;
  /** Ответ ученика на единицах */
  unitsAnswer?: number;
  /** Ответ ученика на десятках */
  tensAnswer?: number;
  /** Правильность ответа на единицах */
  unitsCorrect?: boolean;
  /** Правильность ответа на десятках */
  tensCorrect?: boolean;
  /** Количество ошибок */
  errorCount: number;
  /** Показывать подсказку */
  showHint: boolean;
  /** Текст подсказки */
  hintText?: string;
}

/**
 * API для управления интерактивным вычитанием
 */
export interface InteractiveSubtractionAPI {
  /** Текущий этап */
  currentStep: Ref<InteractiveStep>;
  /** Состояние текущего этапа */
  currentState: ComputedRef<InteractiveState>;
  /** Все этапы по порядку */
  allSteps: InteractiveStep[];
  /** Можно перейти вперёд */
  canGoNext: ComputedRef<boolean>;
  /** Можно перейти назад */
  canGoPrev: ComputedRef<boolean>;
  /** Требуется ли заимствование */
  needsBorrowing: ComputedRef<boolean>;
  /** Правильный ответ на единицах */
  correctUnits: ComputedRef<number>;
  /** Правильный ответ на десятках */
  correctTens: ComputedRef<number>;
  /** Финальный ответ */
  finalResult: ComputedRef<number>;
  /** Выполнить заимствование */
  performBorrow: () => void;
  /** Подтвердить вычитание единиц */
  submitUnits: (answer: number) => boolean;
  /** Подтвердить вычитание десятков */
  submitTens: (answer: number) => boolean;
  /** Переход к следующему этапу */
  nextStep: () => void;
  /** Сброс к начальному состоянию */
  reset: () => void;
}

/**
 * Composable для интерактивного вычитания в столбик
 *
 * @param minuend - Уменьшаемое (верхнее число)
 * @param subtrahend - Вычитаемое (нижнее число)
 * @returns API для управления интерактивным вычитанием
 */
export function useInteractiveSubtraction(
  minuend: number,
  subtrahend: number
): InteractiveSubtractionAPI {
  // Разбиваем числа на разряды
  const minuendTens = Math.floor(minuend / 10);
  const minuendUnits = minuend % 10;
  const subtrahendTens = Math.floor(subtrahend / 10);
  const subtrahendUnits = subtrahend % 10;
  const result = minuend - subtrahend;
  const resultTens = Math.floor(result / 10);
  const resultUnits = result % 10;

  // Начинаем сразу с нужного шага (BORROW если нужно заимствование, иначе SUBTRACT_UNITS)
  const needsBorrowingInit = minuendUnits < subtrahendUnits;

  const currentStep = ref<InteractiveStep>(
    needsBorrowingInit ? InteractiveStep.BORROW : InteractiveStep.SUBTRACT_UNITS
  );
  const errorCount = ref(0);
  const showHint = ref(false);

  const unitsAnswer = ref<number | undefined>();
  const tensAnswer = ref<number | undefined>();
  const unitsCorrect = ref<boolean | undefined>();
  const tensCorrect = ref<boolean | undefined>();

  // Проверяем, требуется ли заимствование
  const needsBorrowing = computed(() => minuendUnits < subtrahendUnits);

  // Правильные ответы
  const correctUnits = computed(() => {
    if (needsBorrowing.value) {
      return minuendUnits + 10 - subtrahendUnits;
    }
    return minuendUnits - subtrahendUnits;
  });

  const correctTens = computed(() => {
    if (needsBorrowing.value) {
      return minuendTens - 1 - subtrahendTens;
    }
    return minuendTens - subtrahendTens;
  });

  const finalResult = computed(() => result);

  // Все этапы по порядку (зависит от необходимости заимствования)
  const allSteps = computed<InteractiveStep[]>(() => {
    if (needsBorrowing.value) {
      return [
        InteractiveStep.BORROW,
        InteractiveStep.SUBTRACT_UNITS,
        InteractiveStep.SUBTRACT_TENS
      ];
    }
    return [
      InteractiveStep.SUBTRACT_UNITS,
      InteractiveStep.SUBTRACT_TENS
    ];
  });

  // Состояние текущего этапа
  const currentState = computed<InteractiveState>(() => {
    const step = currentStep.value;

    switch (step) {
      case InteractiveStep.BORROW:
        return {
          step,
          explanation: `Смотрим единицы: ${minuendUnits} − ${subtrahendUnits}. Нельзя!`,
          instruction: `Нажми на десяток (${minuendTens}), чтобы занять один`,
          canProceed: false, // Сначала нужно выполнить заимствование
          errorCount: errorCount.value,
          showHint: false
        };

      case InteractiveStep.SUBTRACT_UNITS:
        const unitsText = needsBorrowing.value
          ? `${minuendUnits + 10} − ${subtrahendUnits}`
          : `${minuendUnits} − ${subtrahendUnits}`;

        return {
          step,
          explanation: `Теперь вычитаем единицы: ${unitsText}`,
          instruction: `Сколько получится? Введи число:`,
          canProceed: unitsCorrect.value === true,
          unitsAnswer: unitsAnswer.value,
          unitsCorrect: unitsCorrect.value,
          errorCount: errorCount.value,
          showHint: showHint.value && unitsCorrect.value === false,
          hintText: `Подсказка: ${unitsText} = ${correctUnits.value}`
        };

      case InteractiveStep.SUBTRACT_TENS:
        const tensText = needsBorrowing.value
          ? `${minuendTens - 1} − ${subtrahendTens}`
          : `${minuendTens} − ${subtrahendTens}`;

        return {
          step,
          explanation: `Вычитаем десятки: ${tensText}`,
          instruction: `Сколько получится? Введи число:`,
          canProceed: tensCorrect.value === true,
          tensAnswer: tensAnswer.value,
          tensCorrect: tensCorrect.value,
          errorCount: errorCount.value,
          showHint: showHint.value && tensCorrect.value === false,
          hintText: `Подсказка: ${tensText} = ${correctTens.value}`
        };

      default:
        return {
          step: InteractiveStep.SUBTRACT_UNITS,
          explanation: '',
          instruction: '',
          canProceed: true,
          errorCount: 0,
          showHint: false
        };
    }
  });

  const canGoNext = computed(() => {
    return currentState.value.canProceed;
  });

  const canGoPrev = computed(() => {
    const currentIndex = allSteps.value.indexOf(currentStep.value);
    return currentIndex > 0;
  });

  // Выполнить заимствование (прямой переход минуя canGoNext проверку)
  function performBorrow(): void {
    if (currentStep.value === InteractiveStep.BORROW) {
      const currentIndex = allSteps.value.indexOf(currentStep.value);
      if (currentIndex < allSteps.value.length - 1) {
        currentStep.value = allSteps.value[currentIndex + 1];
      }
    }
  }

  // Подтвердить вычитание единиц
  function submitUnits(answer: number): boolean {
    unitsAnswer.value = answer;
    const isCorrect = answer === correctUnits.value;

    if (isCorrect) {
      unitsCorrect.value = true;
      return true;
    }

    unitsCorrect.value = false;
    errorCount.value++;

    // После второй ошибки показываем подсказку
    if (errorCount.value >= 2) {
      showHint.value = true;
    }

    return false;
  }

  // Подтвердить вычитание десятков
  function submitTens(answer: number): boolean {
    tensAnswer.value = answer;
    const isCorrect = answer === correctTens.value;

    if (isCorrect) {
      tensCorrect.value = true;
      return true;
    }

    tensCorrect.value = false;
    errorCount.value++;

    if (errorCount.value >= 2) {
      showHint.value = true;
    }

    return false;
  }

  // Переход к следующему этапу
  function nextStep(): void {
    if (!canGoNext.value) return;

    const currentIndex = allSteps.value.indexOf(currentStep.value);
    if (currentIndex < allSteps.value.length - 1) {
      currentStep.value = allSteps.value[currentIndex + 1];
    }
  }

  // Сброс
  function reset(): void {
    currentStep.value = needsBorrowing.value ? InteractiveStep.BORROW : InteractiveStep.SUBTRACT_UNITS;
    errorCount.value = 0;
    showHint.value = false;
    unitsAnswer.value = undefined;
    tensAnswer.value = undefined;
    unitsCorrect.value = undefined;
    tensCorrect.value = undefined;
  }

  return {
    currentStep,
    currentState,
    allSteps: allSteps.value,
    canGoNext,
    canGoPrev,
    needsBorrowing,
    correctUnits,
    correctTens,
    finalResult,
    performBorrow,
    submitUnits,
    submitTens,
    nextStep,
    reset
  };
}
