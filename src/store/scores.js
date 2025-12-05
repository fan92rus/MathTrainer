import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'

export const useScoresStore = defineStore('scores', {
  state: () => ({
    countingScore: 0,
    decompositionScore: 0
  }),
  
  getters: {
    getTotalScore: (state) => state.countingScore + state.decompositionScore
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
    },
    
    updateCountingScore(points) {
      this.countingScore += points
      this.saveCountingScore()
    },
    
    updateDecompositionScore(points) {
      this.decompositionScore += points
      this.saveDecompositionScore()
    },
    
    saveCountingScore() {
      const { setItem } = useStorage()
      setItem('countingTrainerTotalScore', this.countingScore.toString())
    },
    
    saveDecompositionScore() {
      const { setItem } = useStorage()
      setItem('mathTrainerTotalScore', this.decompositionScore.toString())
    },
    
    resetAllScores() {
      this.countingScore = 0
      this.decompositionScore = 0
      this.saveCountingScore()
      this.saveDecompositionScore()
    }
  }
})