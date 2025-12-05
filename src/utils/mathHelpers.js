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
    expression: `${targetNumber} это ? и ?`,
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
  
  // Убеждаемся, что минимальное значение достаточно для разложения
  maxNum = Math.max(maxNum, 20)
  
  // Генерируем числа с учетом максимального значения
  let num1 = Math.floor(Math.random() * (maxNum - 5)) + 5  // от 5 до maxNum
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
  // Для сложения раскладываем ВТОРОЕ число для удобного счета на 2 числа
  if (num2 <= 9) {
    // Однозначное число - раскладываем чтобы дополнить до круглого десятка
    const lastDigit = num1 % 10
    const neededForRound = 10 - lastDigit
    
    if (num2 >= neededForRound && neededForRound > 0) {
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
      // Просто раскладываем на удобные слагаемые
      const part1 = Math.floor(Math.random() * (num2 - 1)) + 1
      const part2 = num2 - part1
      
      // Проверяем, не равен ли part2 нулю
      if (part2 === 0) {
        return `${num1} + ${part1}`
      } else {
        return `${num1} + ${part1} + ${part2}`
      }
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
}

function generateSubtractionOption(num1, num2) {
  if (num2 <= 9) {
    // Однозначное второе число
    const isFirstRound = num1 % 10 === 0
    const lastDigit = num1 % 10
    
    if (isFirstRound) {
      // Если первое число круглое - не раскладываем
      return `${num1} - ${num2}`
    } else if (num2 <= lastDigit) {
      // Если второе число ≤ последней цифры первого - не раскладываем
      return `${num1} - ${num2}`
    } else {
      // Раскладываем второе число для удобства на 2 числа
      const roundPart = lastDigit
      const remainder = num2 - roundPart
      
      // Проверяем, чтобы не было отрицательных чисел или нуля
      if (remainder <= 0) {
        return `${num1} - ${num2}`
      }
      return `${num1} - ${roundPart} - ${remainder}`
    }
  } else {
    // Двузначное второе число - ВСЕГДА раскладываем второе число на 2 числа
    const tens = Math.floor(num2 / 10) * 10
    const remainder = num2 - tens
    
    if (remainder === 0) {
      // Если остаток 0, не включаем его в выражение
      return `${num1} - ${tens}`
    } else {
      return `${num1} - ${tens} - ${remainder}`
    }
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

function generateWrongSubtractionOptions(num1, num2, correctOption) {
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