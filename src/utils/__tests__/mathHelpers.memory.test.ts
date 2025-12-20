import { generateWrongCountingAnswers, generateWrongSubtractionOptions } from '../mathHelpers';

describe('Math Helpers  - Memory Tests', () => {
  test('generateWrongCountingAnswers', () => {
    const correctAnswer: number = 25;
    const wrongAnswers = generateWrongCountingAnswers(correctAnswer, true);

    expect(wrongAnswers).toHaveLength(3);
    const uniqueAnswers = [...new Set(wrongAnswers)];
    expect(uniqueAnswers).toHaveLength(3);
    expect(wrongAnswers).not.toContain(correctAnswer.toString());
  });

  test('generateWrongSubtractionOptions', () => {
    const num1: number = 69;
    const num2: number = 49;
    const correctOption: string = `${num1}  - 40  - 9`;
    const wrongOptions = generateWrongSubtractionOptions(num1, num2, correctOption);

    expect(wrongOptions).toHaveLength(3);
    const uniqueOptions = [...new Set(wrongOptions)];
    expect(uniqueOptions).toHaveLength(3);
    expect(wrongOptions).not.toContain(correctOption);
  });
});