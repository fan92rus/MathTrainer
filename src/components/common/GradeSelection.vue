<template>
  <div class="grade-selection-overlay">
    <div class="grade-selection-container">
      <div class="grade-selection-header">
        <h1 class="grade-selection-title">Добро пожаловать в Математический Тренажер!</h1>
        <p class="grade-selection-subtitle">Пожалуйста, выберите ваш класс, чтобы мы могли настроить задания под ваш уровень</p>
      </div>
      
      <div class="grade-options">
        <div 
          v-for="grade in availableGrades" 
          :key="grade.value"
          class="grade-card"
          :class="{ 'selected': selectedGrade === grade.value }"
          @click="selectGrade(grade.value)"
        >
          <div class="grade-icon">{{ grade.icon }}</div>
          <div class="grade-name">{{ grade.name }}</div>
        </div>
      </div>
      
      <div class="grade-selection-footer">
        <button 
          class="continue-button" 
          :disabled="!selectedGrade"
          @click="confirmSelection"
        >
          Продолжить
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useSettingsStore } from '../../store/settings'
import { getGradeName, getCurrentQuarter, getQuarterName } from '../../utils/gradeHelpers'

export default {
  name: 'GradeSelection',
  emits: ['grade-selected'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
    const selectedGrade = ref(null)
    
    // Доступные классы
    const availableGrades = [
      { value: 1, name: '1 класс', icon: '🎒' },
      { value: 2, name: '2 класс', icon: '📚' },
      { value: 3, name: '3 класс', icon: '📖' },
      { value: 4, name: '4 класс', icon: '📝' }
    ]
    
    // Выбор класса
    const selectGrade = (grade) => {
      selectedGrade.value = grade
    }
    
    // Подтверждение выбора
    const confirmSelection = () => {
      if (selectedGrade.value) {
        settingsStore.setGrade(selectedGrade.value)
        // Генерируем событие для уведомления родительского компонента
        emit('grade-selected', selectedGrade.value)
      }
    }
    
    return {
      selectedGrade,
      availableGrades,
      selectGrade,
      confirmSelection
    }
  }
}
</script>

<style scoped>
.grade-selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.grade-selection-container {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
}

.grade-selection-header {
  margin-bottom: 30px;
}

.grade-selection-title {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.grade-selection-subtitle {
  font-size: clamp(16px, 3vw, 18px);
  color: #666;
  line-height: 1.5;
}

.grade-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grade-card {
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.grade-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.grade-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.grade-icon {
  font-size: clamp(40px, 8vw, 60px);
  margin-bottom: 10px;
}

.grade-name {
  font-size: clamp(18px, 4vw, 22px);
  font-weight: 600;
}

.continue-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 40px;
  font-size: clamp(16px, 3vw, 18px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.continue-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.continue-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .grade-selection-container {
    padding: 20px;
    width: 95%;
    max-height: 85vh;
  }
  
  .grade-selection-header {
    margin-bottom: 20px;
  }
  
  .grade-selection-title {
    margin-bottom: 10px;
  }
  
  .grade-selection-subtitle {
    font-size: 14px;
  }
  
  .grade-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .grade-card {
    padding: 15px;
  }
  
  .continue-button {
    padding: 12px 30px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .grade-selection-container {
    padding: 15px;
    width: 98%;
    border-radius: 15px;
  }
  
  .grade-selection-header {
    margin-bottom: 15px;
  }
  
  .grade-selection-title {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .grade-selection-subtitle {
    font-size: 13px;
  }
  
  .grade-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .grade-card {
    padding: 12px;
    border-radius: 10px;
  }
  
  .grade-icon {
    font-size: 30px;
    margin-bottom: 8px;
  }
  
  .grade-name {
    font-size: 14px;
  }
  
  .continue-button {
    padding: 10px 25px;
    font-size: 14px;
  }
}

/* Для сверхмаленьких экранов */
@media (max-width: 360px) {
  .grade-selection-container {
    padding: 10px;
  }
  
  .grade-selection-title {
    font-size: 18px;
  }
  
  .grade-selection-subtitle {
    font-size: 12px;
  }
  
  .grade-options {
    gap: 8px;
  }
  
  .grade-card {
    padding: 10px;
  }
  
  .grade-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .grade-name {
    font-size: 12px;
  }
  
  .continue-button {
    padding: 8px 20px;
    font-size: 12px;
  }
}
</style>