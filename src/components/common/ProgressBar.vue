<template>
  <div class="progress-bar">
    <div class="progress" :style="{ width: progressPercent + '%' }"></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    progressPercent: {
      type: Number,
      default: 0
    }
  }
}
</script>