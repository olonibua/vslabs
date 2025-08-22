export type VoiceGender = 'male' | 'female' | 'neutral';
export type Emotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'dramatic';
export type Language = 'en-US' | 'en-GB' | 'en-AU' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT';
export type GenerationStatus = 'idle' | 'processing' | 'analyzing' | 'synthesizing' | 'finalizing' | 'completed' | 'error';

export interface Voice {
  id: string;
  name: string;
  gender: VoiceGender;
  accent: string;
  language: Language;
  preview_url: string;
  description: string;
  premium: boolean;
  sample_text: string;
}

export interface VoiceFilters {
  gender?: VoiceGender;
  language?: Language;
  premium?: boolean;
}

export interface GenerationRequest {
  text: string;
  voice_id: string;
  speed: number;
  emotion: Emotion;
  language: Language;
}

export interface GenerationProgress {
  step: GenerationStatus;
  progress: number;
  message: string;
  estimated_time?: number;
}

export interface GenerationResult {
  audio_url: string;
  duration: number;
  text_length: number;
  voice_used: string;
  generation_time: number;
  file_size: number;
}

export interface UsageStats {
  total_generations: number;
  characters_used: number;
  last_generation: Date | null;
  daily_limit_reached: boolean;
  premium_features_used: number;
}

export interface WidgetState {
  // Voice selection
  voices: Voice[];
  selectedVoice: Voice | null;
  voiceFilters: VoiceFilters;
  
  // Input
  text: string;
  speed: number;
  emotion: Emotion;
  language: Language;
  
  // Generation
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  result: GenerationResult | null;
  
  // Audio
  audioBlob: Blob | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  // Business logic
  usageStats: UsageStats;
  showUpgradePrompt: boolean;
  
  // UI state
  activeTab: 'voices' | 'settings' | 'history';
  errors: string[];
  loading: boolean;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  playbackRate: number;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}