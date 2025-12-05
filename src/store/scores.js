import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'

export const useScoresStore = defineStore('scores', {
  state: () => ({
    countingScore: 0,
    decompositionScore: 0,
    firstGradeDecompositionScore: 0,
    multiplicationScore: 0,
    currentMultiplicationLevel: 2 // Текущий открытый уровень таблицы умножения
  }),
  
  getters: {
    getTotalScore: (state) => state.countingScore + state.decompositionScore + state.firstGradeDecompositionScore + state.multiplicationScore
  },
  
  actions: {
    loadScores() {
      const { getItem } = useStorage()
      
      const countingSaved = getItem('countingTrainerTotalScore')
      if (countingSaved !== null) {
        this.countingScore = parseInt(countingSaved, 10)
      }
      
      const decompositionSaved = getItem('mathTrainerTotalScore')
      if (decompositionSaved !== null) {
        this.decompositionScore = parseInt(decompositionSaved, 10)
      }
      
      const firstGradeDecompositionSaved = getItem('firstGradeDecompositionScore')
      if (firstGradeDecompositionSaved !== null) {
        this.firstGradeDecompositionScore = parseInt(firstGradeDecompositionSaved, 10)
      }
      
      const multiplicationSaved = getItem('multiplicationScore')
      if (multiplicationSaved !== null) {
        this.multiplicationScore = parseInt(multiplicationSaved, 10)
      }
      
      const currentLevelSaved = getItem('currentMultiplicationLevel')
      if (currentLevelSaved !== null) {
        this.currentMultiplicationLevel = parseInt(currentLevelSaved, 10)
      }
    },
    
    updateCountingScore(points) {
      this.countingScore += points
      this.saveCountingScore()
    },
    
    updateDecompositionScore(points) {
      this.decompositionScore += points
      this.saveDecompositionScore()
    },
    
    updateFirstGradeDecompositionScore(points) {
      this.firstGradeDecompositionScore += points
      this.saveFirstGradeDecompositionScore()
    },
    
    updateMultiplicationScore(points) {
      this.multiplicationScore += points
      this.saveMultiplicationScore()
    },
    
    updateCurrentMultiplicationLevel(level) {
      this.currentMultiplicationLevel = level
      this.saveCurrentMultiplicationLevel()
    },
    
    saveCountingScore() {
      const { setItem } = useStorage()
      setItem('countingTrainerTotalScore', this.countingScore.toString())
    },
    
    saveDecompositionScore() {
      const { setItem } = useStorage()
      setItem('mathTrainerTotalScore', this.decompositionScore.toString())
    },
    
    saveFirstGradeDecompositionScore() {
      const { setItem } = useStorage()
      setItem('firstGradeDecompositionScore', this.firstGradeDecompositionScore.toString())
    },
    
    saveMultiplicationScore() {
      const { setItem } = useStorage()
      setItem('multiplicationScore', this.multiplicationScore.toString())
    },
    
    saveCurrentMultiplicationLevel() {
      const { setItem } = useStorage()
      setItem('currentMultiplicationLevel', this.currentMultiplicationLevel.toString())
    },
    
    resetAllScores() {
      this.countingScore = 0
      this.decompositionScore = 0
      this.firstGradeDecompositionScore = 0
      this.multiplicationScore = 0
      this.currentMultiplicationLevel = 2
      this.saveCountingScore()
      this.saveDecompositionScore()
      this.saveFirstGradeDecompositionScore()
      this.saveMultiplicationScore()
      this.saveCurrentMultiplicationLevel()
    }
  }
})