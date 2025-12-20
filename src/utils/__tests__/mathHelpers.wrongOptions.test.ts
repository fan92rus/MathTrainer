import { generateWrongSubtractionOptions } from '../math';

describe('Math Helpers  - Wrong Options Generation', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateWrongSubtractionOptions', () => {
    test('генерирует уникальные неправильные варианты', () => {
      const num1: number = 69;
      const num2: number = 49;
      const correctOption: string = `${num1}  - 40  - 9`;
      const wrongOptions: string[] = generateWrongSubtractionOptions(num1, num2, correctOption);

      // Проверяем, что сгенерировано 3 варианта
      expect(wrongOptions).toHaveLength(3);

      // Проверяем, что все варианты уникальны
      const uniqueOptions: string[] = [...new Set(wrongOptions)];
      expect(uniqueOptions).toHaveLength(3);

      // Проверяем, что правильный вариант отсутствует
      expect(wrongOptions).not.toContain(correctOption);
    });
  });
});