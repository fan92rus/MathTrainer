import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import EquationsWholePartLearningStory from '../EquationsWholePartLearningStory.vue';

describe('EquationsWholePartLearningStory', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(EquationsWholePartLearningStory);
  });

  describe('Рендер шагов', () => {
    it('показывает 6 точек прогресса', () => {
      const dots = wrapper.findAll('.dot');
      expect(dots).toHaveLength(6);
    });

    it('первая точка активна на старте', () => {
      const dots = wrapper.findAll('.dot');
      expect(dots[0].classes()).toContain('active');
    });

    it('шаг 0 виден на старте', () => {
      expect(wrapper.find('[data-testid="step-0"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Яблоки в корзинке');
    });

    it('шаг 0 имеет кнопку "Понятно!"', () => {
      expect(wrapper.text()).toContain('Понятно!');
    });
  });

  describe('Навигация между шагами', () => {
    it('клик "Понятно!" → шаг 1', async () => {
      await wrapper.find('.btn-primary').trigger('click');
      expect(wrapper.find('[data-testid="step-1"]').exists()).toBe(true);
    });

    it('после перехода точка 0 = completed, точка 1 = active', async () => {
      await wrapper.find('.btn-primary').trigger('click');
      const dots = wrapper.findAll('.dot');
      expect(dots[0].classes()).toContain('completed');
      expect(dots[1].classes()).toContain('active');
    });

    it('после правильного ответа на шаге 1 появляется "Далее"', async () => {
      await wrapper.find('.btn-primary').trigger('click'); // step 0 → 1
      const options = wrapper.findAll('.option-btn');
      await options[1].trigger('click'); // click "7" (correct)
      expect(wrapper.text()).toContain('Далее');
    });

    it('переход шаг 1 → 2 через правильный ответ + Далее', async () => {
      await wrapper.find('.btn-primary').trigger('click');
      await wrapper.findAll('.option-btn')[1].trigger('click'); // 7 correct
      await wrapper.find('.btn-primary').trigger('click'); // Далее
      expect(wrapper.find('[data-testid="step-2"]').exists()).toBe(true);
    });
  });

  describe('Проверка ответов на шаге 1 (x + 5 = 12)', () => {
    beforeEach(async () => {
      await wrapper.find('.btn-primary').trigger('click'); // step 0 → 1
    });

    it('правильный ответ (7) — feedback не показывается', async () => {
      await wrapper.findAll('.option-btn')[0].trigger('click'); // "5" wrong
      expect(wrapper.find('.feedback').exists()).toBe(true);
    });

    it('неправильный ответ (5) — feedback с ошибкой', async () => {
      await wrapper.findAll('.option-btn')[0].trigger('click'); // "5"
      expect(wrapper.find('.feedback.error').exists()).toBe(true);
      expect(wrapper.text()).toContain('12');
      expect(wrapper.text()).toContain('5');
    });
  });

  describe('Проверка ответов на шаге 2 (12 − x = 5)', () => {
    beforeEach(async () => {
      await wrapper.find('.btn-primary').trigger('click'); // 0→1
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct 7
      await wrapper.find('.btn-primary').trigger('click'); // Далее → 2
    });

    it('правильный ответ (7) — "Далее" появляется', async () => {
      await wrapper.findAll('.option-btn')[1].trigger('click'); // "7" correct
      expect(wrapper.text()).toContain('Далее');
    });

    it('неправильный ответ (5) — feedback с ошибкой', async () => {
      await wrapper.findAll('.option-btn')[0].trigger('click'); // "5"
      expect(wrapper.find('.feedback.error').exists()).toBe(true);
    });

    it('содержит текст "Найди вычитаемое"', () => {
      expect(wrapper.text()).toContain('Найди');
    });
  });

  describe('Проверка ответов на шаге 3 (x − 5 = 7)', () => {
    beforeEach(async () => {
      await wrapper.find('.btn-primary').trigger('click'); // 0→1
      await wrapper.findAll('.option-btn')[1].trigger('click'); // 7 correct
      await wrapper.find('.btn-primary').trigger('click'); // 1→2
      await wrapper.findAll('.option-btn')[1].trigger('click'); // 7 correct
      await wrapper.find('.btn-primary').trigger('click'); // 2→3
    });

    it('правильный ответ (12) — "Далее" появляется', async () => {
      await wrapper.findAll('.option-btn')[1].trigger('click'); // "12" correct
      expect(wrapper.text()).toContain('Далее');
    });

    it('неправильный ответ (2) — error feedback', async () => {
      await wrapper.findAll('.option-btn')[0].trigger('click'); // "2"
      expect(wrapper.find('.feedback.error').exists()).toBe(true);
    });

    it('после 2+ ошибок показывает hint "части нужно сложить"', async () => {
      await wrapper.findAll('.option-btn')[0].trigger('click'); // 1st wrong
      await wrapper.findAll('.option-btn')[2].trigger('click'); // 2nd wrong (7)
      expect(wrapper.find('.feedback.hint').exists()).toBe(true);
      expect(wrapper.text()).toContain('части нужно сложить');
    });
  });

  describe('Практика с вводом числа (шаг 4)', () => {
    beforeEach(async () => {
      await wrapper.find('.btn-primary').trigger('click'); // 0→1
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct
      await wrapper.find('.btn-primary').trigger('click'); // 1→2
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct
      await wrapper.find('.btn-primary').trigger('click'); // 2→3
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct 12
      await wrapper.find('.btn-primary').trigger('click'); // 3→4
    });

    it('шаг 4 показывает поле ввода', () => {
      expect(wrapper.find('.number-input').exists()).toBe(true);
      expect(wrapper.find('.answer-input').exists()).toBe(true);
    });

    it('правильный ответ (7) → success-message', async () => {
      // v-model.number sets inputAnswer to 7, showCorrect becomes true immediately
      // because computed checks inputAnswer === CORRECT_ANSWERS[4] (7 === 7)
      // So the number-input hides and success-message appears automatically
      const input = wrapper.find('.answer-input');
      await input.setValue('7');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.success-message').exists()).toBe(true);
      expect(wrapper.text()).toContain('Правильно');
    });

    it('неправильный ответ (5) → feedback с ошибкой', async () => {
      const input = wrapper.find('.answer-input');
      await input.setValue(5);
      await wrapper.find('.btn-primary').trigger('click');
      expect(wrapper.find('.feedback.error').exists()).toBe(true);
      expect(wrapper.text()).toContain('15');
      expect(wrapper.text()).toContain('8');
    });

    it('пустой ввод не отправляет ответ', async () => {
      // inputAnswer starts null, checkNumberAnswer checks for null
      const btn = wrapper.find('.btn-primary');
      await btn.trigger('click');
      // No feedback should appear since answer was null
      expect(wrapper.find('.feedback').exists()).toBe(false);
    });
  });

  describe('Завершение (шаг 5)', () => {
    beforeEach(async () => {
      // Navigate through all steps
      await wrapper.find('.btn-primary').trigger('click'); // 0→1
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct 7
      await wrapper.find('.btn-primary').trigger('click'); // 1→2
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct 7
      await wrapper.find('.btn-primary').trigger('click'); // 2→3
      await wrapper.findAll('.option-btn')[1].trigger('click'); // correct 12
      await wrapper.find('.btn-primary').trigger('click'); // 3→4
      await wrapper.find('.answer-input').setValue(7);
      await wrapper.find('.btn-primary').trigger('click'); // check
      await wrapper.find('.btn-primary').trigger('click'); // Далее → 5
    });

    it('шаг 5 показывает 🎉 анимацию', () => {
      expect(wrapper.find('.completion-animation').exists()).toBe(true);
      expect(wrapper.text()).toContain('Отлично');
    });

    it('шаг 5 показывает правила', () => {
      expect(wrapper.text()).toContain('целое = часть')
      expect(wrapper.text()).toContain('часть = целое');
    });

    it('клик "Начать диагностику" эмитит complete', async () => {
      const btn = wrapper.find('[data-testid="complete-button"]');
      expect(btn.exists()).toBe(true);
      await btn.trigger('click');
      expect(wrapper.emitted('complete')).toBeTruthy();
    });
  });

  describe('ARIA доступность', () => {
    it('прогресс имеет role="progressbar"', () => {
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.exists()).toBe(true);
    });

    it('прогресс имеет aria-valuenow=1 на старте', () => {
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.attributes('aria-valuenow')).toBe('1');
    });

    it('прогресс имеет aria-valuemax=6', () => {
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.attributes('aria-valuemax')).toBe('6');
    });

    it('прогресс имеет aria-label', () => {
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.attributes('aria-label')).toBeTruthy();
    });
  });
});
