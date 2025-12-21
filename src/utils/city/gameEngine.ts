import { SpriteRenderer } from './spriteRenderer';
import { ParticleSystem } from './spriteRenderer';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteRenderer: SpriteRenderer;
  private particleSystem: ParticleSystem;

  // Игровые константы
  public readonly TILE_WIDTH = 64;
  public readonly TILE_HEIGHT = 32;
  public readonly GRID_SIZE = 8;

  // Камера
  public camera = {
    x: 0,
    y: 0,
    zoom: 1,
  };

  // Игровое состояние
  public buildings: any[] = [];
  public hoveredCell: { x: number; y: number } | null = null;
  public selectedBuilding: any = null;
  public animationFrame = 0;
  public constructionAnimations: Map<string, any> = new Map();
  public upgradeAnimations: Map<string, any> = new Map();

  // Производительность
  private lastFrameTime = 0;
  private fps = 60;
  private frameCount = 0;
  private fpsTime = 0;
  private isRunning = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
    this.spriteRenderer = new SpriteRenderer(ctx);
    this.particleSystem = new ParticleSystem();

    // Устанавливаем начальное положение камеры
    this.camera.x = -this.GRID_SIZE * this.TILE_WIDTH / 4;
    this.camera.y = -this.GRID_SIZE * this.TILE_HEIGHT / 4;
  }

  // Преобразование координат сетки в изометрические
  gridToIso(gridX: number, gridY: number) {
    const isoX = (gridX - gridY) * (this.TILE_WIDTH / 2);
    const isoY = (gridX + gridY) * (this.TILE_HEIGHT / 2);
    return {
      x: isoX + this.camera.x + this.canvas.width / 2,
      y: isoY + this.camera.y + 100,
    };
  }

  // Преобразование изометрических координат в сетку
  isoToGrid(isoX: number, isoY: number) {
    const x = isoX - this.camera.x - this.canvas.width / 2;
    const y = isoY - this.camera.y - 100;

    const gridX = Math.round((x / (this.TILE_WIDTH / 2) + y / (this.TILE_HEIGHT / 2)) / 2);
    const gridY = Math.round((y / (this.TILE_HEIGHT / 2) - x / (this.TILE_WIDTH / 2)) / 2);

    return { x: gridX, y: gridY };
  }

  // Проверка видимости клетки в камере
  isCellVisible(gridX: number, gridY: number): boolean {
    const { x, y } = this.gridToIso(gridX, gridY);
    return (
      x + this.TILE_WIDTH > 0 &&
      x - this.TILE_WIDTH < this.canvas.width &&
      y + this.TILE_HEIGHT > 0 &&
      y - this.TILE_HEIGHT * 2 < this.canvas.height
    );
  }

  // Отрисовка земли
  private drawGround() {
    // Фон
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(1, '#e0f2fe');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Трава
    this.ctx.fillStyle = '#dcfce7';
    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        if (!this.isCellVisible(x, y)) continue;

        const { x: isoX, y: isoY } = this.gridToIso(x, y);

        this.ctx.beginPath();
        this.ctx.moveTo(isoX, isoY);
        this.ctx.lineTo(isoX + this.TILE_WIDTH / 2, isoY + this.TILE_HEIGHT / 2);
        this.ctx.lineTo(isoX, isoY + this.TILE_HEIGHT);
        this.ctx.lineTo(isoX - this.TILE_WIDTH / 2, isoY + this.TILE_HEIGHT / 2);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }

  // Отрисовка сетки
  private drawGrid() {
    this.ctx.strokeStyle = '#86efac';
    this.ctx.lineWidth = 1;

    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        if (!this.isCellVisible(x, y)) continue;

        const { x: isoX, y: isoY } = this.gridToIso(x, y);

        this.ctx.beginPath();
        this.ctx.moveTo(isoX, isoY);
        this.ctx.lineTo(isoX + this.TILE_WIDTH / 2, isoY + this.TILE_HEIGHT / 2);
        this.ctx.lineTo(isoX, isoY + this.TILE_HEIGHT);
        this.ctx.lineTo(isoX - this.TILE_WIDTH / 2, isoY + this.TILE_HEIGHT / 2);
        this.ctx.closePath();
        this.ctx.stroke();

        // Подсветка наведенной клетки
        if (this.hoveredCell && this.hoveredCell.x === x && this.hoveredCell.y === y) {
          this.ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          this.ctx.fill();
        }
      }
    }
  }

  // Отрисовка зданий
  private drawBuildings() {
    // Сортировка для правильного порядка отрисовки (спереди назад)
    const sortedBuildings = [...this.buildings].sort((a, b) => {
      if (!a.x || !a.y || !b.x || !b.y) return 0;
      return (a.x + a.y) - (b.x + b.y);
    });

    sortedBuildings.forEach(building => {
      if (!building.x || !building.y || !this.isCellVisible(building.x, building.y)) return;

      const { x: isoX, y: isoY } = this.gridToIso(building.x, building.y);

      // Проверка на анимацию строительства
      const constructionAnim = this.constructionAnimations.get(building.id);
      if (constructionAnim) {
        this.spriteRenderer.drawConstructionAnimation(
          isoX,
          isoY,
          constructionAnim.progress
        );

        // Обновление анимации
        constructionAnim.progress += 0.02;
        if (constructionAnim.progress >= 1) {
          this.constructionAnimations.delete(building.id);
        }
      }

      // Проверка на анимацию улучшения
      const upgradeAnim = this.upgradeAnimations.get(building.id);
      if (upgradeAnim) {
        this.spriteRenderer.drawUpgradeEffect(isoX, isoY, this.animationFrame);
        upgradeAnim.duration--;
        if (upgradeAnim.duration <= 0) {
          this.upgradeAnimations.delete(building.id);
        }
      }

      // Отрисовка здания
      this.spriteRenderer.drawBuilding(isoX, isoY, building);

      // Подсветка при наведении
      if (this.hoveredCell &&
          this.hoveredCell.x === building.x &&
          this.hoveredCell.y === building.y) {
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
          isoX - 30,
          isoY - 60,
          60,
          80
        );
      }
    });
  }

  // Отрисовка FPS (для отладки)
  private drawFPS(currentTime: number) {
    this.frameCount++;
    this.fpsTime += currentTime - this.lastFrameTime;

    if (this.fpsTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 10);
  }

  // Основной цикл рендеринга
  private render(currentTime: number) {
    if (!this.isRunning) return;

    // Очистка канваса
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Отрисовка слоев
    this.drawGround();
    this.drawGrid();
    this.drawBuildings();

    // Отрисовка частиц
    this.particleSystem.update();
    this.spriteRenderer.drawCoinParticles(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.particleSystem.getParticles()
    );

    // Отладочная информация
    this.drawFPS(currentTime);

    // Обновление анимации
    this.animationFrame++;
    this.lastFrameTime = currentTime;

    // Следующий кадр
    requestAnimationFrame((time) => this.render(time));
  }

  // Запустить движок
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.render(this.lastFrameTime);
    }
  }

  // Остановить движок
  stop() {
    this.isRunning = false;
  }

  // Добавить анимацию строительства
  addConstructionAnimation(buildingId: string) {
    this.constructionAnimations.set(buildingId, {
      progress: 0,
    });
  }

  // Добавить анимацию улучшения
  addUpgradeAnimation(buildingId: string) {
    this.upgradeAnimations.set(buildingId, {
      duration: 60, // 1 секунда при 60 FPS
    });
  }

  // Создать частицы монеток
  createCoinParticles(x: number, y: number, count: number) {
    const { x: isoX, y: isoY } = this.gridToIso(x, y);
    this.particleSystem.createCoinParticles(isoX, isoY, count);
  }

  // Изменить размер канваса
  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Получить информацию о производительности
  getPerformanceInfo() {
    return {
      fps: this.fps,
      particles: this.particleSystem.getParticles().length,
      buildings: this.buildings.length,
      animations: this.constructionAnimations.size + this.upgradeAnimations.size,
    };
  }
}