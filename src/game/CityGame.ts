/* global Phaser */
import { Game } from 'phaser'
import { CityScene } from './scenes/CityScene'

export class CityGame {
  private game: Game | null = null
  private containerId: string

  constructor(containerId: string) {
    this.containerId = containerId
  }

  public start(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight - 60, // Вычитаем высоту заголовка
      parent: this.containerId,
      backgroundColor: '#2c3e50',
      scene: [CityScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight - 60,
        expandParent: true
      }
    }

    this.game = new Game(config)

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', this.handleResize)
  }

  public destroy(): void {
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleResize)

    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }

  private handleResize = (): void => {
    if (this.game) {
      this.game.scale.resize(window.innerWidth, window.innerHeight - 60)
    }
  }
}