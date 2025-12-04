const { createApp } = Vue;

createApp({
    data() {
        return {
            countingScore: 0,
            decompositionScore: 0
        }
    },
    methods: {
        // Загрузка очков из localStorage
        loadScores() {
            // Загружаем очки для игры "Счет"
            const countingSaved = localStorage.getItem('countingTrainerTotalScore');
            if (countingSaved !== null) {
                this.countingScore = parseInt(countingSaved, 10);
            }
            
            // Загружаем очки для игры "Разложение"
            const decompositionSaved = localStorage.getItem('mathTrainerTotalScore');
            if (decompositionSaved !== null) {
                this.decompositionScore = parseInt(decompositionSaved, 10);
            }
        },
        
        // Переход на страницу счета
        goToCounting() {
            window.location.href = 'counting.html';
        },
        
        // Переход на страницу разложения
        goToDecomposition() {
            window.location.href = 'decomposition.html';
        },
        
        // Сброс всех очков
        resetAllScores() {
            if (confirm('Вы уверены, что хотите сбросить все накопленные очки в обеих играх?')) {
                this.countingScore = 0;
                this.decompositionScore = 0;
                
                // Сохраняем нулевые значения в localStorage
                localStorage.setItem('countingTrainerTotalScore', '0');
                localStorage.setItem('mathTrainerTotalScore', '0');
            }
        }
    },
    mounted() {
        // Загружаем очки при загрузке страницы
        this.loadScores();
        
        // Добавляем обработчик события storage для обновления очков в реальном времени
        window.addEventListener('storage', (event) => {
            if (event.key === 'countingTrainerTotalScore') {
                this.countingScore = event.newValue ? parseInt(event.newValue, 10) : 0;
            } else if (event.key === 'mathTrainerTotalScore') {
                this.decompositionScore = event.newValue ? parseInt(event.newValue, 10) : 0;
            }
        });
    }
}).mount('#app');