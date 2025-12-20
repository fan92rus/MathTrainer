# Тесты для Math Helpers

Этот каталог содержит тесты для утилитарных функций математических операций в `src/utils/mathHelpers.js`.

## Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить тесты в режиме наблюдения
npm run test:watch

# Запустить тесты с покрытием кода
npm run test:coverage
```

## Структура тестов

- `generateDecompositionProblem` - тесты для функции генерации примеров разложения
- `generateFirstGradeDecompositionProblem` - тесты для функции генерации примеров разложения для 1 класса
- `shuffleArray` - тесты для функции перемешивания массива

## Покрытие edge cases

Тесты покрывают следующие граничные случаи:

1. **Первое число не меньше 10** - проверяет, что первое число в примерах разложения всегда не меньше 10
2. **Сложение с переходом через десяток** - проверяет корректное разложение при сложении с переходом через десяток
3. **Сложение без перехода через десяток** - проверяет, что разложение не происходит при отсутствии перехода
4. **Вычитание с переходом через десяток** - проверяет корректное разложение при вычитании с переходом через десяток
5. **Вычитание без перехода через десяток** - проверяет, что разложение не происходит при отсутствии перехода
6. **Разложение двузначных чисел** - проверяет корректное разложение двузначных чисел на десятки и единицы

## Особенности реализации

- Используется мокинг `Math.random()` для предсказуемых результатов
- Тесты проверяют как логику генерации примеров, так и корректность разложения
- Покрытие включает проверку граничных случаев и основных сценариев использования

## Проблемы с памятью и их решения

### Обнаруженные проблемы

Некоторые тестовые файлы вызывают переполнение памяти JavaScript heap:

- `mathHelpers.test.js` - избыточные циклы с большим количеством итераций
- `mathHelpers.counting.test.js` - проблемы с функциями генерации неправильных ответов
- `mathHelpers.multiplication.test.js` - проблемы с функциями генерации неправильных ответов

### Рабочие тестовые файлы

Следующие файлы работают корректно:

- `mathHelpers.decomposition.test.js` - тесты разложения чисел
- `mathHelpers.levels.test.js` - тесты уровней умножения
- `mathHelpers.wrongOptions.test.js` - тесты генерации неправильных вариантов
- `mathHelpers.minimal.test.js` - базовые тесты
- `mathHelpers.isolated.test.js` - изолированные тесты
- `mathHelpers.counting.isolated.test.js` - изолированные тесты подсчета
- `mathHelpers.decomposition.isolated.test.js` - изолированные тесты разложения
- `mathHelpers.multiplication.isolated.test.js` - изолированные тесты умножения
- `mathHelpers.memory.test.js` - тесты функций с проблемами памяти

### Рекомендации по запуску тестов

1. Используйте команду с увеличенным лимитом памяти:

   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096 && npx jest --maxWorkers=1
   ```

2. Запускайте тесты по одному файлу для отладки:

   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096 && npx jest src/utils/__tests__/mathHelpers.memory.test.js --maxWorkers=1
   ```

3. Избегайте запуска проблемных файлов вместе с другими тестами.

4. Для полного набора тестов используйте только рабочие файлы:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096 && npx jest src/utils/__tests__/mathHelpers.decomposition.test.js src/utils/__tests__/mathHelpers.levels.test.js src/utils/__tests__/mathHelpers.wrongOptions.test.js src/utils/__tests__/mathHelpers.minimal.test.js src/utils/__tests__/mathHelpers.isolated.test.js src/utils/__tests__/mathHelpers.counting.isolated.test.js src/utils/__tests__/mathHelpers.decomposition.isolated.test.js src/utils/__tests__/mathHelpers.multiplication.isolated.test.js src/utils/__tests__/mathHelpers.memory.test.js --maxWorkers=1
   ```
