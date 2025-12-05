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

<script>
export default {
  name: 'AnswerOptions',
  props: {
    options: {
      type: Array,
      required: true
    },
    correctIndex: {
      type: Number,
      required: true
    },
    answered: {
      type: Boolean,
      default: false
    },
    selectedIndex: {
      type: Number,
      default: null
    }
  },
  emits: ['answer-selected'],
  methods: {
    selectAnswer(index) {
      this.$emit('answer-selected', index)
    }
  }
}
</script>