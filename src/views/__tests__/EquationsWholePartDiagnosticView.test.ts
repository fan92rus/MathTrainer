/**
 * GREEN тесты для EquationsWholePartDiagnosticView компонента
 *
 * Диагностический режим для проверки готовности к тренировочному режиму
 *
 * Требования из PRD FR-012:
 * - 10 уравнений смешанных типов
 * - Порог прохождения: 5/10 правильных
 * - Уровень 2 (текстовые метки)
 * - При успехе → разблокировка тренировки
 * - При неудаче → предложение повторить обучение
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EquationsWholePartDiagnosticView from '../EquationsWholePartDiagnosticView.vue';
import type { EquationWholePartProblem } from '@/types';

// Мокаем компоненты
vi.mock('@/components/equationsWholePart/EquationDisplay.vue', () => ({
  default: {
    name: 'EquationDisplay',
    template: '<div class="equation-display"><slot></slot></div>',
    props: ['problem', 'showResult'],
    emits: ['complete']
  }
}));

vi.mock('@/components/common/ScoreDisplay.vue', () => ({
  default: {
    name: 'ScoreDisplay',
    template: '<div class="score-display">Score: {{ currentScore }}/{{ totalScore }}, Question: {{ currentQuestion }}/{{ totalQuestions }}</div>',
    props: ['currentScore', 'totalScore', 'currentQuestion', 'totalQuestions']
  }
}));

vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: {
    name: 'ProgressBar',
    template: '<div class="progress-bar" :style="{ width: progressPercent + \'%\' }"></div>',
    props: ['progressPercent']
  }
}));

vi.mock('@/components/common/StarRating.vue', () => ({
  default: {
    name: 'StarRating',
    template: '<div class="star-rating">Stars: {{ score }}</div>',
    props: ['score']
  }
}));

vi.mock('@/components/common/GameOver.vue', () => ({
  default: {
    name: 'GameOver',
    template: '<div class="game-over"><slot></slot></div>',
    props: ['correctAnswers', 'totalAnswers', 'score']
  }
}));

vi.mock('@/components/player/CurrencyDisplay.vue', () => ({
  default: {
    name: 'CurrencyDisplay',
    template: '<div class="currency-display">Coins</div>'
  }
}));

// Мокаем router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('EquationsWholePartDiagnosticView - GREEN тесты', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = mount(EquationsWholePartDiagnosticView);
  });

  describe('Отображение диагностического режима', () => {
    it('должен отображать контейнер диагностики', () => {
      expect(wrapper.find('.diagnostic-view').exists()).toBe(true);
    });

    it('должен показывать заголовок диагностики', () => {
      expect(wrapper.find('.title').text()).toBe('Проверь свои знания!');
    });

    it('должен показывать подзаголовок', () => {
      expect(wrapper.find('.subtitle').text()).toBe('Реши 10 уравнений, чтобы пройти тест');
    });
  });

  describe('Генерация диагностических задач', () => {
    it('должен генерировать 10 задач', () => {
      expect(wrapper.vm.problems.length).toBe(10);
    });

    it('должен содержать все три типа уравнений', () => {
      const types = new Set(wrapper.vm.problems.map((p: EquationWholePartProblem) => p.equationType));
      expect(types.has('unknownAddend')).toBe(true);
      expect(types.has('unknownSubtrahend')).toBe(true);
      expect(types.has('unknownMinuend')).toBe(true);
    });

    it('все задачи должны быть на уровне 2 (текстовые метки)', () => {
      const allLevel2 = wrapper.vm.problems.every((p: EquationWholePartProblem) => p.supportLevel === 2);
      expect(allLevel2).toBe(true);
    });
  });

  describe('Проверка ответов', () => {
    it('должен засчитывать правильные ответы', async () => {
      const initialCorrectCount = wrapper.vm.correctCount;
      const equationDisplay = wrapper.findComponent({ name: 'EquationDisplay' });

      await equationDisplay.vm.$emit('complete', { isCorrect: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.correctCount).toBe(initialCorrectCount + 1);
    });

    it('должен показывать обратную связь при правильном ответе', async () => {
      const equationDisplay = wrapper.findComponent({ name: 'EquationDisplay' });

      await equationDisplay.vm.$emit('complete', { isCorrect: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.answered).toBe(true);
    });
  });

  describe('Порог прохождения', () => {
    it('должен требовать 5/10 правильных для прохождения', () => {
      expect(wrapper.vm.passed).toBe(false); // Initially 0/10

      // Simulate 5 correct answers
      for (let i = 0; i < 5; i++) {
        wrapper.vm.correctCount++;
      }

      expect(wrapper.vm.passed).toBe(true);
    });

    it('при 5 правильных должен показывать экран завершения с успешным сообщением', async () => {
      wrapper.vm.correctCount = 5;
      wrapper.vm.showResults = true;
      await wrapper.vm.$nextTick();

      const gameOver = wrapper.findComponent({ name: 'GameOver' });
      expect(gameOver.exists()).toBe(true);
    });

    it('при менее 5 правильных должен показывать предложение повторить обучение', async () => {
      wrapper.vm.correctCount = 3;
      wrapper.vm.showResults = true;
      await wrapper.vm.$nextTick();

      const gameOver = wrapper.findComponent({ name: 'GameOver' });
      expect(gameOver.exists()).toBe(true);
    });
  });

  describe('Компоненты UI', () => {
    it('должен использовать ScoreDisplay для прогресса', () => {
      expect(wrapper.findComponent({ name: 'ScoreDisplay' }).exists()).toBe(true);
    });

    it('должен использовать EquationDisplay для задач', () => {
      expect(wrapper.findComponent({ name: 'EquationDisplay' }).exists()).toBe(true);
    });

    it('должен показывать GameOver при завершении', async () => {
      wrapper.vm.showResults = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'GameOver' }).exists()).toBe(true);
    });
  });

  describe('Интеграция с router', () => {
    it('при успехе должен перенаправлять на тренировку', async () => {
      await wrapper.vm.goToTraining();

      expect(mockPush).toHaveBeenCalledWith('/equations-whole-part');
    });

    it('при неудаче должен предлагать вернуться к обучению', async () => {
      await wrapper.vm.goToLearning();

      expect(mockPush).toHaveBeenCalledWith('/equations-whole-part/learning');
    });

    it('при выходе должен возвращаться на главную', async () => {
      // Mock confirm to return true
      global.confirm = vi.fn(() => true);

      await wrapper.vm.goBack();

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Перезапуск диагностики', () => {
    it('должен сбрасывать состояние при перезапуске', async () => {
      // Set some state
      wrapper.vm.correctCount = 5;
      wrapper.vm.currentIndex = 5;
      wrapper.vm.showResults = true;

      await wrapper.vm.restartDiagnostic();

      expect(wrapper.vm.correctCount).toBe(0);
      expect(wrapper.vm.currentIndex).toBe(0);
      expect(wrapper.vm.showResults).toBe(false);
    });
  });

  describe('Прогресс', () => {
    it('должен вычислять процент прогресса', () => {
      wrapper.vm.currentIndex = 5;
      expect(wrapper.vm.progressPercent).toBe(50); // 5/10 * 100
    });
  });
});
