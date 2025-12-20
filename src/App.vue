<template>
  <div class="app-container">
    <router-view />
    <GradeSelection v-if="showGradeSelection" @grade-selected="handleGradeSelected" />
  </div>
</template>

<script>
  import { computed, onMounted } from 'vue';
  import { useSettingsStore } from './store/settings';
  import GradeSelection from './components/common/GradeSelection.vue';

  export default {
    name: 'App',
    components: {
      GradeSelection
    },
    setup() {
      const settingsStore = useSettingsStore();

      // Вычисляемое свойство для определения необходимости показа выбора класса
      const showGradeSelection = computed(() => {
        return settingsStore.isFirstTime || !settingsStore.isGradeSelected;
      });

      // Обработчик выбора класса
      const handleGradeSelected = () => {
        // Класс выбран, компонент GradeSelection скроется автоматически
        // благодаря реактивности showGradeSelection
      };

      // Загружаем настройки при монтировании приложения
      onMounted(() => {
        settingsStore.loadSettings();
      });

      return {
        showGradeSelection,
        handleGradeSelected
      };
    }
  };
</script>

<style>
  .app-container {
    font-family: 'Rubik', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    overflow: hidden;
  }
</style>
