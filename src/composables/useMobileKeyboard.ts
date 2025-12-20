import { ref, onMounted, onUnmounted } from 'vue';

export function useMobileKeyboard() {
  const keyboardHeight = ref(0);
  const isKeyboardOpen = ref(false);
  const visualViewport = ref({
    width: 0,
    height: 0,
    offsetTop: 0
  });

  // Функция обновления размеров viewport
  const updateViewport = () => {
    console.log('=== UPDATE VIEWPORT START ===');

    if (window.visualViewport) {
      const oldKeyboardState = {
        height: keyboardHeight.value,
        isOpen: isKeyboardOpen.value
      };

      visualViewport.value = {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        offsetTop: window.visualViewport.offsetTop
      };

      // Определение высоты клавиатуры для портретного режима
      const heightDiff = window.innerHeight - window.visualViewport.height;
      const minKeyboardHeight = 150; // Стандартный порог для цифровой клавиатуры в портрете

      console.log('Viewport debug:', {
        'window.innerHeight': window.innerHeight,
        'window.visualViewport.height': window.visualViewport.height,
        heightDiff: heightDiff,
        minKeyboardHeight: minKeyboardHeight,
        'window.visualViewport.offsetTop': window.visualViewport.offsetTop,
        'window.innerWidth': window.innerWidth,
        'window.visualViewport.width': window.visualViewport.width
      });

      // Обнаружение клавиатуры - упрощенная логика для портретного режима
      if (heightDiff > minKeyboardHeight) {
        keyboardHeight.value = heightDiff;
        isKeyboardOpen.value = true;
        console.log('📱 Клавиатура обнаружена по высоте:', heightDiff);
      } else if (window.visualViewport.offsetTop > 30) {
        // Если клавиатура появилась, но не изменила высоту viewport (некоторые Android)
        keyboardHeight.value = window.visualViewport.offsetTop;
        isKeyboardOpen.value = true;
        console.log('📱 Клавиатура обнаружена по offsetTop:', window.visualViewport.offsetTop);
      } else {
        keyboardHeight.value = 0;
        isKeyboardOpen.value = false;
        console.log('📱 Клавиатура не обнаружена');
      }

      // Обновляем CSS переменную
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight.value}px`);

      // Логируем изменения
      if (
        oldKeyboardState.height !== keyboardHeight.value ||
        oldKeyboardState.isOpen !== isKeyboardOpen.value
      ) {
        console.log('⌨️ Изменение состояния клавиатуры:', {
          было: oldKeyboardState,
          стало: {
            height: keyboardHeight.value,
            isOpen: isKeyboardOpen.value
          }
        });
      }
    } else {
      console.log('❌ Visual Viewport API не поддерживается');
      // Fallback для старых браузеров
      visualViewport.value = {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetTop: window.scrollY
      };
      keyboardHeight.value = 0;
      isKeyboardOpen.value = false;
    }

    console.log('=== UPDATE VIEWPORT END ===');
  };

  // Функция прокрутки к элементу
  const scrollToElement = (element: HTMLElement, offset = 20) => {
    if (!element) return;

    requestAnimationFrame(() => {
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;

      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    });
  };

  // Функция фокуса с автоматической прокруткой
  const focusWithScroll = (element: HTMLElement | null, offset = 100) => {
    if (!element) return;

    element.focus();

    // Небольшая задержка для появления клавиатуры на мобильных
    setTimeout(() => {
      updateViewport();
      if (isKeyboardOpen.value) {
        scrollToElement(element, offset);
      }
    }, 300);
  };

  // Функция блокировки ориентации (если поддерживается)
  const lockOrientation = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {
        // Игнорируем ошибки блокировки ориентации
        console.log('Не удалось заблокировать ориентацию экрана');
      });
    }
  };

  // Инициализация
  onMounted(() => {
    updateViewport();

    // Пытаемся заблокировать портретный режим
    lockOrientation();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    // Fallback для старых браузеров
    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', updateViewport);

    // Также слушаем фокус на input для отслеживания клавиатуры
    document.addEventListener('focusin', updateViewport);
    document.addEventListener('focusout', updateViewport);
  });

  // Очистка
  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateViewport);
      window.visualViewport.removeEventListener('scroll', updateViewport);
    }
    window.removeEventListener('resize', updateViewport);
    window.removeEventListener('scroll', updateViewport);
    document.removeEventListener('focusin', updateViewport);
    document.removeEventListener('focusout', updateViewport);
  });

  return {
    keyboardHeight,
    isKeyboardOpen,
    visualViewport,
    scrollToElement,
    focusWithScroll,
    updateViewport
  };
}
