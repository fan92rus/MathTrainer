/**
 * GREEN тесты для EquationsWholePartView компонента
 *
 * Новая система уровней на основе сложности чисел:
 * - Уровень 1 (score 0-4): числа до 10
 * - Уровень 2 (score 5-9): числа до 20
 * - Уровень 3 (score 10+): числа до 100
 *
 * Уровень определяется автоматически на основе equationsWholePartScore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useScoresStore } from '@/store/scores';
import EquationsWholePartView from '../EquationsWholePartView.vue';
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
    template: '<div class="score-display">Score: {{ currentScore }}/{{ totalScore }}</div>',
    props: ['currentScore', 'totalScore']
  }
}));

vi.mock('@/components/common/ProgressBar.vue', () => ({
  default: {
    name: 'ProgressBar',
    template: '<div class="progress-bar"></div>',
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
    props: ['correctAnswers', 'totalAnswers', 'score'],
    emits: ['restart', 'exit']
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

describe('EquationsWholePartView - GREEN тесты (новая система уровней)', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = mount(EquationsWholePartView);
  });

  describe('Инициализация', () => {
    it('должен начинать с уровня 1 (score 0)', () => {
      expect(wrapper.vm.currentLevel).toBe(1);
      expect(wrapper.vm.maxNumberForLevel).toBe(10);
    });

    it('должен генерировать задачи для тренировки', () => {
      expect(wrapper.vm.problems.length).toBeGreaterThan(0);
    });

    it('должен показывать текущую задачу', () => {
      expect(wrapper.vm.currentProblem).toBeTruthy();
    });

    it('должен показывать индикатор "Числа до 10" на уровне 1', () => {
      expect(wrapper.vm.levelIndicator).toBe('Числа до 10');
    });
  });

  describe('Использование store для определения уровня', () => {
    it('должен использовать getEquationsWholePartLevel из store', () => {
      const scoresStore = useScoresStore();
      expect(scoresStore.getEquationsWholePartLevel).toBe(1);
    });

    it('должен использовать getEquationsWholePartMaxNumber из store', () => {
      const scoresStore = useScoresStore();
      expect(scoresStore.getEquationsWholePartMaxNumber).toBe(10);
    });

    it('getter getEquationsWholePartLevel должен возвращать 2 для score 7', () => {
      const scoresStore = useScoresStore();
      scoresStore.equationsWholePartScore = 7;
      expect(scoresStore.getEquationsWholePartLevel).toBe(2);
    });

    it('getter getEquationsWholePartLevel должен возвращать 3 для score 15', () => {
      const scoresStore = useScoresStore();
      scoresStore.equationsWholePartScore = 15;
      expect(scoresStore.getEquationsWholePartLevel).toBe(3);
    });
  });

  describe('Подсчёт правильных ответов', () => {
    it('должен увеличивать счётчик при правильном ответе', async () => {
      const initialScore = wrapper.vm.score;
      const equationDisplay = wrapper.findComponent({ name: 'EquationDisplay' });

      await equationDisplay.vm.$emit('complete', { isCorrect: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.score).toBe(initialScore + 1);
    });

    it('не должен увеличивать счётчик при неправильном ответе', async () => {
      const initialScore = wrapper.vm.score;
      const equationDisplay = wrapper.findComponent({ name: 'EquationDisplay' });

      await equationDisplay.vm.$emit('complete', { isCorrect: false });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.score).toBe(initialScore);
    });
  });

  describe('Завершение тренировки', () => {
    it('должен показывать GameOver после 10 вопросов', async () => {
      // Симулируем завершение всех вопросов
      wrapper.vm.currentQuestion = 10;
      wrapper.vm.showResults = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'GameOver' }).exists()).toBe(true);
    });
  });

  describe('Интеграция с router', () => {
    it('должен возвращаться на главную при выходе', async () => {
      await wrapper.vm.goBack();

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Перезапуск', () => {
    it('должен сбрасывать состояние при перезапуске', async () => {
      // Устанавливаем некоторое состояние
      wrapper.vm.score = 5;
      wrapper.vm.currentQuestion = 7;

      await wrapper.vm.restart();

      expect(wrapper.vm.score).toBe(0);
      expect(wrapper.vm.currentQuestion).toBe(0);
    });
  });

  describe('Прогресс', () => {
    it('должен вычислять процент прогресса', () => {
      wrapper.vm.currentQuestion = 5;
      expect(wrapper.vm.progressPercent).toBe(50); // 5/10 * 100
    });
  });

  describe('UI компоненты', () => {
    it('должен использовать ScoreDisplay', () => {
      expect(wrapper.findComponent({ name: 'ScoreDisplay' }).exists()).toBe(true);
    });

    it('должен использовать ProgressBar', () => {
      expect(wrapper.findComponent({ name: 'ProgressBar' }).exists()).toBe(true);
    });

    it('должен использовать StarRating', () => {
      expect(wrapper.findComponent({ name: 'StarRating' }).exists()).toBe(true);
    });
  });
});
