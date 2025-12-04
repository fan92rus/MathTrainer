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
            // Для сложения раскладываем ВТОРОЕ число для удобного счета на 2 числа
            if (num2 <= 9) {
                // Однозначное число - раскладываем чтобы дополнить до круглого десятка
                const lastDigit = num1 % 10;
                const neededForRound = 10 - lastDigit;
                
                if (num2 >= neededForRound && neededForRound > 0) {
                    // Раскладываем, чтобы дополнить до круглого десятка
                    const part1 = neededForRound;
                    const part2 = num2 - neededForRound;
                    
                    // Проверяем, не равен ли part2 нулю
                    if (part2 === 0) {
                        return `${num1} + ${part1}`;
                    } else {
                        return `${num1} + ${part1} + ${part2}`;
                    }
                } else {
                    // Просто раскладываем на удобные слагаемые
                    const part1 = Math.floor(Math.random() * (num2 - 1)) + 1;
                    const part2 = num2 - part1;
                    
                    // Проверяем, не равен ли part2 нулю
                    if (part2 === 0) {
                        return `${num1} + ${part1}`;
                    } else {
                        return `${num1} + ${part1} + ${part2}`;
                    }
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
                    // Раскладываем второе число для удобства на 2 числа
                    const roundPart = lastDigit;
                    const remainder = num2 - roundPart;
                    
                    // Проверяем, чтобы не было отрицательных чисел или нуля
                    if (remainder <= 0) {
                        return `${num1} - ${num2}`;
                    }
                    return `${num1} - ${roundPart} - ${remainder}`;
                }
            } else {
                // Двузначное второе число - ВСЕГДА раскладываем второе число на 2 числа
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
        
        // Новая функция для генерации "обманчивых" вариантов ответа
        generateDeceptiveOption(num1, num2, isAddition) {
            if (isAddition) {
                // Для сложения создаем вариант с неправильным разложением на 2 числа
                const result = num1 + num2;
                
                // Генерируем разложение, которое выглядит правильно, но дает неверный результат
                if (num2 <= 9) {
                    // Для однозначного числа
                    const lastDigit = num1 % 10;
                    const neededForRound = 10 - lastDigit;
                    
                    if (num2 >= neededForRound && neededForRound > 1) {
                        // Создаем неправильное разложение для дополнения до круглого десятка
                        const wrongPart = neededForRound - 1; // Ошибка на 1
                        const adjustedNum2 = num2 + 1; // Компенсируем, чтобы сохранить сумму
                        
                        return `${num1} + ${wrongPart} + ${adjustedNum2}`;
                    } else {
                        // Создаем неправильное разложение с ошибкой в 1
                        const wrongPart = Math.max(1, Math.floor(num2 / 2) - 1);
                        const adjustedNum2 = num2 + 1; // Компенсируем, чтобы сохранить сумму
                        
                        return `${num1} + ${wrongPart} + ${adjustedNum2}`;
                    }
                } else {
                    // Для двузначного числа
                    const tens = Math.floor(num2 / 10) * 10;
                    const remainder = num2 - tens;
                    
                    if (remainder > 1) {
                        // Создаем неправильное разложение с ошибкой в остатке
                        return `${num1} + ${tens} + ${remainder - 1} + 1`;
                    } else {
                        // Создаем неправильное разложение с ошибкой в десятках
                        return `${num1} + ${tens - 1} + ${remainder + 1}`;
                    }
                }
            } else {
                // Для вычитания создаем вариант с неправильным разложением на 2 числа
                const result = num1 - num2;
                
                if (num2 <= 9) {
                    // Для однозначного числа
                    const lastDigit = num1 % 10;
                    
                    if (num2 > lastDigit && lastDigit > 1) {
                        // Создаем неправильное разложение с ошибкой в первой части
                        const wrongPart = lastDigit - 1;
                        const adjustedNum2 = num2 + 1; // Компенсируем, чтобы сохранить разность
                        
                        return `${num1} - ${wrongPart} - ${adjustedNum2}`;
                    } else {
                        // Создаем неправильное разложение с ошибкой
                        return `${num1} - ${Math.max(1, num2 - 1)} - 1`;
                    }
                } else {
                    // Для двузначного числа
                    const tens = Math.floor(num2 / 10) * 10;
                    const remainder = num2 - tens;
                    
                    if (remainder > 1) {
                        // Создаем неправильное разложение с ошибкой в остатке
                        return `${num1} - ${tens} - ${remainder - 1} - 1`;
                    } else if (tens > 10) {
                        // Создаем неправильное разложение с ошибкой в десятках
                        return `${num1} - ${tens - 10} - ${remainder + 10}`;
                    } else {
                        // Создаем неправильное разложение с ошибкой в распределении
                        return `${num1} - ${Math.max(1, tens - 1)} - ${remainder + 1}`;
                    }
                }
            }
        },
        
        generateWrongAdditionOptions(num1, num2, correctOption) {
            const wrongOptions = [];
            
            // Добавляем "обманчивый" вариант с неправильным разложением (30% шанс)
            if (Math.random() < 0.3) {
                const deceptiveOption = this.generateDeceptiveOption(num1, num2, true);
                if (deceptiveOption !== correctOption) {
                    wrongOptions.push(deceptiveOption);
                }
            }
            
            // Разбираем правильный вариант
            const parts = correctOption.split(' + ');
            const mainNum = parseInt(parts[0]);
            
            if (parts.length === 2) {
                // Простое сложение - создаем варианты с разложением на 2 числа
                const half1 = Math.floor(num2 / 2);
                const half2 = Math.ceil(num2 / 2);
                
                // Вариант с разложением на 2 числа, дающий правильную сумму
                if (half1 !== 0 && half2 !== 0) {
                    wrongOptions.push(`${mainNum} + ${half1} + ${half2}`);
                }
                
                // Вариант с разложением на 2 числа, дающий правильную сумму
                if (num2 - 1 !== 0) {
                    wrongOptions.push(`${mainNum} + ${num2 - 1} + 1`);
                }
                
                // Вариант с измененным вторым числом
                wrongOptions.push(`${mainNum} + ${num2 + 1}`);
            } else {
                // Разложенное сложение - создаем варианты с разложением на 2 числа
                const part1 = parseInt(parts[1]);
                const part2 = parseInt(parts[2]);
                
                // Вариант 1: объединяем части и меняем на другое разложение
                const combined = part1 + part2;
                if (combined > 2) {
                    const newPart1 = Math.floor(combined / 2);
                    const newPart2 = combined - newPart1;
                    if (newPart1 !== part1 && newPart2 !== part2) {
                        wrongOptions.push(`${mainNum} + ${newPart1} + ${newPart2}`);
                    }
                }
                
                // Вариант 2: меняем первое слагаемое и компенсируем во втором
                if (part1 > 1) {
                    wrongOptions.push(`${mainNum} + ${part1 - 1} + ${part2 + 1}`);
                }
                
                // Вариант 3: меняем второе слагаемое и компенсируем в первом
                if (part2 > 1) {
                    wrongOptions.push(`${mainNum} + ${part1 + 1} + ${part2 - 1}`);
                }
            }
            
            return this.shuffleArray(wrongOptions).slice(0, 3);
        },
        
        generateWrongSubtractionOptions(num1, num2, correctOption) {
            const wrongOptions = [];
            
            // Добавляем "обманчивый" вариант с неправильным разложением (30% шанс)
            if (Math.random() < 0.3) {
                const deceptiveOption = this.generateDeceptiveOption(num1, num2, false);
                if (deceptiveOption !== correctOption) {
                    wrongOptions.push(deceptiveOption);
                }
            }
            
            if (correctOption.split(' - ').length === 3) {
                // Разбираем правильный вариант с разложением
                const parts = correctOption.split(' - ');
                const mainNum = parseInt(parts[0]);
                const part1 = parseInt(parts[1]);
                const part2 = parseInt(parts[2]);
                
                // Неправильные варианты для разложенного вычитания с 2 числами
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
                        const remainder = num2 - lastDigit + 1;
                        // Проверяем, не равен ли remainder нулю
                        if (remainder !== 0) {
                            wrongOptions.push(`${mainNum} - ${lastDigit - 1} - ${remainder}`);
                        } else {
                            wrongOptions.push(`${mainNum} - ${lastDigit - 1}`);
                        }
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
                
                // Создаем варианты с разложением на 2 числа, дающие правильную разность
                if (lastDigit > 0 && num2 - lastDigit > 0 && num1 % 10 !== 0) {
                    const remainder = num2 - lastDigit;
                    // Проверяем, не равен ли remainder нулю
                    if (remainder !== 0) {
                        wrongOptions.push(`${num1} - ${lastDigit} - ${remainder}`);
                    } else {
                        wrongOptions.push(`${num1} - ${lastDigit}`);
                    }
                }
                if (lastDigit > 1 && num2 - lastDigit - 1 > 0 && num1 % 10 !== 0) {
                    const remainder = num2 - lastDigit - 1;
                    // Проверяем, не равен ли remainder нулю
                    if (remainder !== 0) {
                        wrongOptions.push(`${num1} - ${lastDigit + 1} - ${remainder}`);
                    } else {
                        wrongOptions.push(`${num1} - ${lastDigit + 1}`);
                    }
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