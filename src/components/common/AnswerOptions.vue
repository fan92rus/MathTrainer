<template>
  <div class="options-grid">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="option-card"
      :class="{
        correct: answered && index === correctIndex,
        incorrect: index === selectedIndex && index !== correctIndex,
        disabled: answered && index === correctIndex
      }"
      @click="selectAnswer(index)"
    >
      {{ option }}
    </div>
  </div>
</template>

<script setup lang="ts">
  export interface Props {
    options: (string | number)[];
    correctIndex: number;
    answered?: boolean;
    selectedIndex?: number | null;
  }

  withDefaults(defineProps<Props>(), {
    answered: false,
    selectedIndex: null
  });

  const emit = defineEmits<{
    answerSelected: [index: number];
  }>();

  const selectAnswer = (index: number): void => {
    emit('answerSelected', index);
  };
</script>
