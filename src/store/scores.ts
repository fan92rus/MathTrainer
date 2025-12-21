import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';

// Интерфейс для состояния хранилища очков
export interface ScoresState {
  countingScore: number;
  decompositionScore: number;
  firstGradeDecompositionScore: number;
  multiplicationScore: number;
  equationsScore: number;
  currentMultiplicationLevel: number;
  manualEquationsSolved: number;
  totalEquationsAttempted: number;
  manualDecompositionSolved: number;
  totalDecompositionAttempted: number;
}

// Интерфейс для всех очков
export interface AllScores {
  countingScore: number;
  decompositionScore: number;
  firstGradeDecompositionScore: number;
  multiplicationScore: number;
  equationsScore: number;
}

export const useScoresStore = defineStore('scores', {
  state: (): ScoresState => ({
    countingScore: 0,
    decompositionScore: 0,
    firstGradeDecompositionScore: 0,
    multiplicationScore: 0,
    equationsScore: 0,
    currentMultiplicationLevel: 2, // Текущий открытый уровень таблицы умножения
    manualEquationsSolved: 0, // Количество решенных уравнений в ручном режиме
    totalEquationsAttempted: 0, // Общее количество попыток решения уравнений
    manualDecompositionSolved: 0, // Количество решенных разложений в ручном режиме
    totalDecompositionAttempted: 0 // Общее количество попыток разложения
  }),

  getters: {
    getTotalScore: (state): number =>
      state.countingScore +
      state.decompositionScore +
      state.firstGradeDecompositionScore +
      state.multiplicationScore +
      state.equationsScore,

    getEquationsScore: (state): number => state.equationsScore,

    getManualEquationsSolved: (state): number => state.manualEquationsSolved,

    getTotalEquationsAttempted: (state): number => state.totalEquationsAttempted,

    getManualDecompositionSolved: (state): number => state.manualDecompositionSolved,

    getTotalDecompositionAttempted: (state): number => state.totalDecompositionAttempted,

    getAllScores: (state): AllScores => ({
      countingScore: state.countingScore,
      decompositionScore: state.decompositionScore,
      firstGradeDecompositionScore: state.firstGradeDecompositionScore,
      multiplicationScore: state.multiplicationScore,
      equationsScore: state.equationsScore
    })
  },

  actions: {
    loadScores(): void {
      const { getItem } = useStorage();

      const countingSaved = getItem('countingTrainerTotalScore');
      if (countingSaved !== null) {
        const parsedScore = parseInt(countingSaved, 10);
        if (isNaN(parsedScore) || parsedScore < 0) {
          this.countingScore = 0;
          this.saveCountingScore();
        } else {
          this.countingScore = parsedScore;
        }
      }

      const decompositionSaved = getItem('mathTrainerTotalScore');
      if (decompositionSaved !== null) {
        const parsedScore = parseInt(decompositionSaved, 10);
        if (isNaN(parsedScore) || parsedScore < 0) {
          this.decompositionScore = 0;
          this.saveDecompositionScore();
        } else {
          this.decompositionScore = parsedScore;
        }
      }

      const firstGradeDecompositionSaved = getItem('firstGradeDecompositionScore');
      if (firstGradeDecompositionSaved !== null) {
        const parsedScore = parseInt(firstGradeDecompositionSaved, 10);
        if (isNaN(parsedScore) || parsedScore < 0) {
          this.firstGradeDecompositionScore = 0;
          this.saveFirstGradeDecompositionScore();
        } else {
          this.firstGradeDecompositionScore = parsedScore;
        }
      }

      const multiplicationSaved = getItem('multiplicationScore');
      if (multiplicationSaved !== null) {
        const parsedScore = parseInt(multiplicationSaved, 10);
        if (isNaN(parsedScore) || parsedScore < 0) {
          this.multiplicationScore = 0;
          this.saveMultiplicationScore();
        } else {
          this.multiplicationScore = parsedScore;
        }
      }

      const equationsSaved = getItem('equationsScore');
      if (equationsSaved !== null) {
        const parsedScore = parseInt(equationsSaved, 10);
        // Миграция: исправляем NaN и некорректные значения
        if (isNaN(parsedScore) || parsedScore < 0) {
          this.equationsScore = 0;
          // Сохраняем исправленное значение
          this.saveEquationsScore();
        } else {
          this.equationsScore = parsedScore;
        }
      }

      const currentLevelSaved = getItem('currentMultiplicationLevel');
      if (currentLevelSaved !== null) {
        const parsedLevel = parseInt(currentLevelSaved, 10);
        if (isNaN(parsedLevel) || parsedLevel < 1) {
          this.currentMultiplicationLevel = 2;
          this.saveCurrentMultiplicationLevel();
        } else {
          this.currentMultiplicationLevel = parsedLevel;
        }
      }

      const manualEquationsSaved = getItem('manualEquationsSolved');
      if (manualEquationsSaved !== null) {
        const parsedCount = parseInt(manualEquationsSaved, 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
          this.manualEquationsSolved = 0;
          this.saveManualEquationsSolved();
        } else {
          this.manualEquationsSolved = parsedCount;
        }
      }

      const totalEquationsSaved = getItem('totalEquationsAttempted');
      if (totalEquationsSaved !== null) {
        const parsedCount = parseInt(totalEquationsSaved, 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
          this.totalEquationsAttempted = 0;
          this.saveTotalEquationsAttempted();
        } else {
          this.totalEquationsAttempted = parsedCount;
        }
      }

      const manualDecompositionSaved = getItem('manualDecompositionSolved');
      if (manualDecompositionSaved !== null) {
        const parsedCount = parseInt(manualDecompositionSaved, 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
          this.manualDecompositionSolved = 0;
          this.saveManualDecompositionSolved();
        } else {
          this.manualDecompositionSolved = parsedCount;
        }
      }

      const totalDecompositionSaved = getItem('totalDecompositionAttempted');
      if (totalDecompositionSaved !== null) {
        const parsedCount = parseInt(totalDecompositionSaved, 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
          this.totalDecompositionAttempted = 0;
          this.saveTotalDecompositionAttempted();
        } else {
          this.totalDecompositionAttempted = parsedCount;
        }
      }
    },

    updateCountingScore(points: number): void {
      this.countingScore += points;
      this.saveCountingScore();
    },

    updateDecompositionScore(points: number): void {
      this.decompositionScore += points;
      this.saveDecompositionScore();
    },

    updateFirstGradeDecompositionScore(points: number): void {
      this.firstGradeDecompositionScore += points;
      this.saveFirstGradeDecompositionScore();
    },

    updateMultiplicationScore(points: number): void {
      this.multiplicationScore += points;
      this.saveMultiplicationScore();
    },

    updateEquationsScore(points: number): void {
      this.equationsScore += points;
      this.saveEquationsScore();
    },

    setEquationsScore(score: number): void {
      this.equationsScore = score;
      this.saveEquationsScore();
    },

    resetEquationsScore(): void {
      this.equationsScore = 0;
      this.saveEquationsScore();
    },

    updateCurrentMultiplicationLevel(level: number): void {
      this.currentMultiplicationLevel = level;
      this.saveCurrentMultiplicationLevel();
    },

    saveCountingScore(): void {
      const { setItem } = useStorage();
      setItem('countingTrainerTotalScore', this.countingScore.toString());
    },

    saveDecompositionScore(): void {
      const { setItem } = useStorage();
      setItem('mathTrainerTotalScore', this.decompositionScore.toString());
    },

    saveFirstGradeDecompositionScore(): void {
      const { setItem } = useStorage();
      setItem('firstGradeDecompositionScore', this.firstGradeDecompositionScore.toString());
    },

    saveMultiplicationScore(): void {
      const { setItem } = useStorage();
      setItem('multiplicationScore', this.multiplicationScore.toString());
    },

    saveEquationsScore(): void {
      const { setItem } = useStorage();
      setItem('equationsScore', this.equationsScore.toString());
    },

    saveCurrentMultiplicationLevel(): void {
      const { setItem } = useStorage();
      setItem('currentMultiplicationLevel', this.currentMultiplicationLevel.toString());
    },

    resetAllScores(): void {
      this.countingScore = 0;
      this.decompositionScore = 0;
      this.firstGradeDecompositionScore = 0;
      this.multiplicationScore = 0;
      this.equationsScore = 0;
      this.currentMultiplicationLevel = 2;
      this.manualEquationsSolved = 0;
      this.totalEquationsAttempted = 0;
      this.manualDecompositionSolved = 0;
      this.totalDecompositionAttempted = 0;
      this.saveCountingScore();
      this.saveDecompositionScore();
      this.saveFirstGradeDecompositionScore();
      this.saveMultiplicationScore();
      this.saveEquationsScore();
      this.saveCurrentMultiplicationLevel();
      this.saveManualEquationsSolved();
      this.saveTotalEquationsAttempted();
      this.saveManualDecompositionSolved();
      this.saveTotalDecompositionAttempted();
    },

    incrementManualEquationsSolved(): void {
      this.manualEquationsSolved++;
      this.saveManualEquationsSolved();
    },

    incrementTotalEquationsAttempted(): void {
      this.totalEquationsAttempted++;
      this.saveTotalEquationsAttempted();
    },

    saveManualEquationsSolved(): void {
      const { setItem } = useStorage();
      setItem('manualEquationsSolved', this.manualEquationsSolved.toString());
    },

    saveTotalEquationsAttempted(): void {
      const { setItem } = useStorage();
      setItem('totalEquationsAttempted', this.totalEquationsAttempted.toString());
    },

    incrementManualDecompositionSolved(): void {
      this.manualDecompositionSolved++;
      this.saveManualDecompositionSolved();
    },

    incrementTotalDecompositionAttempted(): void {
      this.totalDecompositionAttempted++;
      this.saveTotalDecompositionAttempted();
    },

    saveManualDecompositionSolved(): void {
      const { setItem } = useStorage();
      setItem('manualDecompositionSolved', this.manualDecompositionSolved.toString());
    },

    saveTotalDecompositionAttempted(): void {
      const { setItem } = useStorage();
      setItem('totalDecompositionAttempted', this.totalDecompositionAttempted.toString());
    }
  }
});

// Типы для TypeScript при использовании store
export type ScoresStore = ReturnType<typeof useScoresStore>;
