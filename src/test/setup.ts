import { config } from '@vue/test-utils'

// Mock localStorage (оптимизация - без вызова vi.fn для каждого свойства)
const localStorageMock = (() => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Global test configuration
config.global.mocks = {
  $t: (key: string) => key
}

// Оптимизация: отключаем console.log в тестах для скорости
// (можно включить через DEBUG=true)
if (process.env.DEBUG !== 'true') {
  const originalLog = console.log
  console.log = (...args: any[]) => {
    // Пропускаем логи из тестов
    if (typeof args[0] === 'string' && args[0].includes('Неправильный ответ!')) return
    if (typeof args[0] === 'string' && args[0].includes('Правильный ответ!')) return
    originalLog.apply(console, args)
  }
}