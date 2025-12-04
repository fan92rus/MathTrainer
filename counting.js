const { createApp } = Vue;

createApp({
    data() {
        return {
            score: 0,
            totalScore: 0, // Суммарные очки, которые копятся между играми
            currentQuestion: 0,
            totalQuestions: 10,
            answered: false,
            selectedIndex: null,
            gameOver: false,
            currentLevel: 1,
            problems: []
        }
    },
    computed: {
        currentProblem() {
            return this.problems[this.currentQuestion] || this.generateProblem();
        },
        progressPercent() {
            return (this.currentQuestion / this.totalQuestions) * 100;
        }
    },
    methods: {
        // Загрузка суммарных очков из localStorage
        loadTotalScore() {
            const saved = localStorage.getItem('countingTrainerTotalScore');
            if (saved !== null) {
                this.totalScore = parseInt(saved, 10);
            }
        },
        
        // Сохранение суммарных очков в localStorage
        saveTotalScore() {
            localStorage.setItem('countingTrainerTotalScore', this.totalScore.toString());
        },
        
        // Сброс суммарных очков
        resetTotalScore() {
            if (confirm('Вы уверены, что хотите сбросить все накопленные очки?')) {
                this.totalScore = 0;
                this.saveTotalScore();
            }
        },
        
        generateProblem() {
            // Генерируем два числа в зависимости от уровня и общего количества очков
            let maxNum;
            
            // Определяем максимальное число на основе общего количества очков
            if (this.totalScore < 300) {
                maxNum = 20; // До 300 очков - числа до 20
            } else if (this.totalScore < 400) {
                maxNum = 30; // 300-399 очков - числа до 30
            } else if (this.totalScore < 500) {
                maxNum = 40; // 400-499 очков - числа до 40
            } else if (this.totalScore < 600) {
                maxNum = 50; // 500-599 очков - числа до 50
            } else if (this.totalScore < 700) {
                maxNum = 60; // 600-699 очков - числа до 60
            } else if (this.totalScore < 800) {
                maxNum = 70; // 700-799 очков - числа до 70
            } else if (this.totalScore < 900) {
                maxNum = 80; // 800-899 очков - числа до 80
            } else if (this.totalScore < 1000) {
                maxNum = 90; // 900-999 очков - числа до 90
            } else {
                maxNum = 100; // 1000+ очков - числа до 100
            }
            
            // Также учитываем текущий уровень для небольшого увеличения сложности
            maxNum = Math.min(maxNum + this.currentLevel * 2, 100);
            let num1 = Math.floor(Math.random() * maxNum) + 1;
            let num2 = Math.floor(Math.random() * maxNum) + 1;
            
            // Выбираем операцию
            const isAddition = Math.random() > 0.5;
            
            // Для вычитания убедимся, что первое число больше или равно второму
            if (!isAddition && num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            
            // Вычисляем правильный ответ
            let correctAnswer;
            let expression;
            
            if (isAddition) {
                correctAnswer = num1 + num2;
                expression = `${num1} + ${num2}`;
            } else {
                correctAnswer = num1 - num2;
                expression = `${num1} - ${num2}`;
            }
            
            // Генерируем неправильные варианты ответов
            const wrongAnswers = this.generateWrongAnswers(correctAnswer, isAddition);
            
            // Собираем все варианты и перемешиваем
            const allOptions = [correctAnswer, ...wrongAnswers];
            const shuffled = this.shuffleArray(allOptions);
            const correctIndex = shuffled.indexOf(correctAnswer);
            
            return {
                expression: expression,
                options: shuffled,
                correctIndex: correctIndex
            };
        },
        
        generateWrongAnswers(correctAnswer, isAddition) {
            const wrongAnswers = [];
            
            // Генерируем три неправильных ответа
            while (wrongAnswers.length < 3) {
                let wrongAnswer;
                
                // Разные стратегии генерации неправильных ответов
                const strategy = Math.floor(Math.random() * 4);
                
                switch (strategy) {
                    case 0:
                        // Ответ близкий к правильному (±1-5)
                        const offset = Math.floor(Math.random() * 5) + 1;
                        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
                        break;
                    case 1:
                        // Ответ с ошибкой в последней цифре
                        const lastDigit = correctAnswer % 10;
                        const newLastDigit = (lastDigit + Math.floor(Math.random() * 9) + 1) % 10;
                        wrongAnswer = Math.floor(correctAnswer / 10) * 10 + newLastDigit;
                        break;
                    case 2:
                        // Ответ с ошибкой в десятках (если возможно)
                        if (correctAnswer >= 10) {
                            const tens = Math.floor(correctAnswer / 10);
                            const newTens = Math.max(1, tens + (Math.random() > 0.5 ? 1 : -1));
                            wrongAnswer = newTens * 10 + (correctAnswer % 10);
                        } else {
                            // Для чисел меньше 10 просто добавляем/вычитаем
                            wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 10 : -10);
                        }
                        break;
                    case 3:
                        // Умножение или деление правильного ответа на 2 (если это дает разумный результат)
                        if (correctAnswer % 2 === 0 && correctAnswer / 2 > 0) {
                            wrongAnswer = correctAnswer / 2;
                        } else if (correctAnswer * 2 < 200) {
                            wrongAnswer = correctAnswer * 2;
                        } else {
                            // Запасной вариант
                            wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
                        }
                        break;
                }
                
                // Убеждаемся, что ответ положительный и не совпадает с правильным
                wrongAnswer = Math.max(0, wrongAnswer);
                
                // Проверяем, что такого ответа еще нет
                if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                    wrongAnswers.push(wrongAnswer);
                }
            }
            
            return wrongAnswers;
        },
        
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },
        
        selectAnswer(index) {
            if (this.answered) return;
            
            this.answered = true;
            this.selectedIndex = index;
            
            if (index === this.currentProblem.correctIndex) {
                this.score += 10;
                this.totalScore += 10; // Добавляем очки к суммарным
                this.saveTotalScore(); // Сохраняем в localStorage
            }
            
            setTimeout(() => {
                this.nextQuestion();
            }, 1500);
        },
        
        nextQuestion() {
            this.currentQuestion++;
            this.answered = false;
            this.selectedIndex = null;
            
            if (this.currentQuestion >= this.totalQuestions) {
                this.gameOver = true;
            } else {
                // Увеличиваем уровень каждые 3 вопроса
                if (this.currentQuestion % 3 === 0) {
                    this.currentLevel++;
                }
            }
        },
        
        restartGame() {
            this.score = 0;
            this.currentQuestion = 0;
            this.answered = false;
            this.selectedIndex = null;
            this.gameOver = false;
            this.currentLevel = 1;
            this.problems = [];
            // Не сбрасываем totalScore здесь, так как они должны копиться
        },
        
        // Переход на главную страницу
        goToMain() {
            window.location.href = 'index.html';
        }
    },
    mounted() {
        // Загружаем суммарные очки из localStorage
        this.loadTotalScore();
        
        // Генерируем все проблемы заранее
        for (let i = 0; i < this.totalQuestions; i++) {
            this.problems.push(this.generateProblem());
        }
    }
}).mount('#app');