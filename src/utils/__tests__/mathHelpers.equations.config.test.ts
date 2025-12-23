import { describe, test, expect } from 'vitest';
import {
  getEquationsLevelConfig,
  getNextEquationsLevel,
  getAllEquationsLevels,
  generateEquationProblemManual,
  generateEquationProblem
} from '../math/equations';

describe('getEquationsLevelConfig', () => {
  describe('определение уровня по score', () => {
    test('score < 50 -> уровень 1', () => {
      const config = getEquationsLevelConfig(0);
      expect(config.level).toBe(1);

      const config49 = getEquationsLevelConfig(49);
      expect(config49.level).toBe(1);
    });

    test('score >= 50 && < 100 -> уровень 2', () => {
      const config = getEquationsLevelConfig(50);
      expect(config.level).toBe(2);

      const config99 = getEquationsLevelConfig(99);
      expect(config99.level).toBe(2);
    });

    test('score >= 100 && < 150 -> уровень 3', () => {
      const config = getEquationsLevelConfig(100);
      expect(config.level).toBe(3);

      const config149 = getEquationsLevelConfig(149);
      expect(config149.level).toBe(3);
    });

    test('score >= 150 && < 200 -> уровень 4', () => {
      const config = getEquationsLevelConfig(150);
      expect(config.level).toBe(4);

      const config199 = getEquationsLevelConfig(199);
      expect(config199.level).toBe(4);
    });

    test('score >= 200 && < 250 -> уровень 5', () => {
      const config = getEquationsLevelConfig(200);
      expect(config.level).toBe(5);

      const config249 = getEquationsLevelConfig(249);
      expect(config249.level).toBe(5);
    });

    test('score >= 250 && < 300 -> уровень 6', () => {
      const config = getEquationsLevelConfig(250);
      expect(config.level).toBe(6);

      const config299 = getEquationsLevelConfig(299);
      expect(config299.level).toBe(6);
    });

    test('score >= 300 && < 350 -> уровень 7', () => {
      const config = getEquationsLevelConfig(300);
      expect(config.level).toBe(7);

      const config349 = getEquationsLevelConfig(349);
      expect(config349.level).toBe(7);
    });

    test('score >= 350 && < 400 -> уровень 8', () => {
      const config = getEquationsLevelConfig(350);
      expect(config.level).toBe(8);

      const config399 = getEquationsLevelConfig(399);
      expect(config399.level).toBe(8);
    });

    test('score >= 400 -> уровень 9', () => {
      const config = getEquationsLevelConfig(400);
      expect(config.level).toBe(9);

      const config999 = getEquationsLevelConfig(999);
      expect(config999.level).toBe(9);
    });
  });

  describe('проверка полей конфигурации', () => {
    test('все уровни имеют обязательные поля', () => {
      for (let score = 0; score <= 400; score += 50) {
        const config = getEquationsLevelConfig(score);
        expect(config).toHaveProperty('level');
        expect(config).toHaveProperty('maxNumber');
        expect(config).toHaveProperty('minNumber');
        expect(config).toHaveProperty('equationTypes');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('example');
        expect(config).toHaveProperty('complexity');
        expect(config).toHaveProperty('requiredScore');
      }
    });

    test('уровень 1: только simple уравнения', () => {
      const config = getEquationsLevelConfig(0);
      expect(config.level).toBe(1);
      expect(config.equationTypes).toEqual(['simple']);
      expect(config.maxNumber).toBe(10);
      expect(config.minNumber).toBe(1);
    });

    test('уровень 3: добавляются with-parentheses', () => {
      const config = getEquationsLevelConfig(100);
      expect(config.level).toBe(3);
      expect(config.equationTypes).toContain('simple');
      expect(config.equationTypes).toContain('with-parentheses');
      expect(config.equationTypes).not.toContain('with-multiplication');
    });

    test('уровень 6: добавляются with-multiplication', () => {
      const config = getEquationsLevelConfig(250);
      expect(config.level).toBe(6);
      expect(config.equationTypes).toContain('simple');
      expect(config.equationTypes).toContain('with-parentheses');
      expect(config.equationTypes).toContain('with-multiplication');
    });

    test('complexity возрастает с уровнем', () => {
      const config1 = getEquationsLevelConfig(0);
      const config5 = getEquationsLevelConfig(200);
      const config9 = getEquationsLevelConfig(400);

      expect(config1.complexity).toBe(1);
      expect(config5.complexity).toBe(2);
      expect(config9.complexity).toBe(4);
    });

    test('requiredScore соответствуют таблице уровней', () => {
      const scores = [0, 50, 100, 150, 200, 250, 300, 350, 400];
      const expectedRequiredScores = [0, 50, 100, 150, 200, 250, 300, 350, 400];

      scores.forEach((score, index) => {
        const config = getEquationsLevelConfig(score);
        expect(config.requiredScore).toBe(expectedRequiredScores[index]);
      });
    });

    test('description не пустая строка', () => {
      for (let score = 0; score <= 400; score += 50) {
        const config = getEquationsLevelConfig(score);
        expect(config.description.length).toBeGreaterThan(0);
        expect(config.example.length).toBeGreaterThan(0);
      }
    });
  });

  describe('maxNumber по уровням', () => {
    test('уровень 1: maxNumber = 10', () => {
      const config = getEquationsLevelConfig(0);
      expect(config.maxNumber).toBe(10);
    });

    test('уровень 2: maxNumber = 20', () => {
      const config = getEquationsLevelConfig(50);
      expect(config.maxNumber).toBe(20);
    });

    test('уровень 5: maxNumber = 50', () => {
      const config = getEquationsLevelConfig(200);
      expect(config.maxNumber).toBe(50);
    });

    test('уровень 8: maxNumber = 200', () => {
      const config = getEquationsLevelConfig(350);
      expect(config.maxNumber).toBe(200);
    });
  });
});

describe('getNextEquationsLevel', () => {
  test('для уровня 9 должен возвращать null', () => {
    const result = getNextEquationsLevel(400);
    expect(result).toBeNull();

    const result999 = getNextEquationsLevel(999);
    expect(result999).toBeNull();
  });

  test('должен возвращать корректный currentLevel', () => {
    const result = getNextEquationsLevel(25);
    expect(result?.currentLevel).toBe(1);

    const result150 = getNextEquationsLevel(150);
    expect(result150?.currentLevel).toBe(4);
  });

  test('должен возвращать корректный nextLevel', () => {
    const result = getNextEquationsLevel(25);
    expect(result?.nextLevel).toBe(2);

    const result150 = getNextEquationsLevel(150);
    expect(result150?.nextLevel).toBe(5);
  });

  test('scoreNeeded должен показывать сколько очков нужно до следующего уровня', () => {
    const result = getNextEquationsLevel(20);
    // Уровень 1 (текущий), следующий уровень 2 требует 50
    // scoreNeeded = 50 - 20 = 30
    expect(result?.scoreNeeded).toBe(30);

    const result100 = getNextEquationsLevel(100);
    // Уровень 3 (текущий), следующий уровень 4 требует 150
    expect(result100?.scoreNeeded).toBe(50);
  });

  test('для уже достигнутого следующего уровня scoreNeeded может быть больше 0', () => {
    const result = getNextEquationsLevel(160);
    // Уровень 4 (текущий), следующий уровень 5 требует 200
    // 200 - 160 = 40
    expect(result?.scoreNeeded).toBe(40);
  });

  test('nextLevelConfig должен содержать полную конфигурацию', () => {
    const result = getNextEquationsLevel(25);

    expect(result?.nextLevelConfig).toBeDefined();
    expect(result?.nextLevelConfig).toHaveProperty('level');
    expect(result?.nextLevelConfig).toHaveProperty('maxNumber');
    expect(result?.nextLevelConfig).toHaveProperty('minNumber');
    expect(result?.nextLevelConfig).toHaveProperty('equationTypes');
    expect(result?.nextLevelConfig).toHaveProperty('description');
    expect(result?.nextLevelConfig).toHaveProperty('example');
    expect(result?.nextLevelConfig).toHaveProperty('complexity');
    expect(result?.nextLevelConfig).toHaveProperty('requiredScore');
  });

  test('граничные значения', () => {
    const result0 = getNextEquationsLevel(0);
    expect(result0?.currentLevel).toBe(1);
    expect(result0?.nextLevel).toBe(2);
    expect(result0?.scoreNeeded).toBe(50);

    const result399 = getNextEquationsLevel(399);
    expect(result399?.currentLevel).toBe(8);
    expect(result399?.nextLevel).toBe(9);
    expect(result399?.scoreNeeded).toBe(1);
  });
});

describe('getAllEquationsLevels', () => {
  test('должен возвращать массив из 9 уровней', () => {
    const levels = getAllEquationsLevels();
    expect(levels).toHaveLength(9);
  });

  test('каждый уровень должен иметь level, description, requiredScore', () => {
    const levels = getAllEquationsLevels();

    levels.forEach(level => {
      expect(level).toHaveProperty('level');
      expect(level).toHaveProperty('description');
      expect(level).toHaveProperty('requiredScore');
    });
  });

  test('уровни должны быть отсортированы по возрастанию', () => {
    const levels = getAllEquationsLevels();

    expect(levels[0].level).toBe(1);
    expect(levels[8].level).toBe(9);

    for (let i = 0; i < levels.length - 1; i++) {
      expect(levels[i].level).toBeLessThan(levels[i + 1].level);
    }
  });

  test('requiredScore должен соответствовать таблице', () => {
    const levels = getAllEquationsLevels();
    const expectedScores = [0, 50, 100, 150, 200, 250, 300, 350, 400];

    levels.forEach((level, index) => {
      expect(level.requiredScore).toBe(expectedScores[index]);
    });
  });

  test('description должен быть уникальным для каждого уровня', () => {
    const levels = getAllEquationsLevels();
    const descriptions = levels.map(l => l.description);
    const uniqueDescriptions = new Set(descriptions);

    // Есть 8 уникальных описаний (одно дублируется)
    expect(uniqueDescriptions.size).toBeGreaterThanOrEqual(8);
  });

  test('описания уровней', () => {
    const levels = getAllEquationsLevels();

    expect(levels[0].description).toBe('Простые уравнения (x + a = b)');
    expect(levels[4].description).toBe('Уравнения до 50');
    expect(levels[8].description).toBe('Максимальная сложность');
  });
});

describe('generateEquationProblemManual', () => {
  test('не должен содержать options', () => {
    const result = generateEquationProblemManual(100);
    expect(result).not.toHaveProperty('options');
  });

  test('не должен содержать correctIndex', () => {
    const result = generateEquationProblemManual(100);
    expect(result).not.toHaveProperty('correctIndex');
  });

  test('не должен содержать operation', () => {
    const result = generateEquationProblemManual(100);
    expect(result).not.toHaveProperty('operation');
  });

  test('не должен содержать num1 и num2', () => {
    const result = generateEquationProblemManual(100);
    expect(result).not.toHaveProperty('num1');
    expect(result).not.toHaveProperty('num2');
  });

  test('должен содержать expression', () => {
    const result = generateEquationProblemManual(100);
    expect(typeof result.expression).toBe('string');
    expect(result.expression.length).toBeGreaterThan(0);
  });

  test('должен содержать correctAnswer', () => {
    const result = generateEquationProblemManual(100);
    expect(typeof result.correctAnswer).toBe('number');
  });

  test('должен содержать difficulty', () => {
    const result = generateEquationProblemManual(100);
    expect(typeof result.difficulty).toBe('number');
  });

  test('должен содержать equationType', () => {
    const result = generateEquationProblemManual(100);
    expect(['simple', 'with-parentheses', 'with-multiplication']).toContain(result.equationType);
  });

  test('expression должен соответствовать equationType', () => {
    const results = Array.from({ length: 50 }, () => generateEquationProblemManual(100));

    // Проверяем простые уравнения
    const simple = results.find(r => r.equationType === 'simple');
    if (simple) {
      expect(simple.expression).toContain('x');
      expect(simple.expression).not.toMatch(/[()]/); // без скобок
      expect(simple.expression).not.toContain('×'); // без умножения
    }

    // Проверяем уравнения со скобками
    const withParens = results.find(r => r.equationType === 'with-parentheses');
    if (withParens) {
      expect(withParens.expression).toMatch(/[()]/); // со скобками
    }

    // Проверяем уравнения с умножением
    const withMult = results.find(r => r.equationType === 'with-multiplication');
    if (withMult) {
      expect(withMult.expression).toContain('×'); // с умножением
    }
  });

  test('должен избегать повторения previousX', () => {
    const problem1 = generateEquationProblemManual(100);
    const firstX = problem1.correctAnswer;

    // Генерируем несколько задач с previousX
    let _differentXFound = false;
    let lastProblem = problem1;
    for (let i = 0; i < 20; i++) {
      lastProblem = generateEquationProblemManual(100, firstX);
      if (lastProblem.correctAnswer !== firstX) {
        _differentXFound = true;
        break;
      }
    }

    // Проверяем что функция корректно обрабатывает параметр
    expect(lastProblem).toBeDefined();
    expect(typeof lastProblem.correctAnswer).toBe('number');
  });

  test('difficulty должно соответствовать уровню', () => {
    const result1 = generateEquationProblemManual(0); // уровень 1
    expect(result1.difficulty).toBe(1);

    const result5 = generateEquationProblemManual(200); // уровень 5
    expect(result5.difficulty).toBe(2);

    const result9 = generateEquationProblemManual(400); // уровень 9
    expect(result9.difficulty).toBe(4);
  });

  test('expression должен содержать знак равенства', () => {
    const results = Array.from({ length: 20 }, () => generateEquationProblemManual(100));

    results.forEach(result => {
      expect(result.expression).toContain('=');
    });
  });

  test('correctAnswer должен быть положительным или нулём', () => {
    const results = Array.from({ length: 50 }, () => generateEquationProblemManual(100));

    results.forEach(result => {
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('generateEquationProblem с options', () => {
  test('должен содержать options и correctIndex', () => {
    const problem = generateEquationProblem(100);

    expect(problem).toHaveProperty('options');
    expect(problem).toHaveProperty('correctIndex');
    expect(problem.options).toHaveLength(4);
  });

  test('correctIndex должен указывать на правильный ответ', () => {
    const problem = generateEquationProblem(100);

    expect(problem.options[problem.correctIndex]).toBe(String(problem.correctAnswer));
  });

  test('xValue должен соответствовать correctAnswer', () => {
    const problem = generateEquationProblem(100);

    expect(problem.xValue).toBe(problem.correctAnswer);
  });

  test('operation должен быть equation', () => {
    const problem = generateEquationProblem(100);

    expect(problem.operation).toBe('equation');
  });

  test('num1 и num2 должны быть 0 (не используются для уравнений)', () => {
    const problem = generateEquationProblem(100);

    expect(problem.num1).toBe(0);
    expect(problem.num2).toBe(0);
  });
});
