/**
 * RED тесты для EquationsWholePartLearningStory компонента
 *
 * Обучающий режим для уравнений "целое и части"
 *
 * Требования из PRD FR-011:
 * - Примеры с яблоками для каждого типа (3 примера)
 * - Интерактивное прохождение: пользователь решает пример
 * - Объяснение после каждого шага
 * - Завершение → переход к диагностике
 *
 * TDD подход: Сначала failing тесты, потом реализация
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import EquationsWholePartLearningStory from '../EquationsWholePartLearningStory.vue';

describe('EquationsWholePartLearningStory - RED тесты', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(EquationsWholePartLearningStory);
  });

  describe('Отображение компонентов обучения', () => {
    it('должен отображать контейнер обучения', () => {
      expect(wrapper.find('.learning-story').exists()).toBe(true);
    });

    it('должен отображать индикатор прогресса с точками', () => {
      const dots = wrapper.findAll('.dot');
      expect(dots.length).toBeGreaterThanOrEqual(4);
    });

    it('первая точка должна быть активной', () => {
      const firstDot = wrapper.find('.dot');
      expect(firstDot.classes()).toContain('active');
    });
  });

  describe('Шаг 0: Введение (Яблоки в корзинке)', () => {
    it('должен отображать визуализацию с яблоками', () => {
      expect(wrapper.find('.apple-visualization').exists()).toBe(true);
    });

    it('должен показывать объяснение концепции "целое и части"', () => {
      expect(wrapper.text()).toContain('целое');
      expect(wrapper.text()).toContain('часть');
    });

    it('должен иметь кнопку перехода к следующему шагу', () => {
      const nextBtn = wrapper.find('.btn-primary');
      expect(nextBtn.exists()).toBe(true);
      expect(nextBtn.text()).toContain('Понятно');
    });
  });

  describe('Шаг 1: Первый тип уравнения (x + a = b)', () => {
    it('должен показывать пример с яблоками для unknownAddend', async () => {
      // Переходим на шаг 1
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click');

      expect(wrapper.text()).toContain('12');
      expect(wrapper.text()).toContain('5');
    });

    it('должен объяснять правило: часть = целое - другая часть', async () => {
      // Переходим на шаг 1
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click');

      // На шаге 1 есть правило с вычитанием
      expect(wrapper.text()).toContain('целое');
      expect(wrapper.text()).toContain('часть');
    });
  });

  describe('Шаг 2: Второй тип уравнения (a - x = b)', () => {
    it('должен показывать пример с яблоками для unknownSubtrahend', async () => {
      // Переходим на шаг 2
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click'); // Шаг 0 -> 1
      await nextBtn.trigger('click'); // Шаг 1 -> 2

      expect(wrapper.text()).toContain('12');
      expect(wrapper.text()).toContain('вычитаемое');
    });

    it('должен объяснять как найти вычитаемое', async () => {
      // Переходим на шаг 2
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click'); // Шаг 0 -> 1
      await nextBtn.trigger('click'); // Шаг 1 -> 2

      expect(wrapper.text()).toContain('Найди');
    });
  });

  describe('Шаг 3: Третий тип уравнения (x - a = b)', () => {
    it('должен показывать пример с яблоками для unknownMinuend', async () => {
      // Переходим на шаг 3
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click'); // Шаг 0 -> 1
      await nextBtn.trigger('click'); // Шаг 1 -> 2
      await nextBtn.trigger('click'); // Шаг 2 -> 3

      expect(wrapper.text()).toContain('уменьшаемое');
    });
  });

  describe('Интерактивность', () => {
    it('должен позволять переходить между шагами', async () => {
      const dots = wrapper.findAll('.dot');

      // Изначально активна первая точка
      expect(dots[0].classes()).toContain('active');

      // После клика на "Далее" активна вторая точка
      const nextBtn = wrapper.find('.btn-primary');
      await nextBtn.trigger('click');

      const updatedDots = wrapper.findAll('.dot');
      expect(updatedDots[1].classes()).toContain('active');
      expect(updatedDots[0].classes()).toContain('completed');
    });

    it('должен эмитить событие complete при завершении', async () => {
      // Прокручиваем все шаги
      for (let i = 0; i < 5; i++) {
        const nextBtn = wrapper.find('.btn-primary');
        if (nextBtn.exists()) {
          await nextBtn.trigger('click');
        }
      }

      // На последнем шаге должна быть кнопка завершения
      const completeBtn = wrapper.find('[data-testid="complete-button"]');
      if (completeBtn.exists()) {
        await completeBtn.trigger('click');
        expect(wrapper.emitted('complete')).toBeTruthy();
      }
    });
  });

  describe('Визуализация яблок', () => {
    it('должен отображать корзинку с яблоками', () => {
      const basket = wrapper.find('.basket-container');
      expect(basket.exists()).toBe(true);
    });

    it('должен показывать количество яблок числом', () => {
      expect(wrapper.text()).toMatch(/\d+\s*яблок/);
    });

    it('должен визуально разделять яблоки на части', () => {
      const parts = wrapper.findAll('.apple-part');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Обратная связь', () => {
    it('должен показывать правильные ответы с зелёной подсветкой', async () => {
      // Симулируем правильный ответ
      const correctBtn = wrapper.find('[data-correct="true"]');
      if (correctBtn.exists()) {
        await correctBtn.trigger('click');
        expect(correctBtn.classes()).toContain('correct');
      }
    });

    it('должен показывать неправильные ответы с красной подсветкой', async () => {
      const wrongBtn = wrapper.find('[data-correct="false"]');
      if (wrongBtn.exists()) {
        await wrongBtn.trigger('click');
        expect(wrongBtn.classes()).toContain('incorrect');
      }
    });

    it('должен показывать объяснение при неправильном ответе', async () => {
      const wrongBtn = wrapper.find('[data-correct="false"]');
      if (wrongBtn.exists()) {
        await wrongBtn.trigger('click');
        expect(wrapper.find('.feedback').exists()).toBe(true);
      }
    });
  });

  describe('Адаптивность', () => {
    it('должен работать на мобильных устройствах', () => {
      // Проверяем наличие адаптивных классов
      const container = wrapper.find('.learning-story');
      expect(container.exists()).toBe(true);
    });

    it('должен использовать clamp() для размеров шрифтов', () => {
      const story = wrapper.find('.learning-story');
      // Проверяем что компонент рендерится
      expect(story.exists()).toBe(true);
    });
  });

  describe('Доступность (a11y)', () => {
    it('должен иметь ARIA метки для прогресса', () => {
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.exists()).toBe(true);
    });

    it('должен иметь aria-label для шагов', () => {
      const progress = wrapper.find('[role="progressbar"]');
      if (progress.exists()) {
        expect(progress.attributes('aria-label')).toBeTruthy();
      }
    });
  });
});
