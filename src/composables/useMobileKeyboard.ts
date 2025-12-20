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
    if (window.visualViewport) {
      visualViewport.value = {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        offsetTop: window.visualViewport.offsetTop
      };

      // Определяем высоту клавиатуры
      const heightDiff = window.innerHeight - window.visualViewport.height;
      keyboardHeight.value = heightDiff > 150 ? heightDiff : 0;
      isKeyboardOpen.value = keyboardHeight.value > 0;

      // Обновляем CSS переменную
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight.value}px`);
    } else {
      // Fallback для старых браузеров
      visualViewport.value = {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetTop: window.scrollY
      };
      keyboardHeight.value = 0;
      isKeyboardOpen.value = false;
    }
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

  // Инициализация
  onMounted(() => {
    updateViewport();

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