// Класс для отрисовки спрайтов и зданий
export class SpriteRenderer {
  private ctx: CanvasRenderingContext2D;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Загрузка изображения
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(this.imageCache.get(src)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Отрисовка здания с эмодзи
  drawBuilding(x: number, y: number, building: any) {
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = 32;

    // Высота здания зависит от уровня
    const buildingHeight = 20 + building.level * 15;

    // Основание
    this.ctx.fillStyle = this.getBuildingColor(building.type);
    this.ctx.strokeStyle = this.getBuildingBorderColor(building.type);
    this.ctx.lineWidth = 2;

    // Тень
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(x - 20, y + TILE_HEIGHT - 10, 40, 10);

    // Передняя грань
    this.ctx.fillStyle = this.getBuildingColor(building.type);
    this.ctx.beginPath();
    this.ctx.rect(x - 20, y - buildingHeight, 40, buildingHeight);
    this.ctx.fill();
    this.ctx.stroke();

    // Верхняя грань
    this.ctx.fillStyle = this.lightenColor(this.getBuildingColor(building.type), 20);
    this.ctx.beginPath();
    this.ctx.moveTo(x - 20, y - buildingHeight);
    this.ctx.lineTo(x, y - buildingHeight - 15);
    this.ctx.lineTo(x + 20, y - buildingHeight);
    this.ctx.lineTo(x, y - buildingHeight + 15);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Правая боковая грань
    this.ctx.fillStyle = this.darkenColor(this.getBuildingColor(building.type), 10);
    this.ctx.beginPath();
    this.ctx.moveTo(x + 20, y - buildingHeight);
    this.ctx.lineTo(x, y - buildingHeight - 15);
    this.ctx.lineTo(x, y + TILE_HEIGHT - 15);
    this.ctx.lineTo(x + 20, y + TILE_HEIGHT);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Иконка здания
    this.drawEmojiIcon(x, y - buildingHeight / 2, this.getBuildingEmoji(building.name));

    // Уровень здания
    if (building.level > 1) {
      this.drawLevelBadge(x, y - buildingHeight - 30, building.level);
    }
  }

  // Отрисовка иконки здания
  private drawEmojiIcon(x: number, y: number, emoji: string) {
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x, y);
  }

  // Отрисовка значка уровня
  private drawLevelBadge(x: number, y: number, level: number) {
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(x - 15, y - 10, 30, 20);
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`Lvl ${level}`, x, y);
  }

  // Получение цвета для типа здания
  private getBuildingColor(type: string): string {
    const colors: { [key: string]: string } = {
      residential: '#dcfce7',
      public: '#dbeafe',
      entertainment: '#fef3c7',
      infrastructure: '#e0e7ff',
      special: '#fce7f3',
    };
    return colors[type] || '#f3f4f6';
  }

  // Получение цвета границы
  private getBuildingBorderColor(type: string): string {
    const colors: { [key: string]: string } = {
      residential: '#86efac',
      public: '#93c5fd',
      entertainment: '#fde047',
      infrastructure: '#c7d2fe',
      special: '#fbcfe8',
    };
    return colors[type] || '#d1d5db';
  }

  // Получение эмодзи для здания
  private getBuildingEmoji(name: string): string {
    const emojis: { [key: string]: string } = {
      'Маленький домик': '🏠',
      'Коттедж': '🏡',
      'Многоквартирный дом': '🏢',
      'Школа': '🏫',
      'Больница': '🏥',
      'Магазин': '🏪',
      'Парк': '🌳',
      'Игровая площадка': '🎠',
      'Библиотека': '📚',
      'Музей': '🏛️',
      'Траттория': '🍕',
      'Фабрика игрушек': '🧸',
      'Банк': '🏦',
    };
    return emojis[name] || '🏛️';
  }

  // Осветление цвета
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  // Затемнение цвета
  private darkenColor(color: string, percent: number): string {
    return this.lightenColor(color, -percent);
  }

  // Отрисовка анимации строительства
  drawConstructionAnimation(x: number, y: number, progress: number) {
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = 32;

    // Полупрозрачное здание
    this.ctx.globalAlpha = 0.5 + progress * 0.5;

    // Эффект роста
    const scale = 0.5 + progress * 0.5;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-x, -y);

    // Рисуем фундамент
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.fillRect(x - 20, y + TILE_HEIGHT - 5, 40, 5);

    // Частицы пыли
    for (let i = 0; i < 5; i++) {
      const particleX = x + (Math.random() - 0.5) * 60;
      const particleY = y + Math.random() * 40 - 20;
      const particleSize = Math.random() * 3 + 1;

      this.ctx.fillStyle = '#d1d5db';
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
    this.ctx.globalAlpha = 1;
  }

  // Отрисовка эффекта улучшения
  drawUpgradeEffect(x: number, y: number, frame: number) {
    const pulse = Math.sin(frame * 0.1) * 0.5 + 0.5;

    this.ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
    this.ctx.lineWidth = 3;

    // Вращающиеся лучи
    this.ctx.save();
    this.ctx.translate(x, y - 20);
    this.ctx.rotate(frame * 0.05);

    for (let i = 0; i < 8; i++) {
      this.ctx.rotate(Math.PI / 4);
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -30);
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Сияющий круг
    this.ctx.beginPath();
    this.ctx.arc(x, y - 20, 20 + pulse * 10, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  // Отрисовка частиц для монеток
  drawCoinParticles(x: number, y: number, particles: any[]) {
    particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🪙', particle.x, particle.y);
      this.ctx.restore();
    });
  }
}

// Класс системы частиц
export class ParticleSystem {
  private particles: any[] = [];

  // Создать частицы монеток
  createCoinParticles(x: number, y: number, count: number = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        gravity: 0.2,
        life: 1,
        decay: 0.02,
        type: 'coin',
      });
    }
  }

  // Обновить частицы
  update() {
    this.particles = this.particles.filter(particle => {
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;

      return particle.life > 0;
    });
  }

  // Получить все частицы
  getParticles() {
    return this.particles;
  }

  // Очистить все частицы
  clear() {
    this.particles = [];
  }
}