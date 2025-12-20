<template>
  <transition name="slide-fade">
    <div v-if="show" class="step-by-step-solution">
      <div class="solution-title">📋 Пошаговое решение:</div>
      <div class="solution-steps">
        <div v-for="(step, index) in steps" :key="index" class="step">
          <span class="step-number">{{ index + 1 }}.</span>
          <span class="step-content">{{ step }}</span>
        </div>
      </div>
      <div class="solution-result">
        <span class="equals">=</span>
        <span class="result">{{ result }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    expression: string;
    correctOption: string;
    show: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    show: false
  });

  // Вычисляем шаги решения на основе выражения и правильного варианта
  const steps = computed(() => {
    const steps: string[] = [];
    const [num1Str, , num2Str] = props.expression.split(' ');
    const num1 = parseInt(num1Str);
    const num2 = parseInt(num2Str);
    const operation = props.expression.includes('+') ? '+' : '-';

    if (operation === '+') {
      // Логика для сложения
      const parts = props.correctOption.split(' + ');
      if (parts.length > 2) {
        steps.push(`${num1} + ${parts[1]} = ${num1 + parseInt(parts[1])}`);
        if (parts.length > 3) {
          // Если больше двух частей в разложении
          let runningTotal = num1 + parseInt(parts[1]);
          for (let i = 2; i < parts.length - 1; i++) {
            const part = parseInt(parts[i]);
            runningTotal += part;
            steps.push(`${runningTotal - part} + ${part} = ${runningTotal}`);
          }
          steps.push(`${runningTotal} + ${parts[parts.length - 1]} = ${num1 + num2}`);
        } else {
          steps.push(`${num1 + parseInt(parts[1])} + ${parts[2]} = ${num1 + num2}`);
        }
      }
    } else {
      // Логика для вычитания
      const parts = props.correctOption.split(' - ');
      if (parts.length > 2) {
        steps.push(`${num1} - ${parts[1]} = ${num1 - parseInt(parts[1])}`);
        if (parts.length > 3) {
          // Если больше двух частей в разложении
          let runningTotal = num1 - parseInt(parts[1]);
          for (let i = 2; i < parts.length - 1; i++) {
            const part = parseInt(parts[i]);
            runningTotal -= part;
            steps.push(`${runningTotal + part} - ${part} = ${runningTotal}`);
          }
          steps.push(`${runningTotal} - ${parts[parts.length - 1]} = ${num1 - num2}`);
        } else {
          steps.push(`${num1 - parseInt(parts[1])} - ${parts[2]} = ${num1 - num2}`);
        }
      }
    }

    return steps;
  });

  // Вычисляем конечный результат
  const result = computed(() => {
    const [num1Str, , num2Str] = props.expression.split(' ');
    const num1 = parseInt(num1Str);
    const num2 = parseInt(num2Str);

    if (props.expression.includes('+')) {
      return num1 + num2;
    } else {
      return num1 - num2;
    }
  });
</script>

<style scoped>
  .slide-fade-enter-active {
    transition: all 0.5s ease;
  }

  .slide-fade-enter-from {
    transform: translateY(-20px);
    opacity: 0;
  }

  .step-by-step-solution {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    border-radius: 16px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
    }
    50% {
      box-shadow: 0 8px 32px rgba(72, 187, 120, 0.4);
    }
    100% {
      box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
    }
  }

  .solution-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: center;
  }

  .solution-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .step {
    display: flex;
    align-items: center;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    transition: transform 0.2s ease;
  }

  .step:hover {
    transform: translateX(5px);
    background: rgba(255, 255, 255, 0.15);
  }

  .step-number {
    font-weight: bold;
    margin-right: 10px;
    font-size: 18px;
    min-width: 25px;
  }

  .step-content {
    flex: 1;
  }

  .solution-result {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px;
    margin-top: 16px;
  }

  .equals {
    margin-right: 15px;
    font-size: 28px;
  }

  .result {
    font-size: 32px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>
