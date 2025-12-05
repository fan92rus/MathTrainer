import {
  generateWrongSubtractionOptions
} from '../mathHelpers.js'

// Мокаем Math.random для предсказуемых результатов
const mockMathRandom = (values) => {
  let index = 0
  Math.random = jest.fn(() => values[index++ % values.length])
}

describe('Math Helpers - Wrong Options Generation', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateWrongSubtractionOptions', () => {
    test('генерирует уникальные неправильные варианты', () => {
      const num1 = 69
      const num2 = 49
      const correctOption = `${num1} - 40 - 9`
      const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)
      
      // Проверяем, что сгенерировано 3 варианта
      expect(wrongOptions).toHaveLength(3)
      
      // Проверяем, что все варианты уникальны
      const uniqueOptions = [...new Set(wrongOptions)]
      expect(uniqueOptions).toHaveLength(3)
      
      // Проверяем, что правильный вариант отсутствует
      expect(wrongOptions).not.toContain(correctOption)
    })
  })
})