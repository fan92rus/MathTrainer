import { defineStore } from 'pinia'
import { useStorage } from '../composables/useStorage'
import { getCurrentQuarter, getDifficultySettings } from '../utils/gradeHelpers'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    selectedGrade: null, // Выбранный класс (1-4)
    isFirstTime: true, // Флаг первого входа
    currentQuarter: 1 // Текущая четверть (1-4)
  }),
  
  getters: {
    // Проверяет, выбран ли класс
    isGradeSelected: (state) => state.selectedGrade !== null,
    
    // Получает настройки сложности для текущего класса и четверти
    difficultySettings: (state) => {
      if (!state.selectedGrade) return null
      
      return getDifficultySettings(state.selectedGrade, state.currentQuarter)
    },
    
    // Получает максимальное число для примеров на счет
    maxCountingNumber: (state) => {
      if (!state.selectedGrade) return 20
      
      const settings = getDifficultySettings(state.selectedGrade, state.currentQuarter)
      return settings ? settings.maxCountingNumber : 20
    },
    
    // Получает максимальное число для примеров на разложение
    maxDecompositionNumber: (state) => {
      if (!state.selectedGrade) return 20
      
      const settings = getDifficultySettings(state.selectedGrade, state.currentQuarter)
      return settings ? settings.maxDecompositionNumber : 20
    }
  },
  
  actions: {
    // Загружает настройки из хранилища
    loadSettings() {
      const { getItem } = useStorage()
      
      const savedGrade = getItem('selectedGrade')
      if (savedGrade !== null) {
        this.selectedGrade = parseInt(savedGrade, 10)
        this.isFirstTime = false
      }
      
      // Определяем текущую четверть
      this.currentQuarter = getCurrentQuarter()
    },
    
    // Устанавливает выбранный класс
    setGrade(grade) {
      this.selectedGrade = grade
      this.isFirstTime = false
      // Обновляем текущую четверть при смене класса
      this.currentQuarter = getCurrentQuarter()
      this.saveGrade()
    },
    
    // Сохраняет выбранный класс
    saveGrade() {
      const { setItem } = useStorage()
      setItem('selectedGrade', this.selectedGrade.toString())
    },
    
    // Сбрасывает настройки (для тестирования)
    resetSettings() {
      this.selectedGrade = null
      this.isFirstTime = true
      
      const { removeItem } = useStorage()
      removeItem('selectedGrade')
    }
  }
})