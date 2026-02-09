/**
 * Базовые типы для математических операций
 * Определяет четыре основных математических действия
 */
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'equation';

/**
 * Доступные классы обучения
 * Соответствует начальным классам общеобразовательной школы
 */
export type GradeLevel = 1 | 2 | 3 | 4;

/**
 * Интерфейс для математической задачи
 * Содержит всю информацию об одном математическом примере
 */
export interface MathProblem {
  /** Уникальный идентификатор задачи */
  id?: string;
  /** Математическое выражение в виде строки (например, "2 + 3") */
  expression: string;
  /** Тип математической операции */
  operation: MathOperation;
  /** Первое число в выражении */
  num1: number;
  /** Второе число в выражении */
  num2: number;
  /** Правильный ответ */
  correctAnswer: number;
  /** Массив вариантов ответов для выбора */
  options: string[];
  /** Индекс правильного ответа в массиве options */
  correctIndex: number;
  /** Уровень сложности задачи (1-10) */
  difficulty: number;
  /** Детали разложения для ручного режима (опционально) */
  decompositionDetails?: {
    firstPart: number;
    secondPart: number;
    intermediateResult: number;
  };
}

/**
 * Интерфейс для игрового состояния
 * Описывает текущее состояние игровой сессии
 */
export interface GameState {
  /** Текущий счет за игру */
  score: number;
  /** Общий счет пользователя */
  totalScore: number;
  /** Номер текущего вопроса */
  currentQuestion: number;
  /** Общее количество вопросов в игре */
  totalQuestions: number;
  /** Флаг ответа на текущий вопрос */
  answered: boolean;
  /** Индекс выбранного ответа */
  selectedIndex: number | null;
  /** Флаг завершения игры */
  gameOver: boolean;
  /** Текущий уровень сложности */
  currentLevel: number;
  /** Массив задач в текущей игре */
  problems: MathProblem[];
  /** Время начала игры в миллисекундах */
  startTime?: number;
  /** Время окончания игры в миллисекундах */
  endTime?: number;
}

/**
 * Интерфейс для настроек игры
 * Содержит параметры конфигурации игровой сессии
 */
export interface GameSettings {
  /** Выбранный класс обучения */
  grade: GradeLevel;
  /** Тип математической операции */
  operation: MathOperation;
  /** Уровень сложности */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Ограничение времени в секундах */
  timeLimit?: number;
  /** Включить звуковые эффекты */
  enableSound: boolean;
  /** Включить анимации */
  enableAnimations: boolean;
}

/**
 * Интерфейс для результатов игры
 * Содержит статистику и итоги игровой сессии
 */
export interface GameResult {
  /** Количество набранных очков за игру */
  score: number;
  /** Общий счет пользователя */
  totalScore: number;
  /** Количество правильных ответов */
  correctAnswers: number;
  /** Общее количество ответов */
  totalAnswers: number;
  /** Время, потраченное на игру в миллисекундах */
  timeSpent: number;
  /** Среднее время на один вопрос в миллисекундах */
  averageTime: number;
  /** Полученные достижения */
  achievements: Achievement[];
}

/**
 * Интерфейс для достижений
 * Описывает игровое достижение, которое может разблокировать игрок
 */
export interface Achievement {
  /** Уникальный идентификатор достижения */
  id: string;
  /** Название достижения */
  name: string;
  /** Описание условий получения */
  description: string;
  /** Иконка или эмодзи для отображения */
  icon: string;
  /** Дата и время разблокировки */
  unlockedAt?: Date;
}

/**
 * Интерфейс для элемента в localStorage
 * Используется для хранения данных в браузере
 */
export interface StorageItem {
  /** Ключ для хранения данных */
  key: string;
  /** Значение любого типа */
  value: unknown;
  /** Временная метка создания или обновления */
  timestamp?: number;
}

/**
 * Интерфейс для ответа API
 * Универсальный интерфейс для ответов от сервера
 * @template T - тип данных в ответе
 */
export interface ApiResponse<T = unknown> {
  /** Основные данные ответа */
  data: T;
  /** Флаг успешного выполнения запроса */
  success: boolean;
  /** Сообщение об ошибке, если запрос неуспешен */
  error?: string;
}

/**
 * Интерфейс для опций генерации задач
 * Определяет параметры для создания математических примеров
 */
export interface ProblemGenerationOptions {
  /** Максимальное число в примерах */
  maxNumber: number;
  /** Тип математической операции */
  operation: MathOperation;
  /** Разрешить отрицательные результаты */
  allowNegative?: boolean;
  /** Разрешить ноль в примерах */
  allowZero?: boolean;
  /** Уровень сложности */
  difficulty?: number;
}

/**
 * Интерфейс для стратегии генерации неправильных ответов
 * Определяет способы создания правдоподобных неверных вариантов
 */
export interface WrongAnswerStrategy {
  /** Тип стратегии генерации неправильных ответов */
  type: 'close' | 'digit_error' | 'tens_error' | 'double_half' | 'deceptive';
  /** Вес стратегии (от 0 до 1) для частоты использования */
  weight: number;
}

/**
 * Тип для результата генерации разложения числа для 1 класса
 */
export interface FirstGradeDecompositionProblem {
  expression: string;
  options: string[];
  correctIndex: number;
  targetNumber: number;
  correctDecomposition: [number, number];
}

/**
 * Тип для конфигурации уровня умножения
 */
export interface MultiplicationLevel {
  multiplier: number;
  maxMultiplier: number;
  requiredScore: number;
  level: number;
  description: string;
  examples: string[];
  available: boolean;
  name: string;
  pointsPerCorrect: number;
}

/**
 * Интерфейс для задачи на умножение
 */
export interface MultiplicationProblem {
  expression: string;
  operation: MathOperation;
  num1: number;
  num2: number;
  correctAnswer: number;
  options: string[];
  correctIndex: number;
  difficulty: number;
  maxMultiplier: number;
}

/**
 * Интерфейс для конфигурации уровня уравнений
 */
export interface EquationsLevelConfig {
  level: number;
  maxNumber: number;
  minNumber: number;
  equationTypes: Array<'simple' | 'with-parentheses' | 'with-multiplication'>;
  description: string;
  example: string;
  complexity: number;
  requiredScore?: number;
}

/**
 * Интерфейс для информации о следующем уровне
 */
export interface NextLevelInfo {
  currentLevel: number;
  nextLevel: number | null;
  scoreNeeded: number;
  nextLevelConfig: EquationsLevelConfig | null;
}

/**
 * Интерфейс для задачи на уравнение
 */
export interface EquationProblem {
  expression: string;
  operation: MathOperation;
  num1: number;
  num2: number;
  correctAnswer: number;
  options: string[];
  correctIndex: number;
  difficulty: number;
  xValue: number;
  equationType: string;
}

/**
 * Интерфейс для задачи на вычитание в столбик
 * Специфический тип для упражнения Column Subtraction
 */
export interface ColumnSubtractionProblem {
  /** Уникальный идентификатор задачи */
  id?: string;
  /** Уменьшаемое (верхнее число) */
  minuend: number;
  /** Вычитаемое (нижнее число) */
  subtrahend: number;
  /** Разность (результат) */
  result: number;
  /** Требуется ли заимствование из десятков */
  needsBorrowing: boolean;
  /** Заимствование из десятков (конкретный случай) */
  borrowFromTens: boolean;
  /** Ноль в единицах уменьшаемого (например, 40-13) */
  hasZeroInUnits: boolean;
  /** Математическое выражение в виде строки (например, "52 - 17") */
  expression: string;
  /** Правильный ответ */
  correctAnswer: number;
  /** Массив вариантов ответов для выбора */
  options: string[];
  /** Индекс правильного ответа в массиве options */
  correctIndex: number;
  /** Уровень сложности задачи (1-10) */
  difficulty: number;
  /** Тип операции для совместимости с MathProblem */
  operation: MathOperation;
  /** Первое число для совместимости с MathProblem (等于 minuend) */
  num1: number;
  /** Второе число для совместимости с MathProblem (等于 subtrahend) */
  num2: number;
}
