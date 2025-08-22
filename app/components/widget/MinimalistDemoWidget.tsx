'use client';

import React, { useState, useEffect } from 'react';
import { mockApi } from '@/app/lib/mockApi';
import { audioManager } from '@/app/lib/audioUtils';
import type { Voice, GenerationRequest, GenerationProgress } from '@/app/types/widget';

interface ContentMode {
  id: string;
  label: string;
  icon: string;
  placeholder: string;
  description: string;
}

export const MinimalistDemoWidget: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<ContentMode | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const contentModes: ContentMode[] = [
    {
      id: 'text-to-speech',
      label: 'Text to Speech',
      icon: '🎙️',
      placeholder: 'Enter any text and we\'ll convert it to natural-sounding speech. Perfect for articles, scripts, or any written content.',
      description: 'Convert text to natural speech'
    },
    {
      id: 'dubbing-lipsync',
      label: 'Dubbing & LipSync',
      icon: '🎬',
      placeholder: 'Describe your video content and we\'ll create synchronized voiceover with perfect lip-sync matching.',
      description: 'AI-powered dubbing with lip synchronization'
    },
    {
      id: 'voice-cloning',
      label: 'Voice Cloning',
      icon: '👤',
      placeholder: 'Provide text and we\'ll clone it in your preferred voice style. Upload a voice sample or choose from our library.',
      description: 'Clone and replicate specific voice characteristics'
    },
    {
      id: 'tell-story',
      label: 'Tell A Story',
      icon: '📚',
      placeholder: 'Write your story and we\'ll narrate it with engaging expression, perfect pacing, and emotional depth.',
      description: 'Professional storytelling with emotional narration'
    },
    {
      id: 'podcast-intro',
      label: 'Introduce A Podcast',
      icon: '🎧',
      placeholder: 'Describe your podcast and we\'ll create a compelling introduction with professional broadcasting style.',
      description: 'Engaging podcast introductions and outros'
    },
    {
      id: 'video-voiceover',
      label: 'Create A Video Voiceover',
      icon: '📹',
      placeholder: 'Describe your video content and we\'ll create professional voiceover that matches your video\'s tone and pacing.',
      description: 'Professional video narration and voiceover'
    }
  ];

  const getSampleTexts = (modeId: string) => {
    const samples = {
      'text-to-speech': [
        "Welcome to Voice Sonic Labs, where cutting-edge AI meets exceptional audio quality. Transform your content with our revolutionary text-to-speech platform, designed for creators, educators, and businesses worldwide.",
        "The future of communication lies in the seamless integration of natural language processing and voice synthesis technology. Our advanced AI delivers human-like speech that captures every nuance and emotion.",
        "In the digital age, accessibility is not just important—it's essential. Our text-to-speech technology breaks down barriers, making content available to everyone, regardless of their reading abilities or visual impairments."
      ],
      'dubbing-lipsync': [
        "Create a 30-second product demonstration video where a tech entrepreneur explains how their revolutionary smart home device can transform daily routines through voice commands and AI automation.",
        "Generate synchronized voiceover for a travel documentary segment showcasing the ancient temples of Kyoto, with dramatic narration that captures the spiritual atmosphere and historical significance.",
        "Produce lip-synced dialogue for an educational video where a marine biologist explains coral reef ecosystems to children, using simple language with enthusiastic and engaging delivery."
      ],
      'voice-cloning': [
        "Hello, this is a demonstration of our voice cloning technology. As you can hear, we can replicate the unique characteristics, tone, and speaking patterns of any voice with remarkable accuracy and natural flow.",
        "Good morning everyone! I'm excited to showcase how our AI can capture not just the sound of a voice, but also the personality, emotions, and speaking style that makes each person's voice truly unique.",
        "This technology opens up incredible possibilities for content creators, allowing them to maintain consistent narration across multiple projects while preserving the authentic character of their chosen voice."
      ],
      'tell-story': [
        "In the enchanted realm of Lirathen, where the rivers shimmered with golden light and the mountains sang with the voices of the ancients, there lived a phoenix named Solvinar. Unlike the fiery legends that spoke of destruction and ash, Solvinar was a beacon of hope and renewal, cherished by all who glimpsed his radiant flight.",
        "Once upon a time, in a small village nestled between rolling hills and whispering forests, lived an old clockmaker named Henrik. His workshop was filled with the gentle ticking of a hundred timepieces, each one crafted with love and precision. But Henrik's greatest creation was not a clock at all—it was a mechanical bird that could sing the songs of memories.",
        "The last bookstore on Earth stood at the corner of Memory Lane and Tomorrow Street. Its keeper, an elderly woman named Clara, had witnessed the world's transformation from paper to pixels. But she held onto something precious—stories that had never been digitized, tales that existed only in whispered words and turning pages."
      ],
      'podcast-intro': [
        "Welcome to 'Future Minds'—the podcast where we explore the intersection of technology, psychology, and human potential. I'm your host, and today we're diving deep into how artificial intelligence is reshaping the way we think, learn, and connect with each other.",
        "You're listening to 'Startup Stories'—real conversations with real entrepreneurs about the messy, challenging, and ultimately rewarding journey of building something from nothing. I'm here with founders who've been in the trenches, and today we're talking about failure, resilience, and the power of perseverance.",
        "This is 'Science Simplified'—where we take the most complex discoveries and breakthroughs in science and make them accessible to everyone. Whether you're a curious student or a lifelong learner, we're here to spark your wonder about the incredible world around us."
      ],
      'video-voiceover': [
        "Imagine a world where your morning routine is perfectly orchestrated by AI. Your coffee brews as you wake, your calendar optimizes based on traffic patterns, and your smart home adjusts everything from lighting to temperature. This isn't science fiction—it's the reality we're building today.",
        "Behind every successful product launch lies months of research, countless iterations, and the dedication of passionate teams. Today, we take you behind the scenes to see how innovative ideas transform from sketches on a whiteboard to products that change lives.",
        "Nature has always been our greatest teacher. From the aerodynamics of bird flight that inspired aviation to the efficiency of ant colonies that influences logistics algorithms, biomimicry continues to drive technological breakthroughs that solve humanity's greatest challenges."
      ]
    };
    return samples[modeId as keyof typeof samples] || samples['text-to-speech'];
  };

  useEffect(() => {
    loadVoices();
    loadUsageStats();
    setSelectedMode(contentModes[0]);
  }, []);

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

  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim() || !selectedMode) return;

    setIsGenerating(true);
    setAudioUrl(null);
    setGenerationProgress(null);

    try {
      const request: GenerationRequest = {
        text: text,
        voice_id: selectedVoice.id,
        speed: 1.0,
        emotion: 'neutral',
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
          setAudioUrl(response.data.result.audio_url);
          setIsGenerating(false);
          setUsageCount(prev => prev + 1);
        } else if (response.data.status !== 'completed') {
          setTimeout(() => pollGenerationStatus(jobId), 1000);
        }
      }
    } catch (error) {
      setIsGenerating(false);
    }
  };

  const handlePlay = async () => {
    if (!audioUrl) return;

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

  const getProgressWidth = () => {
    return generationProgress ? `${generationProgress.progress}%` : '0%';
  };

  const characterCount = text.length;
  const maxChars = 500;
  const isNearLimit = characterCount > maxChars * 0.8;
  const isOverLimit = characterCount > maxChars;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Usage Progress Bar */}
      {usageCount > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Demo Progress</span>
            <span className="text-sm text-gray-500">{usageCount}/5 generations used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${(usageCount / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Compact Selectors Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Content Type Selector - Compact */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="w-full p-4 bg-white border border-gray-300 rounded-xl text-left hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">{selectedMode?.icon}</div>
                <div className="font-medium text-gray-900">{selectedMode?.label}</div>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showModeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {contentModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode);
                    setShowModeDropdown(false);
                    setText('');
                  }}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedMode?.id === mode.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{mode.icon}</div>
                    <div className="font-medium text-gray-900">{mode.label}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Selector - Compact */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
          <button
            onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
            className="w-full p-4 bg-white border border-gray-300 rounded-xl text-left hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedVoice?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedVoice?.name} {selectedVoice?.premium && '✨'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Voice preview logic
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Preview voice"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142" />
                  </svg>
                </button>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showVoiceDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {showVoiceDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice);
                    setShowVoiceDropdown(false);
                  }}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedVoice?.id === voice.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {voice.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {voice.name}
                        {voice.premium && <span className="text-yellow-500 text-sm">✨</span>}
                      </div>
                      <div className="text-xs text-gray-600">{voice.accent}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Preview logic
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compact Sample Text Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Samples</label>
        <div className="flex flex-wrap gap-2">
          {getSampleTexts(selectedMode?.id || 'text-to-speech').map((sample, index) => (
            <button
              key={index}
              onClick={() => setText(sample)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
              title={sample.substring(0, 100) + (sample.length > 100 ? '...' : '')}
            >
              <span className="font-medium">Sample {index + 1}</span>
              <span className="text-xs text-gray-500">
                ({sample.split(' ').length} words)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Text Input Area */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Custom Content</label>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear text
            </button>
          )}
        </div>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selectedMode?.placeholder}
            className="w-full h-80 p-8 text-lg border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-blue-500 transition-all duration-200 leading-relaxed bg-gray-50/50"
            maxLength={maxChars}
          />
          
          {/* Smart Generate Button */}
          <button
            onClick={audioUrl ? handlePlay : handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="absolute bottom-8 right-8 w-16 h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
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

        {/* Enhanced Character Counter and Stats */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {text && (
              <>
                <span>~{audioManager.estimateTextDuration(text)}s audio</span>
                <span>•</span>
                <span>{text.split(' ').length} words</span>
              </>
            )}
          </div>
          <div className={`text-sm font-medium ${
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {characterCount}/{maxChars}
          </div>
        </div>
      </div>

      {/* Advanced Generation Progress */}
      {isGenerating && (
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {generationProgress?.message || 'Initializing...'}
              </div>
              <div className="text-sm text-gray-600">
                Creating {selectedMode?.label.toLowerCase()} with {selectedVoice?.name} voice
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: getProgressWidth() }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {Math.round(generationProgress?.progress || 0)}% complete
            </div>
          </div>
        </div>
      )}

      {/* Success State with Enhanced Actions */}
      {audioUrl && !isGenerating && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Audio Ready!</div>
                <div className="text-sm text-gray-600">
                  Generated with {selectedVoice?.name} • {selectedMode?.label}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => audioManager.downloadAudio(new Blob(), 'vsl-audio.mp3')}
                className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Business Prompts */}
      {usageCount >= 3 && (
        <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="mb-4">
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-semibold text-gray-900 text-lg">Ready for unlimited creation?</div>
            <div className="text-gray-600 mt-1">
              You've experienced the quality. Upgrade to unlock all voices, unlimited generations, and premium features.
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              Upgrade Now
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};