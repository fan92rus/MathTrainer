<template>
  <div class="stars-container">
    <span 
      v-for="n in 3" 
      :key="n" 
      class="star" 
      :class="{ filled: score >= n * 20 }"
    >★</span>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    score: {
      type: Number,
      default: 0
    }
  }
}
</script>