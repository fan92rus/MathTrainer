/* global OscillatorType */
// Аудио-менеджер для звуков в игре
// Использует ленивую инициализацию AudioContext для обхода
// autoplay policy в Safari/Chrome

type SoundPlayFn = () => void;

export class AudioManager {
  private sounds: Map<string, SoundPlayFn> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;
  private audioContext: InstanceType<typeof window.AudioContext> | null = null;
  private initialized: boolean = false;

  /** Ленивая инициализация — вызывается только по первому клику */
  private ensureContext(): InstanceType<typeof window.AudioContext> {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    // Возобновляем контекст, если браузер его приостановил
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /** Создаёт именованный звук (не создаёт AudioContext до первого play) */
  private registerSound(name: string, frequency: number, duration: number, type: OscillatorType): void {
    this.sounds.set(name, () => {
      if (!this.enabled) return;

      const ctx = this.ensureContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    });
  }

  /** Регистрирует все звуки. Безопасно вызывать при загрузке модуля. */
  private registerAllSounds(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.registerSound('build', 440, 0.1, 'sine');
    this.registerSound('coin', 880, 0.1, 'square');
    this.registerSound('click', 220, 0.05, 'sawtooth');
    this.registerSound('hover', 660, 0.05, 'triangle');
    this.registerSound('levelup', 523, 0.2, 'sine');
    this.registerSound('success', 659, 0.15, 'sine');
  }

  // Воспроизвести звук
  play(soundName: string): void {
    this.registerAllSounds();
    const sound = this.sounds.get(soundName);
    if (sound && this.enabled) {
      sound();
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
