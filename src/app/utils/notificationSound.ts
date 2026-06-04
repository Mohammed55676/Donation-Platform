class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  play() {
    this.init();
    this.playTone(800, 'sine', 0.2, 0.1);
    setTimeout(() => this.playTone(1200, 'sine', 0.3, 0.1), 100);
  }

  playMessage() {
    this.init();
    this.playTone(600, 'triangle', 0.1, 0.05);
    setTimeout(() => this.playTone(800, 'triangle', 0.2, 0.05), 150);
  }

  playSuccess() {
    this.init();
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
  }
}

export const notificationSound = new NotificationSoundGenerator();
