// Функция для генерации примеров разложения чисел до 10 для 1 класса
export function generateFirstGradeDecompositionProblem() {
  // Генерируем случайное число от 2 до 10
  const targetNumber = Math.floor(Math.random() * 9) + 2
  
  // Генерируем правильное разложение (два числа, дающих в сумме targetNumber)
  const firstPart = Math.floor(Math.random() * (targetNumber - 1)) + 1
  const secondPart = targetNumber - firstPart
  
  // Создаем правильный вариант в формате "2 и 1"
  const correctOption = `${firstPart} и ${secondPart}`
  
  // Генерируем неправильные варианты
  const wrongOptions = generateWrongOptions(targetNumber, firstPart, secondPart)
  
  // Собираем все варианты и перемешиваем
  const allOptions = [correctOption, ...wrongOptions]
  const shuffled = shuffleArray(allOptions)
  const correctIndex = shuffled.indexOf(correctOption)
  
  return {
    expression: `${targetNumber} это `,
    options: shuffled,
    correctIndex: correctIndex,
    targetNumber: targetNumber,
    correctDecomposition: [firstPart, secondPart]
  }
}

// Вспомогательная функция для генерации неправильных вариантов
function generateWrongOptions(targetNumber, correctFirstPart, correctSecondPart) {
  const wrongOptions = []
  const maxAttempts = 10
  
  // Вспомогательные функции
  const hasCorrectSum = (part1, part2) => (part1 + part2) === targetNumber
  const isCorrectVariant = (part1, part2) =>
    (part1 === correctFirstPart && part2 === correctSecondPart) ||
    (part1 === correctSecondPart && part2 === correctFirstPart)
  const isNotAlreadyAdded = (part1, part2) => {
    const option = `${part1} и ${part2}`
    return !wrongOptions.includes(option)
  }
  
  // Стратегия 1: неправильная сумма (больше)
  generateWrongOptionByStrategy(
    wrongOptions,
    () => {
      const wrongSum = Math.min(targetNumber + Math.floor(Math.random() * 3) + 1, 10)
      const part1 = Math.floor(Math.random() * (wrongSum - 1)) + 1
      const part2 = wrongSum - part1
      return { part1, part2, isValid: !hasCorrectSum(part1, part2) }
    },
    isNotAlreadyAdded,
    maxAttempts
  )
  
  // Стратегия 2: неправильная сумма (меньше)
  generateWrongOptionByStrategy(
    wrongOptions,
    () => {
      const wrongSum = Math.max(targetNumber - Math.floor(Math.random() * 3) - 1, 2)
      const part1 = Math.floor(Math.random() * (wrongSum - 1)) + 1
      const part2 = wrongSum - part1
      return { part1, part2, isValid: !hasCorrectSum(part1, part2) }
    },
    isNotAlreadyAdded,
    maxAttempts
  )
  
  // Стратегия 3: неправильные части для правильной суммы
  generateWrongOptionByStrategy(
    wrongOptions,
    () => {
      const part1 = Math.floor(Math.random() * (targetNumber - 1)) + 1
      const part2 = targetNumber - part1
      return { part1, part2, isValid: !isCorrectVariant(part1, part2) }
    },
    isNotAlreadyAdded,
    maxAttempts
  )
  
  // Если все еще не хватает вариантов, добавляем случайные
  while (wrongOptions.length < 3) {
    const part1 = Math.floor(Math.random() * 9) + 1
    const part2 = Math.floor(Math.random() * 9) + 1
    
    if (!hasCorrectSum(part1, part2) && isNotAlreadyAdded(part1, part2)) {
      wrongOptions.push(`${part1} и ${part2}`)
    }
  }
  
  return wrongOptions.slice(0, 3)
}

// Вспомогательная функция для генерации неправильного варианта по заданной стратегии
function generateWrongOptionByStrategy(wrongOptions, strategyFn, isNotAlreadyAdded, maxAttempts) {
  let attempts = 0
  
  while (wrongOptions.length < (wrongOptions.length + 1) && attempts < maxAttempts) {
    const { part1, part2, isValid } = strategyFn()
    
    if (isValid && isNotAlreadyAdded(part1, part2)) {
      wrongOptions.push(`${part1} и ${part2}`)
    }
    
    attempts++
  }
}

export function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function generateCountingProblem(totalScore, currentLevel, maxNumber = null) {
  // Генерируем два числа в зависимости от уровня и общего количества очков
  let maxNum
  
  // Если передано максимальное число из настроек класса, используем его
  if (maxNumber !== null) {
    maxNum = maxNumber
  } else {
    // Иначе определяем максимальное число на основе общего количества очков (старая логика)
    if (totalScore < 300) {
      maxNum = 20 // До 300 очков - числа до 20
    } else if (totalScore < 400) {
      maxNum = 30 // 300-399 очков - числа до 30
    } else if (totalScore < 500) {
      maxNum = 40 // 400-499 очков - числа до 40
    } else if (totalScore < 600) {
      maxNum = 50 // 500-599 очков - числа до 50
    } else if (totalScore < 700) {
      maxNum = 60 // 600-699 очков - числа до 60
    } else if (totalScore < 800) {
      maxNum = 70 // 700-799 очков - числа до 70
    } else if (totalScore < 900) {
      maxNum = 80 // 800-899 очков - числа до 80
    } else if (totalScore < 1000) {
      maxNum = 90 // 900-999 очков - числа до 90
    } else {
      maxNum = 100 // 1000+ очков - числа до 100
    }
  }
  
  // Генерируем числа с учетом ограничений
  let num1, num2, correctAnswer
  const isAddition = Math.random() > 0.5
  
  if (isAddition) {
    // Для сложения генерируем числа так, чтобы сумма не превышала maxNum
    num1 = Math.floor(Math.random() * (maxNum - 1)) + 1
    // Второе число генерируем с учетом того, чтобы сумма не превышала maxNum
    const maxNum2 = maxNum - num1
    num2 = Math.floor(Math.random() * Math.max(1, maxNum2)) + 1
    correctAnswer = num1 + num2
  } else {
    // Для вычитания генерируем числа так, чтобы первое число было в пределах maxNum
    num1 = Math.floor(Math.random() * (maxNum - 1)) + 1
    num2 = Math.floor(Math.random() * num1) + 1
    correctAnswer = num1 - num2
  }
  
  // Вычисляем выражение
  const expression = isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`
  
  // Генерируем неправильные варианты ответов
  const wrongAnswers = generateWrongCountingAnswers(correctAnswer, isAddition)
  
  // Собираем все варианты и перемешиваем
  const allOptions = [correctAnswer, ...wrongAnswers]
  const shuffled = shuffleArray(allOptions)
  const correctIndex = shuffled.indexOf(correctAnswer)
  
  return {
    expression: expression,
    options: shuffled,
    correctIndex: correctIndex
  }
}

export function generateWrongCountingAnswers(correctAnswer, isAddition) {
  const wrongAnswers = []
  
  // Генерируем три неправильных ответа
  while (wrongAnswers.length < 3) {
    let wrongAnswer
    
    // Разные стратегии генерации неправильных ответов
    const strategy = Math.floor(Math.random() * 4)
    
    switch (strategy) {
      case 0:
        // Ответ близкий к правильному (±1-5)
        const offset = Math.floor(Math.random() * 5) + 1
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset)
        break
      case 1:
        // Ответ с ошибкой в последней цифре
        const lastDigit = correctAnswer % 10
        const newLastDigit = (lastDigit + Math.floor(Math.random() * 9) + 1) % 10
        wrongAnswer = Math.floor(correctAnswer / 10) * 10 + newLastDigit
        break
      case 2:
        // Ответ с ошибкой в десятках (если возможно)
        if (correctAnswer >= 10) {
          const tens = Math.floor(correctAnswer / 10)
          const newTens = Math.max(1, tens + (Math.random() > 0.5 ? 1 : -1))
          wrongAnswer = newTens * 10 + (correctAnswer % 10)
        } else {
          // Для чисел меньше 10 просто добавляем/вычитаем
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 10 : -10)
        }
        break
      case 3:
        // Умножение или деление правильного ответа на 2 (если это дает разумный результат)
        if (correctAnswer % 2 === 0 && correctAnswer / 2 > 0) {
          wrongAnswer = correctAnswer / 2
        } else if (correctAnswer * 2 < 200) {
          wrongAnswer = correctAnswer * 2
        } else {
          // Запасной вариант
          wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10
        }
        break
    }
    
    // Убеждаемся, что ответ положительный и не совпадает с правильным
    wrongAnswer = Math.max(0, wrongAnswer)
    
    // Проверяем, что такого ответа еще нет
    if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
      wrongAnswers.push(wrongAnswer)
    }
  }
  
  return wrongAnswers
}

export function generateDecompositionProblem(maxNumber = null) {
  // Генерируем два числа, большее всегда слева
  let maxNum = maxNumber || 50
  
  // Убеждаемся, что минимальное значение достаточно для разложения (минимум 10 для первого числа)
  maxNum = Math.max(maxNum, 20)
  
  // Генерируем числа с учетом максимального значения
  let num1 = Math.floor(Math.random() * (maxNum - 10)) + 10  // от 10 до maxNum
  let num2 = Math.floor(Math.random() * Math.min(num1, maxNum/2)) + 1  // второе число не больше первого и не больше половины maxNum
  
  if (num2 > num1) {
    ;[num1, num2] = [num2, num1]
  }
  
  // Выбираем операцию
  const isAddition = Math.random() > 0.5
  
  let correctOption, wrongOptions = []
  
  if (isAddition) {
    // Сложение
    correctOption = generateAdditionOption(num1, num2)
    wrongOptions = generateWrongAdditionOptions(num1, num2, correctOption)
  } else {
    // Вычитание
    correctOption = generateSubtractionOption(num1, num2)
    wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)
  }
  
  // Собираем все варианты и перемешиваем
  const allOptions = [correctOption, ...wrongOptions]
  const shuffled = shuffleArray(allOptions)
  const correctIndex = shuffled.indexOf(correctOption)
  
  return {
    expression: isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`,
    options: shuffled,
    correctIndex: correctIndex
  }
}

function generateAdditionOption(num1, num2) {
  // Раскладываем только если есть переход через десяток
  const lastDigit1 = num1 % 10
  const lastDigit2 = num2 % 10
  
  // Проверяем, есть ли переход через десяток (сумма единиц >= 10)
  if (lastDigit1 + lastDigit2 >= 10) {
    // Есть переход через десяток - раскладываем
    if (num2 <= 9) {
      // Однозначное число - раскладываем чтобы дополнить до круглого десятка
      const neededForRound = 10 - lastDigit1
      
      // Раскладываем, чтобы дополнить до круглого десятка
      const part1 = neededForRound
      const part2 = num2 - neededForRound
      
      // Проверяем, не равен ли part2 нулю
      if (part2 === 0) {
        return `${num1} + ${part1}`
      } else {
        return `${num1} + ${part1} + ${part2}`
      }
    } else {
      // Двузначное число - раскладываем на десятки и единицы
      const tens = Math.floor(num2 / 10) * 10
      const remainder = num2 - tens
      
      // Если остаток 0, не раскладываем вообще
      if (remainder === 0) {
        return `${num1} + ${num2}`
      } else {
        return `${num1} + ${tens} + ${remainder}`
      }
    }
  } else {
    // Нет перехода через десяток - не раскладываем
    return `${num1} + ${num2}`
  }
}

function generateSubtractionOption(num1, num2) {
  // Раскладываем только если есть переход через десяток
  const lastDigit1 = num1 % 10
  const lastDigit2 = num2 % 10
  
  // Проверяем, есть ли переход через десяток (единицы второго числа больше единиц первого)
  if (lastDigit2 > lastDigit1) {
    // Есть переход через десяток - раскладываем
    if (num2 <= 9) {
      // Однозначное второе число
      const roundPart = lastDigit1
      const remainder = num2 - roundPart
      
      // Проверяем, чтобы не было отрицательных чисел или нуля
      if (remainder <= 0) {
        return `${num1} - ${num2}`
      }
      return `${num1} - ${roundPart} - ${remainder}`
    } else {
      // Двузначное второе число - раскладываем на десятки и единицы
      const tens = Math.floor(num2 / 10) * 10
      const remainder = num2 - tens
      
      if (remainder === 0) {
        // Если остаток 0, не включаем его в выражение
        return `${num1} - ${tens}`
      } else {
        return `${num1} - ${tens} - ${remainder}`
      }
    }
  } else {
    // Нет перехода через десяток - не раскладываем
    return `${num1} - ${num2}`
  }
}

function generateWrongAdditionOptions(num1, num2, correctOption) {
  const wrongOptions = []
  
  // Разбираем правильный вариант
  const parts = correctOption.split(' + ')
  const mainNum = parseInt(parts[0])
  
  if (parts.length === 2) {
    // Простое сложение - создаем варианты с разложением на 2 числа
    const half1 = Math.floor(num2 / 2)
    const half2 = Math.ceil(num2 / 2)
    
    // Вариант с разложением на 2 числа, дающий правильную сумму
    if (half1 !== 0 && half2 !== 0) {
      wrongOptions.push(`${mainNum} + ${half1} + ${half2}`)
    }
    
    // Вариант с разложением на 2 числа, дающий правильную сумму
    if (num2 - 1 !== 0) {
      wrongOptions.push(`${mainNum} + ${num2 - 1} + 1`)
    }
    
    // Вариант с измененным вторым числом
    wrongOptions.push(`${mainNum} + ${num2 + 1}`)
  } else {
    // Разложенное сложение - создаем варианты с разложением на 2 числа
    const part1 = parseInt(parts[1])
    const part2 = parseInt(parts[2])
    
    // Вариант 1: объединяем части и меняем на другое разложение
    const combined = part1 + part2
    if (combined > 2) {
      const newPart1 = Math.floor(combined / 2)
      const newPart2 = combined - newPart1
      if (newPart1 !== part1 && newPart2 !== part2) {
        wrongOptions.push(`${mainNum} + ${newPart1} + ${newPart2}`)
      }
    }
    
    // Вариант 2: меняем первое слагаемое и компенсируем во втором
    if (part1 > 1) {
      wrongOptions.push(`${mainNum} + ${part1 - 1} + ${part2 + 1}`)
    }
    
    // Вариант 3: меняем второе слагаемое и компенсируем в первом
    if (part2 > 1) {
      wrongOptions.push(`${mainNum} + ${part1 + 1} + ${part2 - 1}`)
    }
  }
  
  return shuffleArray(wrongOptions).slice(0, 3)
}

export function generateWrongSubtractionOptions(num1, num2, correctOption) {
  const wrongOptions = []
  
  if (correctOption.split(' - ').length === 3) {
    // Разбираем правильный вариант с разложением
    const parts = correctOption.split(' - ')
    const mainNum = parseInt(parts[0])
    const part1 = parseInt(parts[1])
    const part2 = parseInt(parts[2])
    
    // Неправильные варианты для разложенного вычитания с 2 числами
    if (part2 + 1 > 0) {
      wrongOptions.push(`${mainNum} - ${part1} - ${part2 + 1}`)
    }
    if (part1 + 1 < num2) {
      wrongOptions.push(`${mainNum} - ${part1 + 1} - ${part2}`)
    }
    
    // Третий вариант зависит от типа разложения
    if (num2 <= 9) {
      // Для однозначного - создаем вариант с другим разложением
      const lastDigit = num1 % 10
      if (lastDigit > 1 && num2 - lastDigit + 1 > 0) {
        const remainder = num2 - lastDigit + 1
        // Проверяем, не равен ли remainder нулю
        if (remainder !== 0) {
          wrongOptions.push(`${mainNum} - ${lastDigit - 1} - ${remainder}`)
        } else {
          wrongOptions.push(`${mainNum} - ${lastDigit - 1}`)
        }
      } else {
        wrongOptions.push(`${mainNum} - ${num2 + 1}`)
      }
    } else {
      // Для двузначного - меняем десятки и единицы
      if (part1 - 10 > 0 && part2 + 10 < num2) {
        wrongOptions.push(`${mainNum} - ${part1 - 10} - ${part2 + 10}`)
      } else {
        wrongOptions.push(`${mainNum} - ${num2 + 1}`)
      }
    }
  } else {
    // Неправильные варианты для простого вычитания
    const lastDigit = num1 % 10
    
    // Создаем варианты с разложением на 2 числа, дающие правильную разность
    if (lastDigit > 0 && num2 - lastDigit > 0 && num1 % 10 !== 0) {
      const remainder = num2 - lastDigit
      // Проверяем, не равен ли remainder нулю
      if (remainder !== 0) {
        wrongOptions.push(`${num1} - ${lastDigit} - ${remainder}`)
      } else {
        wrongOptions.push(`${num1} - ${lastDigit}`)
      }
    }
    if (lastDigit > 1 && num2 - lastDigit - 1 > 0 && num1 % 10 !== 0) {
      const remainder = num2 - lastDigit - 1
      // Проверяем, не равен ли remainder нулю
      if (remainder !== 0) {
        wrongOptions.push(`${num1} - ${lastDigit + 1} - ${remainder}`)
      } else {
        wrongOptions.push(`${num1} - ${lastDigit + 1}`)
      }
    }
    wrongOptions.push(`${num1} - ${num2 + 1}`)
  }
  
  return shuffleArray(wrongOptions).slice(0, 3)
}

// Функция для генерации примеров таблицы умножения
export function generateMultiplicationProblem(maxMultiplier = 2) {
  // Генерируем два множителя
  // Первый множитель - в пределах доступного уровня
  const multiplier1 = Math.floor(Math.random() * maxMultiplier) + 1
  // Второй множитель - всегда от 1 до 10
  const multiplier2 = Math.floor(Math.random() * 10) + 1
  
  // Вычисляем правильный ответ
  const correctAnswer = multiplier1 * multiplier2
  
  // Генерируем неправильные варианты ответов
  const wrongAnswers = generateWrongMultiplicationAnswers(correctAnswer, multiplier1, multiplier2)
  
  // Собираем все варианты и перемешиваем
  const allOptions = [correctAnswer, ...wrongAnswers]
  const shuffled = shuffleArray(allOptions)
  const correctIndex = shuffled.indexOf(correctAnswer)
  
  return {
    expression: `${multiplier1} × ${multiplier2}`,
    options: shuffled,
    correctIndex: correctIndex,
    multiplier1: multiplier1,
    multiplier2: multiplier2,
    maxMultiplier: maxMultiplier
  }
}

// Функция для генерации неправильных ответов для умножения
function generateWrongMultiplicationAnswers(correctAnswer, multiplier1, multiplier2) {
  const wrongAnswers = []
  
  // Генерируем три неправильных ответа
  while (wrongAnswers.length < 3) {
    let wrongAnswer
    
    // Разные стратегии генерации неправильных ответов
    const strategy = Math.floor(Math.random() * 5)
    
    switch (strategy) {
      case 0:
        // Ответ близкий к правильному (±1-5)
        const offset = Math.floor(Math.random() * 5) + 1
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset)
        break
      case 1:
        // Умножение на соседнее число
        const neighborMultiplier = Math.max(1, multiplier1 + (Math.random() > 0.5 ? 1 : -1))
        wrongAnswer = neighborMultiplier * multiplier2
        break
      case 2:
        // Умножение второго множителя на соседнее число
        const neighborMultiplier2 = Math.max(1, multiplier2 + (Math.random() > 0.5 ? 1 : -1))
        wrongAnswer = multiplier1 * neighborMultiplier2
        break
      case 3:
        // Сложение вместо умножения
        wrongAnswer = multiplier1 + multiplier2
        break
      case 4:
        // Умножение на 2 или деление на 2 (если возможно)
        if (correctAnswer % 2 === 0 && correctAnswer / 2 > 0) {
          wrongAnswer = correctAnswer / 2
        } else {
          wrongAnswer = correctAnswer * 2
        }
        break
    }
    
    // Убеждаемся, что ответ положительный и не совпадает с правильным
    wrongAnswer = Math.max(0, wrongAnswer)
    
    // Проверяем, что такого ответа еще нет
    if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
      wrongAnswers.push(wrongAnswer)
    }
  }
  
  return wrongAnswers
}

// Функция для определения доступных уровней умножения на основе очков
export function getAvailableMultiplicationLevels(totalScore) {
  const levels = []
  
  // Уровень 2 (таблица умножения на 2) доступен сразу
  levels.push({
    multiplier: 2,
    requiredScore: 0,
    available: true,
    name: "Таблица на 2",
    pointsPerCorrect: 10
  })
  
  // Уровень 3 (таблица умножения на 3) доступен после 50 очков
  levels.push({
    multiplier: 3,
    requiredScore: 50,
    available: totalScore >= 50,
    name: "Таблица на 3",
    pointsPerCorrect: 15
  })
  
  // Уровень 4 (таблица умножения на 4) доступен после 150 очков
  levels.push({
    multiplier: 4,
    requiredScore: 150,
    available: totalScore >= 150,
    name: "Таблица на 4",
    pointsPerCorrect: 20
  })
  
  // Уровень 5 (таблица умножения на 5) доступен после 300 очков
  levels.push({
    multiplier: 5,
    requiredScore: 300,
    available: totalScore >= 300,
    name: "Таблица на 5",
    pointsPerCorrect: 25
  })
  
  // Уровень 6 (таблица умножения на 6) доступен после 500 очков
  levels.push({
    multiplier: 6,
    requiredScore: 500,
    available: totalScore >= 500,
    name: "Таблица на 6",
    pointsPerCorrect: 30
  })
  
  // Уровень 7 (таблица умножения на 7) доступен после 750 очков
  levels.push({
    multiplier: 7,
    requiredScore: 750,
    available: totalScore >= 750,
    name: "Таблица на 7",
    pointsPerCorrect: 35
  })
  
  // Уровень 8 (таблица умножения на 8) доступен после 1050 очков
  levels.push({
    multiplier: 8,
    requiredScore: 1050,
    available: totalScore >= 1050,
    name: "Таблица на 8",
    pointsPerCorrect: 40
  })
  
  // Уровень 9 (таблица умножения на 9) доступен после 1400 очков
  levels.push({
    multiplier: 9,
    requiredScore: 1400,
    available: totalScore >= 1400,
    name: "Таблица на 9",
    pointsPerCorrect: 45
  })
  
  // Уровень 10 (таблица умножения на 10) доступен после 1800 очков
  levels.push({
    multiplier: 10,
    requiredScore: 1800,
    available: totalScore >= 1800,
    name: "Таблица на 10",
    pointsPerCorrect: 50
  })
  
  return levels
}