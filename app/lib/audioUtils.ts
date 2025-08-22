export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaElementAudioSourceNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setupAnalyser(audioElement: HTMLAudioElement): void {
    if (!this.audioContext) return;

    try {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      if (!this.source) {
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.warn('Failed to setup audio analyser:', error);
    }
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  generateWaveformData(peaks: number[] = []): number[] {
    if (peaks.length > 0) return peaks;

    // Generate mock waveform data for demo
    const length = 100;
    const waveform = [];
    
    for (let i = 0; i < length; i++) {
      const baseHeight = Math.sin((i / length) * Math.PI * 4) * 0.5 + 0.5;
      const noise = (Math.random() - 0.5) * 0.3;
      waveform.push(Math.max(0, Math.min(1, baseHeight + noise)));
    }
    
    return waveform;
  }

  estimateTextDuration(text: string, wordsPerMinute: number = 150): number {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  createAudioBlob(audioUrl: string): Promise<Blob> {
    return fetch(audioUrl)
      .then(response => response.blob())
      .catch(error => {
        console.error('Failed to create audio blob:', error);
        throw error;
      });
  }

  downloadAudio(blob: Blob, filename: string = 'generated-speech.mp3'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  cleanup(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.dataArray = null;
  }
}

export const audioManager = new AudioManager();