'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VoiceSelector } from './VoiceSelector';
import { AudioPlayer } from './AudioPlayer';
import { ProgressIndicator } from './ProgressIndicator';
import { UpgradePrompt } from './UpgradePrompt';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { mockApi } from '@/app/lib/mockApi';
import { audioManager } from '@/app/lib/audioUtils';
import { EMOTIONS, LANGUAGES, SAMPLE_TEXTS, DEMO_LIMITS } from '@/app/lib/constants';
import type { 
  Voice, 
  WidgetState, 
  GenerationRequest, 
  GenerationProgress,
  Emotion,
  Language 
} from '@/app/types/widget';

export const ImprovedDemoWidget: React.FC = () => {
  const [state, setState] = useState<WidgetState>({
    voices: [],
    selectedVoice: null,
    voiceFilters: {},
    text: '',
    speed: 1.0,
    emotion: 'neutral',
    language: 'en-US',
    isGenerating: false,
    generationProgress: null,
    result: null,
    audioBlob: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    usageStats: {
      total_generations: 0,
      characters_used: 0,
      last_generation: null,
      daily_limit_reached: false,
      premium_features_used: 0
    },
    showUpgradePrompt: false,
    activeTab: 'voices',
    errors: [],
    loading: false
  });

  const [upgradePromptTrigger, setUpgradePromptTrigger] = useState<'voice_limit' | 'usage_limit' | 'character_limit' | null>(null);

  // Load initial data
  useEffect(() => {
    loadVoices();
    loadUsageStats();
  }, []);

  const loadVoices = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await mockApi.getVoices();
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          voices: response.data.voices,
          selectedVoice: response.data.voices[0] || null,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errors: ['Failed to load voices'], 
        loading: false 
      }));
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await mockApi.getUsageStats();
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          usageStats: response.data.usage
        }));
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }
  };

  const handleVoiceSelect = (voice: Voice) => {
    if (voice.premium && state.usageStats.total_generations >= 2) {
      setUpgradePromptTrigger('voice_limit');
      setState(prev => ({ ...prev, showUpgradePrompt: true }));
      return;
    }
    
    setState(prev => ({ ...prev, selectedVoice: voice }));
  };

  const handleVoicePreview = async (voice: Voice) => {
    try {
      const previewUrl = await mockApi.getVoicePreview(voice.id);
      const audio = new Audio(previewUrl);
      audio.volume = 0.7;
      await audio.play();
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleTextChange = (newText: string) => {
    if (newText.length > DEMO_LIMITS.MAX_CHARACTERS) {
      setUpgradePromptTrigger('character_limit');
      setState(prev => ({ ...prev, showUpgradePrompt: true }));
      return;
    }
    
    setState(prev => ({ ...prev, text: newText }));
  };

  const handleGenerate = async () => {
    if (!state.selectedVoice || !state.text.trim()) return;

    if (state.usageStats.total_generations >= DEMO_LIMITS.MAX_DAILY_GENERATIONS) {
      setUpgradePromptTrigger('usage_limit');
      setState(prev => ({ ...prev, showUpgradePrompt: true }));
      return;
    }

    const request: GenerationRequest = {
      text: state.text,
      voice_id: state.selectedVoice.id,
      speed: state.speed,
      emotion: state.emotion,
      language: state.language
    };

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      result: null,
      errors: []
    }));

    try {
      const response = await mockApi.generateSpeech(request);
      
      if (!response.success) {
        setState(prev => ({ 
          ...prev, 
          errors: [response.error || 'Generation failed'],
          isGenerating: false
        }));
        return;
      }

      // Poll for progress
      const jobId = response.data.job_id;
      pollGenerationStatus(jobId);

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errors: ['Network error occurred'],
        isGenerating: false
      }));
    }
  };

  const pollGenerationStatus = async (jobId: string) => {
    try {
      const response = await mockApi.getGenerationStatus(jobId);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          generationProgress: response.data
        }));

        if (response.data.status === 'completed' && response.data.result) {
          setState(prev => ({ 
            ...prev, 
            result: response.data.result!,
            isGenerating: false,
            usageStats: {
              ...prev.usageStats,
              total_generations: prev.usageStats.total_generations + 1,
              characters_used: prev.usageStats.characters_used + prev.text.length
            }
          }));
        } else if (response.data.status !== 'completed') {
          // Continue polling
          setTimeout(() => pollGenerationStatus(jobId), 1000);
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errors: ['Failed to get generation status'],
        isGenerating: false
      }));
    }
  };

  const handleUpgrade = () => {
    // In a real app, this would redirect to payment flow
    window.open('https://vslabs.ai/pricing', '_blank');
  };

  const dismissUpgradePrompt = () => {
    setState(prev => ({ ...prev, showUpgradePrompt: false }));
    setUpgradePromptTrigger(null);
  };

  const useSampleText = (text: string) => {
    setState(prev => ({ ...prev, text }));
  };

  const getCharacterCountColor = () => {
    const ratio = state.text.length / DEMO_LIMITS.MAX_CHARACTERS;
    if (ratio >= 1) return 'text-red-600';
    if (ratio >= 0.8) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const estimatedDuration = audioManager.estimateTextDuration(state.text);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Voice Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your text into natural-sounding speech with our advanced AI voices. 
          Try our demo below to experience the quality.
        </p>
        
        {/* Usage Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {state.usageStats.total_generations}/{DEMO_LIMITS.MAX_DAILY_GENERATIONS} generations used
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {state.usageStats.characters_used} characters generated
            </Badge>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {state.showUpgradePrompt && upgradePromptTrigger && (
        <UpgradePrompt
          trigger={upgradePromptTrigger}
          onUpgrade={handleUpgrade}
          onDismiss={dismissUpgradePrompt}
        />
      )}

      {/* Main Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Text Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enter Your Text</h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getCharacterCountColor()}`}>
                  {state.text.length}/{DEMO_LIMITS.MAX_CHARACTERS}
                </span>
                <span className="text-xs text-gray-500">
                  ~{estimatedDuration}s audio
                </span>
              </div>
            </div>
            
            <textarea
              value={state.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={DEMO_LIMITS.MAX_CHARACTERS}
            />

            {/* Sample Texts */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Try these samples:</h4>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_TEXTS.slice(0, 3).map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useSampleText(sample)}
                    className="text-xs"
                  >
                    Sample {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Speed Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {state.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={state.speed}
                  onChange={(e) => setState(prev => ({ ...prev, speed: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Emotion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emotion</label>
                <select
                  value={state.emotion}
                  onChange={(e) => setState(prev => ({ ...prev, emotion: e.target.value as Emotion }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {EMOTIONS.map(emotion => (
                    <option key={emotion.value} value={emotion.value}>
                      {emotion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={state.language}
                  onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as Language }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            disabled={!state.selectedVoice || !state.text.trim() || state.isGenerating}
            loading={state.isGenerating}
            className="w-full"
            leftIcon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 12a1 1 0 102 0v-2a1 1 0 10-2 0v2z" clipRule="evenodd"/>
              </svg>
            }
          >
            {state.isGenerating ? 'Generating Audio...' : 'Generate Speech'}
          </Button>

          {/* Errors */}
          {state.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <ul className="mt-2 text-sm text-red-700">
                {state.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Voice Selection */}
          <VoiceSelector
            voices={state.voices}
            selectedVoice={state.selectedVoice}
            onVoiceSelect={handleVoiceSelect}
            onPreview={handleVoicePreview}
            loading={state.loading}
          />

          {/* Progress Indicator */}
          {state.isGenerating && state.generationProgress && (
            <ProgressIndicator progress={state.generationProgress} />
          )}

          {/* Audio Player */}
          <AudioPlayer
            audioResult={state.result}
            audioBlob={state.audioBlob}
            onDownload={() => {}}
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready for More Advanced Features?
        </h3>
        <p className="text-gray-600 mb-4">
          Unlock unlimited generations, premium voices, and enterprise features.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          View Pricing Plans
        </Button>
      </div>
    </div>
  );
};