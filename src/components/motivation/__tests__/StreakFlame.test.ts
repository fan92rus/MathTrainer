import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StreakFlame from '../StreakFlame.vue';

describe('StreakFlame', () => {
  it('рендерится без ошибок', () => {
    const wrapper = mount(StreakFlame, { props: { streak: 0 } });
    expect(wrapper.exists()).toBe(true);
  });

  describe('CSS классы пламени', () => {
    it('streak=0 → flame-tiny + no-streak', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 0 } });
      expect(wrapper.classes()).toContain('flame-tiny');
      expect(wrapper.classes()).toContain('no-streak');
    });

    it('streak=1 → flame-tiny, без no-streak', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 1 } });
      expect(wrapper.classes()).toContain('flame-tiny');
      expect(wrapper.classes()).not.toContain('no-streak');
    });

    it('streak=2 → flame-tiny', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 2 } });
      expect(wrapper.classes()).toContain('flame-tiny');
    });

    it('streak=3 → flame-small', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 3 } });
      expect(wrapper.classes()).toContain('flame-small');
    });

    it('streak=6 → flame-small', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 6 } });
      expect(wrapper.classes()).toContain('flame-small');
    });

    it('streak=7 → flame-medium', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 7 } });
      expect(wrapper.classes()).toContain('flame-medium');
    });

    it('streak=13 → flame-medium', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 13 } });
      expect(wrapper.classes()).toContain('flame-medium');
    });

    it('streak=14 → flame-large', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 14 } });
      expect(wrapper.classes()).toContain('flame-large');
    });

    it('streak=29 → flame-large', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 29 } });
      expect(wrapper.classes()).toContain('flame-large');
    });

    it('streak=30 → flame-rainbow', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 30 } });
      expect(wrapper.classes()).toContain('flame-rainbow');
    });

    it('streak=100 → flame-rainbow', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 100 } });
      expect(wrapper.classes()).toContain('flame-rainbow');
    });
  });

  describe('Внутренняя структура', () => {
    it('содержит .flame-container', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 7 } });
      expect(wrapper.find('.flame-container').exists()).toBe(true);
    });

    it('содержит .flame-body', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 7 } });
      expect(wrapper.find('.flame-body').exists()).toBe(true);
    });

    it('содержит .flame-inner', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 7 } });
      expect(wrapper.find('.flame-inner').exists()).toBe(true);
    });

    it('содержит .flame-core', () => {
      const wrapper = mount(StreakFlame, { props: { streak: 7 } });
      expect(wrapper.find('.flame-core').exists()).toBe(true);
    });
  });
});
