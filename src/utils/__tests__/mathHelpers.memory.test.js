import { 
  generateWrongCountingAnswers,
  generateWrongSubtractionOptions
} from '../mathHelpers.js'

describe('Math Helpers - Memory Tests', () => {
  test('generateWrongCountingAnswers', () => {
    const correctAnswer = 25
    const wrongAnswers = generateWrongCountingAnswers(correctAnswer, true)
    
    expect(wrongAnswers).toHaveLength(3)
    const uniqueAnswers = [...new Set(wrongAnswers)]
    expect(uniqueAnswers).toHaveLength(3)
    expect(wrongAnswers).not.toContain(correctAnswer)
  })

  test('generateWrongSubtractionOptions', () => {
    const num1 = 69
    const num2 = 49
    const correctOption = `${num1} - 40 - 9`
    const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption)
    
    expect(wrongOptions).toHaveLength(3)
    const uniqueOptions = [...new Set(wrongOptions)]
    expect(uniqueOptions).toHaveLength(3)
    expect(wrongOptions).not.toContain(correctOption)
  })
})