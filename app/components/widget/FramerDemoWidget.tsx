'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '@/app/lib/mockApi';
import { audioManager } from '@/app/lib/audioUtils';
import type { Voice, GenerationRequest, GenerationProgress, Emotion } from '@/app/types/widget';

interface ContentMode {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  description: string;
}

export const FramerDemoWidget: React.FC = () => {
  // State management
  const [selectedMode, setSelectedMode] = useState<ContentMode | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);

  const contentModes: ContentMode[] = [
    {
      id: 'text-to-speech',
      label: 'Text to Speech',
      icon: '🎙️',
      gradient: 'from-gray-900 to-gray-700',
      description: 'Convert text to natural speech'
    },
    {
      id: 'voice-cloning',
      label: 'Voice Cloning',
      icon: '👤',
      gradient: 'from-gray-800 to-gray-600',
      description: 'Clone voice characteristics'
    },
    {
      id: 'tell-story',
      label: 'Tell A Story',
      icon: '📚',
      gradient: 'from-gray-700 to-gray-500',
      description: 'Narrative with emotion'
    },
    {
      id: 'podcast-intro',
      label: 'Podcast Intro',
      icon: '🎧',
      gradient: 'from-gray-600 to-gray-400',
      description: 'Professional broadcasting'
    }
  ];

  const emotions: { value: Emotion; label: string; icon: string }[] = [
    { value: 'neutral', label: 'Neutral', icon: '😐' },
    { value: 'happy', label: 'Happy', icon: '😊' },
    { value: 'excited', label: 'Excited', icon: '🤩' },
    { value: 'calm', label: 'Calm', icon: '😌' },
    { value: 'dramatic', label: 'Dramatic', icon: '🎭' }
  ];

  useEffect(() => {
    loadVoices();
    loadUsageStats();
    setSelectedMode(contentModes[0]);
    initAudioContext();
  }, []);

  const initAudioContext = () => {
    if (typeof window !== 'undefined' && soundEnabled) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not available');
      }
    }
  };

  const playSound = (frequency: number, duration: number = 100, type: 'click' | 'success' | 'progress' = 'click') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type === 'click' ? 'sine' : type === 'success' ? 'triangle' : 'square';

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  const loadVoices = async () => {
    try {
      const response = await mockApi.getVoices();
      if (response.success) {
        setVoices(response.data.voices);
        setSelectedVoice(response.data.voices[0] || null);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await mockApi.getUsageStats();
      if (response.success) {
        setUsageCount(response.data.usage.total_generations);
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }
  };

  const handleModeSelect = (mode: ContentMode) => {
    playSound(800, 80, 'click');
    setSelectedMode(mode);
    setText('');
  };

  const handleVoiceSelect = (voice: Voice) => {
    playSound(600, 80, 'click');
    setSelectedVoice(voice);
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    playSound(700, 80, 'click');
    setSelectedEmotion(emotion);
  };

  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim() || !selectedMode) return;

    playSound(1000, 150, 'progress');
    setIsGenerating(true);
    setAudioUrl(null);
    setGenerationProgress(null);

    try {
      const request: GenerationRequest = {
        text: text,
        voice_id: selectedVoice.id,
        speed: speed,
        emotion: selectedEmotion,
        language: 'en-US'
      };

      const response = await mockApi.generateSpeech(request);
      
      if (response.success) {
        pollGenerationStatus(response.data.job_id);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      setIsGenerating(false);
    }
  };

  const pollGenerationStatus = async (jobId: string) => {
    try {
      const response = await mockApi.getGenerationStatus(jobId);
      
      if (response.success) {
        setGenerationProgress(response.data);

        if (response.data.status === 'completed' && response.data.result) {
          playSound(800, 200, 'success');
          setAudioUrl(response.data.result.audio_url);
          setIsGenerating(false);
          setUsageCount(prev => prev + 1);
        } else if (response.data.status !== 'completed') {
          playSound(400 + response.data.progress * 4, 50, 'progress');
          setTimeout(() => pollGenerationStatus(jobId), 800);
        }
      }
    } catch (error) {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    if (!audioUrl) return;

    playSound(isPlaying ? 400 : 600, 100, 'click');
    
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const quickSamples = [
    "Welcome to the future of AI voice technology.",
    "Transform your ideas into natural-sounding speech.",
    "Experience professional-grade voice synthesis."
  ];

  const characterCount = text.length;
  const maxChars = 500;
  const progressPercentage = Math.min((characterCount / maxChars) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Floating Controls Bar */}
      <div className="sticky top-4 z-50 mb-8">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Usage Progress Ring */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                  <circle 
                    cx="24" 
                    cy="24" 
                    r="20" 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="3"
                    strokeDasharray={`${(usageCount / 5) * 125.6} 125.6`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">{5 - usageCount}</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium text-gray-900">Demo Generations</div>
                <div className="text-gray-600">{usageCount}/5 used</div>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSound(soundEnabled ? 300 : 800, 100, 'click');
              }}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              <svg className={`w-5 h-5 transition-colors ${soundEnabled ? 'text-gray-900' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {soundEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a8 8 0 010 11.314m2.828-2.828a4 4 0 010 5.656" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-900 mb-4 tracking-wide">CONTENT TYPE</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {contentModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedMode?.id === mode.id 
                  ? 'border-gray-900 bg-gray-900 text-white shadow-xl' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-2xl mb-2 transform transition-transform group-hover:scale-110">
                  {mode.icon}
                </div>
                <div className="font-bold text-sm">{mode.label}</div>
                <div className={`text-xs mt-1 transition-colors ${
                  selectedMode?.id === mode.id ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {mode.description}
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedMode?.id === mode.id && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Voice & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Voice Selection */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-900 mb-4 tracking-wide">VOICE</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {voices.slice(0, 6).map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceSelect(voice)}
                className={`group p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  selectedVoice?.id === voice.id 
                    ? 'border-gray-900 bg-gray-900 text-white shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    selectedVoice?.id === voice.id ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                  }`}>
                    {voice.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{voice.name}</div>
                    <div className={`text-xs ${selectedVoice?.id === voice.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {voice.accent}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-gray-900 tracking-wide">SETTINGS</label>
            <button
              onClick={() => {
                setShowAdvanced(!showAdvanced);
                playSound(600, 80, 'click');
              }}
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Speed Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Speed</span>
                <span className="text-sm text-gray-900 font-bold">{speed}x</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => {
                    setSpeed(Number(e.target.value));
                    playSound(300 + Number(e.target.value) * 200, 50, 'click');
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Emotion Selection */}
            {showAdvanced && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Emotion</span>
                <div className="grid grid-cols-3 gap-2">
                  {emotions.slice(0, 6).map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => handleEmotionSelect(emotion.value)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        selectedEmotion === emotion.value 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg mb-1">{emotion.icon}</div>
                      {emotion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Samples */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-3 tracking-wide">QUICK START</label>
        <div className="flex flex-wrap gap-2">
          {quickSamples.map((sample, index) => (
            <button
              key={index}
              onClick={() => {
                setText(sample);
                playSound(500, 80, 'click');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Sample {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input with Floating Generate Button */}
      <div className="relative mb-8">
        <label className="block text-sm font-bold text-gray-900 mb-3 tracking-wide">CONTENT</label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-64 p-6 text-lg border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-gray-900 transition-all duration-300 bg-gray-50/50"
            maxLength={maxChars}
          />
          
          {/* Character Progress Bar */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                {text && `~${audioManager.estimateTextDuration(text)}s audio`}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {characterCount}/{maxChars}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="h-1 bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Floating Generate Button */}
          <button
            onClick={audioUrl ? handlePlay : handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="absolute -bottom-4 right-6 w-16 h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            {isGenerating ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : audioUrl ? (
              isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 4a1 1 0 012 0v12a1 1 0 01-2 0V4zm6 0a1 1 0 012 0v12a1 1 0 01-2 0V4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && generationProgress && (
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">
                {generationProgress.message}
              </div>
              <div className="text-gray-600">
                Creating {selectedMode?.label.toLowerCase()} with {selectedVoice?.name} voice
              </div>
            </div>
          </div>
          
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gray-900 transition-all duration-500 ease-out"
              style={{ width: `${generationProgress.progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
          
          <div className="text-center mt-3 font-bold text-gray-900">
            {Math.round(generationProgress.progress)}%
          </div>
        </div>
      )}

      {/* Success State */}
      {audioUrl && !isGenerating && (
        <div className="mb-8 p-6 bg-gray-900 text-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg">Audio Ready!</div>
                <div className="text-gray-300">
                  Generated with {selectedVoice?.name} • {selectedEmotion} emotion
                </div>
              </div>
            </div>
            
            <button
              onClick={() => audioManager.downloadAudio(new Blob(), 'vsl-audio.mp3')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};