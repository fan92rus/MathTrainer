/**
 * SVG иконки для визуализации "Магазин конфет"
 * Пачки конфет и отдельные конфеты для объяснения заимствования
 */

/**
 * SVG иконка запечатанной пачки конфет (прямоугольник с цифрой 10)
 */
export const sealedPackIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60" class="candy-pack-icon">
  <!-- Основа пачки -->
  <rect x="5" y="10" width="40" height="45" rx="3" fill="#FFD93D" stroke="#E5A800" stroke-width="2"/>
  <!-- Этикетка -->
  <rect x="10" y="20" width="30" height="20" rx="2" fill="#FFF8DC" stroke="#E5A800" stroke-width="1"/>
  <!-- Текст "10" -->
  <text x="25" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#E5A800">10</text>
  <!-- Блеск -->
  <rect x="8" y="12" width="15" height="3" rx="1" fill="white" opacity="0.4"/>
</svg>
`;

/**
 * SVG иконка открытой пачки конфет (крышка открыта)
 */
export const openPackIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60" class="candy-pack-icon open">
  <!-- Основа пачки -->
  <rect x="5" y="15" width="40" height="40" rx="3" fill="#FFD93D" stroke="#E5A800" stroke-width="2"/>
  <!-- Открытая крышка -->
  <path d="M 5 15 L 5 8 Q 25 0 45 8 L 45 15 Z" fill="#FFE066" stroke="#E5A800" stroke-width="2"/>
  <!-- Пустота внутри -->
  <rect x="10" y="20" width="30" height="30" rx="2" fill="#FFF8DC" stroke="#E5A800" stroke-width="1"/>
  <!-- Блеск -->
  <rect x="8" y="17" width="15" height="2" rx="1" fill="white" opacity="0.4"/>
</svg>
`;

/**
 * SVG иконка отдельной конфеты (круг с "хвостиком" обёртки)
 */
export const candyIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="candy-icon">
  <!-- Хвостик обёртки -->
  <path d="M 15 2 Q 12 5 10 8" stroke="#FF6B9D" stroke-width="2" fill="none"/>
  <path d="M 15 2 Q 18 5 20 8" stroke="#FF6B9D" stroke-width="2" fill="none"/>
  <!-- Основа конфеты -->
  <circle cx="15" cy="15" r="10" fill="#FF6B9D" stroke="#E55A7F" stroke-width="2"/>
  <!-- Блеск -->
  <ellipse cx="12" cy="12" rx="3" ry="2" fill="white" opacity="0.5"/>
</svg>
`;

/**
 * CSS классы для анимации и стилей
 * Экспортируются как строка для включения в компоненты
 */
export const candyStyles = `
.candy-pack-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.candy-pack-icon:hover {
  transform: scale(1.05);
}

.candy-pack-icon.open {
  animation: packOpen 0.6s ease-in-out;
}

@keyframes packOpen {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.candy-icon {
  display: inline-block;
  animation: candyPop 0.3s ease-out;
}

@keyframes candyPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.candy-fall {
  animation: candyFall 0.8s ease-in forwards;
}

@keyframes candyFall {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
`;
