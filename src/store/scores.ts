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
    currentMultiplicationLevel: 2 // Текущий открытый уровень таблицы умножения
  }),

  getters: {
    getTotalScore: (state): number =>
      state.countingScore +
      state.decompositionScore +
      state.firstGradeDecompositionScore +
      state.multiplicationScore +
      state.equationsScore,

    getEquationsScore: (state): number => state.equationsScore,

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
        this.countingScore = parseInt(countingSaved, 10);
      }

      const decompositionSaved = getItem('mathTrainerTotalScore');
      if (decompositionSaved !== null) {
        this.decompositionScore = parseInt(decompositionSaved, 10);
      }

      const firstGradeDecompositionSaved = getItem('firstGradeDecompositionScore');
      if (firstGradeDecompositionSaved !== null) {
        this.firstGradeDecompositionScore = parseInt(firstGradeDecompositionSaved, 10);
      }

      const multiplicationSaved = getItem('multiplicationScore');
      if (multiplicationSaved !== null) {
        this.multiplicationScore = parseInt(multiplicationSaved, 10);
      }

      const equationsSaved = getItem('equationsScore');
      if (equationsSaved !== null) {
        this.equationsScore = parseInt(equationsSaved, 10);
      }

      const currentLevelSaved = getItem('currentMultiplicationLevel');
      if (currentLevelSaved !== null) {
        this.currentMultiplicationLevel = parseInt(currentLevelSaved, 10);
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
      this.saveCountingScore();
      this.saveDecompositionScore();
      this.saveFirstGradeDecompositionScore();
      this.saveMultiplicationScore();
      this.saveEquationsScore();
      this.saveCurrentMultiplicationLevel();
    }
  }
});

// Типы для TypeScript при использовании store
export type ScoresStore = ReturnType<typeof useScoresStore>;
