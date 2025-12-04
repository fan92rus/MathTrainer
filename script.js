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
            const saved = localStorage.getItem('mathTrainerTotalScore');
            if (saved !== null) {
                this.totalScore = parseInt(saved, 10);
            }
        },
        
        // Сохранение суммарных очков в localStorage
        saveTotalScore() {
            localStorage.setItem('mathTrainerTotalScore', this.totalScore.toString());
        },
        
        // Сброс суммарных очков
        resetTotalScore() {
            if (confirm('Вы уверены, что хотите сбросить все накопленные очки?')) {
                this.totalScore = 0;
                this.saveTotalScore();
            }
        },
        
        generateProblem() {
            // Генерируем два числа, большее всегда слева
            let num1 = Math.floor(Math.random() * 50) + 20;
            let num2 = Math.floor(Math.random() * 30) + 5;
            
            if (num2 > num1) {
                [num1, num2] = [num2, num1];
            }
            
            // Выбираем операцию
            const isAddition = Math.random() > 0.5;
            
            let correctOption, wrongOptions = [];
            
            if (isAddition) {
                // Сложение
                correctOption = this.generateAdditionOption(num1, num2);
                wrongOptions = this.generateWrongAdditionOptions(num1, num2, correctOption);
            } else {
                // Вычитание
                correctOption = this.generateSubtractionOption(num1, num2);
                wrongOptions = this.generateWrongSubtractionOptions(num1, num2, correctOption);
            }
            
            // Собираем все варианты и перемешиваем
            const allOptions = [correctOption, ...wrongOptions];
            const shuffled = this.shuffleArray(allOptions);
            const correctIndex = shuffled.indexOf(correctOption);
            
            return {
                expression: isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`,
                options: shuffled,
                correctIndex: correctIndex
            };
        },
        
        generateAdditionOption(num1, num2) {
            // Для сложения раскладываем ВТОРОЕ число для удобного счета
            if (num2 <= 9) {
                // Однозначное число - раскладываем чтобы дополнить до круглого десятка
                const lastDigit = num1 % 10;
                const neededForRound = 10 - lastDigit;
                
                if (num2 >= neededForRound) {
                    // Раскладываем, чтобы дополнить до круглого десятка
                    const part1 = neededForRound;
                    const part2 = num2 - neededForRound;
                    return `${num1} + ${part1} + ${part2}`;
                } else {
                    // Просто раскладываем на удобные слагаемые
                    const part1 = Math.floor(Math.random() * (num2 - 1)) + 1;
                    const part2 = num2 - part1;
                    return `${num1} + ${part1} + ${part2}`;
                }
            } else {
                // Двузначное число - раскладываем на десятки и единицы
                const tens = Math.floor(num2 / 10) * 10;
                const remainder = num2 - tens;
                
                // Если остаток 0, не раскладываем вообще
                if (remainder === 0) {
                    return `${num1} + ${num2}`;
                } else {
                    return `${num1} + ${tens} + ${remainder}`;
                }
            }
        },
        
        generateSubtractionOption(num1, num2) {
            if (num2 <= 9) {
                // Однозначное второе число
                const isFirstRound = num1 % 10 === 0;
                const lastDigit = num1 % 10;
                
                if (isFirstRound) {
                    // Если первое число круглое - не раскладываем
                    return `${num1} - ${num2}`;
                } else if (num2 <= lastDigit) {
                    // Если второе число ≤ последней цифры первого - не раскладываем
                    return `${num1} - ${num2}`;
                } else {
                    // Раскладываем второе число для удобства
                    const roundPart = lastDigit;
                    const remainder = num2 - roundPart;
                    
                    // Проверяем, чтобы не было отрицательных чисел
                    if (remainder <= 0) {
                        return `${num1} - ${num2}`;
                    }
                    return `${num1} - ${roundPart} - ${remainder}`;
                }
            } else {
                // Двузначное второе число - ВСЕГДА раскладываем второе число
                const tens = Math.floor(num2 / 10) * 10;
                const remainder = num2 - tens;
                
                if (remainder === 0) {
                    // Если остаток 0, не включаем его в выражение
                    return `${num1} - ${tens}`;
                } else {
                    return `${num1} - ${tens} - ${remainder}`;
                }
            }
        },
        
        generateWrongAdditionOptions(num1, num2, correctOption) {
            const wrongOptions = [];
            
            // Разбираем правильный вариант
            const parts = correctOption.split(' + ');
            const mainNum = parseInt(parts[0]);
            
            if (parts.length === 2) {
                // Простое сложение - создаем варианты с разложением
                wrongOptions.push(`${mainNum} + ${Math.floor(num2 / 2)} + ${Math.ceil(num2 / 2)}`);
                wrongOptions.push(`${mainNum} + ${num2 - 1} + 1`);
                wrongOptions.push(`${mainNum} + ${num2 + 1}`);
            } else {
                // Разложенное сложение
                const part1 = parseInt(parts[1]);
                const part2 = parseInt(parts[2]);
                
                // Вариант 1: меняем первое слагаемое на 1
                if (part1 + 1 !== num2) {
                    wrongOptions.push(`${mainNum} + ${part1 + 1} + ${part2}`);
                }
                
                // Вариант 2: меняем второе слагаемое на 1
                if (part2 + 1 !== num2) {
                    wrongOptions.push(`${mainNum} + ${part1} + ${part2 + 1}`);
                }
                
                // Вариант 3: немного изменяем оба слагаемых
                if (part1 > 2 && part2 > 2) {
                    wrongOptions.push(`${mainNum} + ${part1 - 1} + ${part2 + 1}`);
                } else {
                    wrongOptions.push(`${mainNum} + ${part1 + 2} + ${part2}`);
                }
            }
            
            return this.shuffleArray(wrongOptions).slice(0, 3);
        },
        
        generateWrongSubtractionOptions(num1, num2, correctOption) {
            const wrongOptions = [];
            
            if (correctOption.split(' - ').length === 3) {
                // Разбираем правильный вариант с разложением
                const parts = correctOption.split(' - ');
                const mainNum = parseInt(parts[0]);
                const part1 = parseInt(parts[1]);
                const part2 = parseInt(parts[2]);
                
                // Неправильные варианты для разложенного вычитания
                if (part2 + 1 > 0) {
                    wrongOptions.push(`${mainNum} - ${part1} - ${part2 + 1}`);
                }
                if (part1 + 1 < num2) {
                    wrongOptions.push(`${mainNum} - ${part1 + 1} - ${part2}`);
                }
                
                // Третий вариант зависит от типа разложения
                if (num2 <= 9) {
                    // Для однозначного - создаем вариант с другим разложением
                    const lastDigit = num1 % 10;
                    if (lastDigit > 1 && num2 - lastDigit + 1 > 0) {
                        wrongOptions.push(`${mainNum} - ${lastDigit - 1} - ${num2 - lastDigit + 1}`);
                    } else {
                        wrongOptions.push(`${mainNum} - ${num2 + 1}`);
                    }
                } else {
                    // Для двузначного - меняем десятки и единицы
                    if (part1 - 10 > 0 && part2 + 10 < num2) {
                        wrongOptions.push(`${mainNum} - ${part1 - 10} - ${part2 + 10}`);
                    } else {
                        wrongOptions.push(`${mainNum} - ${num2 + 1}`);
                    }
                }
            } else {
                // Неправильные варианты для простого вычитания
                const lastDigit = num1 % 10;
                
                // Создаем варианты с неправильным разложением
                if (lastDigit > 0 && num2 - lastDigit > 0 && num1 % 10 !== 0) {
                    wrongOptions.push(`${num1} - ${lastDigit} - ${num2 - lastDigit}`);
                }
                if (lastDigit > 1 && num2 - lastDigit - 1 > 0 && num1 % 10 !== 0) {
                    wrongOptions.push(`${num1} - ${lastDigit + 1} - ${num2 - lastDigit - 1}`);
                }
                wrongOptions.push(`${num1} - ${num2 + 1}`);
            }
            
            return this.shuffleArray(wrongOptions).slice(0, 3);
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