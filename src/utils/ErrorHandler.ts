/**
 * Централизованная система обработки ошибок
 */
class ErrorHandler {
  // Словарь常见 ошибок и их пользовательских сообщений
  private static errorMessages: Record<string, string> = {
    // Ошибки Babylon.js
    'Babylon.js error': 'Произошла ошибка при загрузке 3D-сцены. Пожалуйста, обновите страницу.',
    'WebGL not supported': 'Ваш браузер не поддерживает WebGL. Пожалуйста, используйте современный браузер.',
    'Failed to load texture': 'Не удалось загрузить текстуру. Пожалуйста, проверьте подключение к интернету.',
    
    // Ошибки загрузки зданий
    'Failed to load building': 'Не удалось загрузить здание. Пожалуйста, попробуйте еще раз.',
    'Building not found': 'Здание не найдено. Пожалуйста, выберите другое здание.',
    'Invalid building data': 'Некорректные данные здания. Пожалуйста, обратитесь к разработчику.',
    
    // Ошибки сети
    'Network error': 'Ошибка сети. Пожалуйста, проверьте подключение к интернету.',
    'Failed to fetch': 'Не удалось загрузить данные. Пожалуйста, попробуйте еще раз.',
    
    // Общие ошибки
    'Permission denied': 'Доступ запрещен. Пожалуйста, войдите в систему.',
    'Invalid data': 'Некорректные данные. Пожалуйста, проверьте введенную информацию.',
    'Unknown error': 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.',
  };

  /**
   * Обрабатывает ошибку и логирует ее
   * @param error - объект ошибки
   * @param context - контекст, в котором произошла ошибка
   */
  static handle(error: Error, context?: string): void {
    const contextStr = context ? `[${context}]` : '';
    const errorMessage = `${contextStr} ${error.name}: ${error.message}`;
    
    // Логируем в консоль с форматированием
    this.log(errorMessage, 'error');
    
    // Если есть стек вызовов, также логируем его
    if (error.stack) {
      console.groupCollapsed(`${contextStr} Стек вызовов:`);
      console.log(error.stack);
      console.groupEnd();
    }
  }

  /**
   * Логирует сообщение с указанным уровнем
   * @param message - сообщение для логирования
   * @param level - уровень логирования
   */
  static log(message: string, level: 'info' | 'warn' | 'error'): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'info':
        console.info(`%c${formattedMessage}`, 'color: #2196F3; font-weight: bold;');
        break;
      case 'warn':
        console.warn(`%c${formattedMessage}`, 'color: #FF9800; font-weight: bold;');
        break;
      case 'error':
        console.error(`%c${formattedMessage}`, 'color: #F44336; font-weight: bold;');
        break;
    }
  }

  /**
   * Преобразует техническую ошибку в пользовательское сообщение
   * @param error - объект ошибки
   * @returns пользовательское сообщение об ошибке
   */
  static getUserMessage(error: Error): string {
    const errorMessage = error.message;
    
    // Ищем совпадение в словаре ошибок
    for (const [key, value] of Object.entries(this.errorMessages)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // Если совпадение не найдено, возвращаем общее сообщение
    return this.errorMessages['Unknown error'] || 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.';
  }

  /**
   * Показывает пользователю сообщение
   * @param message - сообщение для пользователя
   * @param type - тип сообщения
   */
  static showUserMessage(message: string, type: 'success' | 'error' | 'info'): void {
    // Создаем пользовательское событие для глобальной обработки уведомлений
    const event = new CustomEvent('user-notification', {
      detail: {
        message,
        type,
        timestamp: new Date().toISOString()
      }
    });
    
    // Отправляем событие
    document.dispatchEvent(event);
    
    // Если нет глобального обработчика, используем alert как запасной вариант
    setTimeout(() => {
      if (type === 'error') {
        console.error(`Ошибка: ${message}`);
      } else if (type === 'info') {
        console.log(`Информация: ${message}`);
      } else {
        console.log(`Успех: ${message}`);
      }
    }, 100);
  }

  /**
   * Добавляет новое сообщение об ошибке в словарь
   * @param key - ключ ошибки
   * @param message - пользовательское сообщение
   */
  static addErrorMessage(key: string, message: string): void {
    this.errorMessages[key] = message;
  }
}

export default ErrorHandler;