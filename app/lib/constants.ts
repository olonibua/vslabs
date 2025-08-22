import type { Voice, Emotion, Language } from '@/app/types/widget';

export const DEMO_LIMITS = {
  MAX_CHARACTERS: 500,
  MAX_DAILY_GENERATIONS: 5,
  MAX_CONCURRENT_GENERATIONS: 1,
  DEMO_VOICES_ONLY: true,
} as const;

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  BIT_DEPTH: 16,
  CHANNELS: 1,
  FORMAT: 'mp3',
  QUALITY: 'standard',
} as const;

export const SPEED_RANGE = {
  MIN: 0.5,
  MAX: 2.0,
  DEFAULT: 1.0,
  STEP: 0.1,
} as const;

export const EMOTIONS: { value: Emotion; label: string; description: string }[] = [
  { value: 'neutral', label: 'Neutral', description: 'Natural, conversational tone' },
  { value: 'happy', label: 'Happy', description: 'Upbeat and cheerful' },
  { value: 'excited', label: 'Excited', description: 'Energetic and enthusiastic' },
  { value: 'calm', label: 'Calm', description: 'Peaceful and soothing' },
  { value: 'dramatic', label: 'Dramatic', description: 'Intense and theatrical' },
  { value: 'sad', label: 'Sad', description: 'Melancholic and somber' },
];

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { value: 'en-AU', label: 'English (AU)', flag: '🇦🇺' },
  { value: 'es-ES', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr-FR', label: 'French', flag: '🇫🇷' },
  { value: 'de-DE', label: 'German', flag: '🇩🇪' },
  { value: 'it-IT', label: 'Italian', flag: '🇮🇹' },
];

export const MOCK_VOICES: Voice[] = [
  {
    id: 'sarah-us-female',
    name: 'Sarah',
    gender: 'female',
    accent: 'American',
    language: 'en-US',
    preview_url: '/audio/previews/sarah.mp3',
    description: 'Warm and professional female voice',
    premium: false,
    sample_text: 'Hello! I\'m Sarah, and I\'ll help you bring your text to life.'
  },
  {
    id: 'david-us-male',
    name: 'David',
    gender: 'male',
    accent: 'American',
    language: 'en-US',
    preview_url: '/audio/previews/david.mp3',
    description: 'Deep and authoritative male voice',
    premium: false,
    sample_text: 'Hi there, I\'m David. Let me tell your story with clarity and confidence.'
  },
  {
    id: 'emma-gb-female',
    name: 'Emma',
    gender: 'female',
    accent: 'British',
    language: 'en-GB',
    preview_url: '/audio/previews/emma.mp3',
    description: 'Elegant British female voice',
    premium: true,
    sample_text: 'Good day, I\'m Emma. I speak with a refined British accent.'
  },
  {
    id: 'james-gb-male',
    name: 'James',
    gender: 'male',
    accent: 'British',
    language: 'en-GB',
    preview_url: '/audio/previews/james.mp3',
    description: 'Distinguished British male voice',
    premium: true,
    sample_text: 'Greetings, I\'m James. Allow me to narrate with sophistication.'
  },
  {
    id: 'sophia-au-female',
    name: 'Sophia',
    gender: 'female',
    accent: 'Australian',
    language: 'en-AU',
    preview_url: '/audio/previews/sophia.mp3',
    description: 'Friendly Australian female voice',
    premium: true,
    sample_text: 'G\'day! I\'m Sophia from down under, ready to chat.'
  },
  {
    id: 'miguel-es-male',
    name: 'Miguel',
    gender: 'male',
    accent: 'Spanish',
    language: 'es-ES',
    preview_url: '/audio/previews/miguel.mp3',
    description: 'Passionate Spanish male voice',
    premium: true,
    sample_text: 'Hola, soy Miguel. Permíteme contar tu historia con pasión.'
  }
];

export const SAMPLE_TEXTS = [
  "Welcome to Voice Sonic Labs, where cutting-edge AI meets exceptional audio quality.",
  "In the enchanted realm of Lirathen, where the rivers shimmered with golden light, and the mountains sang with the voices of the ancients, there lived a phoenix named Solvinar.",
  "The future of communication lies in the seamless integration of natural language processing and voice synthesis technology.",
  "Once upon a time, in a galaxy far, far away, brave explorers discovered new worlds filled with wonder and mystery.",
  "Transform your content with our revolutionary text-to-speech platform, designed for creators, educators, and businesses worldwide."
];

export const GENERATION_STEPS = [
  { status: 'processing' as const, message: 'Processing your text...', duration: 1000 },
  { status: 'analyzing' as const, message: 'Analyzing speech patterns...', duration: 1500 },
  { status: 'synthesizing' as const, message: 'Synthesizing audio...', duration: 2000 },
  { status: 'finalizing' as const, message: 'Finalizing your audio...', duration: 800 },
  { status: 'completed' as const, message: 'Audio ready!', duration: 500 }
];

export const UPGRADE_PROMPTS = [
  {
    trigger: 'voice_limit',
    title: 'Unlock Premium Voices',
    message: 'Access 50+ professional voices with different accents and styles.',
    cta: 'Upgrade Now'
  },
  {
    trigger: 'usage_limit',
    title: 'You\'ve reached your daily limit',
    message: 'Upgrade to Pro for unlimited generations and longer text support.',
    cta: 'Go Premium'
  },
  {
    trigger: 'character_limit',
    title: 'Need more characters?',
    message: 'Pro users can generate audio from texts up to 10,000 characters.',
    cta: 'Upgrade Today'
  }
];