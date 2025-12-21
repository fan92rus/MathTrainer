// Простой аудио-менеджер для звуков в игре
export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.loadSounds();
  }

  // Загрузка звуков
  private loadSounds() {
    // Используем встроенные в браузер Web Audio API для генерации звуков
    this.createSound('build', 440, 0.1, 'sine');
    this.createSound('coin', 880, 0.1, 'square');
    this.createSound('click', 220, 0.05, 'sawtooth');
    this.createSound('hover', 660, 0.05, 'triangle');
    this.createSound('levelup', 523, 0.2, 'sine');
    this.createSound('success', 659, 0.15, 'sine');
  }

  // Создание простого звука с помощью Web Audio API
  private createSound(name: string, frequency: number, duration: number, type: OscillatorType) {
    // Создаем аудио контекст
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Сохраняем функцию для воспроизведения
    this.sounds.set(name, {
      play: () => {
        if (!this.enabled) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }
    } as any);
  }

  // Воспроизвести звук
  play(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound && this.enabled) {
      sound.play();
    }
  }

  // Включить/выключить звук
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Установить громкость
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Получить состояние звука
  isEnabled(): boolean {
    return this.enabled;
  }

  // Получить текущую громкость
  getVolume(): number {
    return this.volume;
  }
}

// Экспортируем singleton экземпляр
export const audioManager = new AudioManager();