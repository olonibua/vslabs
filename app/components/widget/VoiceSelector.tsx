'use client';

import React, { useState, useEffect } from 'react';
import type { Voice, VoiceFilters } from '@/app/types/widget';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { LANGUAGES } from '@/app/lib/constants';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onVoiceSelect: (voice: Voice) => void;
  onPreview: (voice: Voice) => void;
  loading?: boolean;
  className?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onVoiceSelect,
  onPreview,
  loading = false,
  className = ''
}) => {
  const [filters, setFilters] = useState<VoiceFilters>({});
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>(voices);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  useEffect(() => {
    let filtered = [...voices];

    if (filters.gender) {
      filtered = filtered.filter(voice => voice.gender === filters.gender);
    }

    if (filters.language) {
      filtered = filtered.filter(voice => voice.language === filters.language);
    }

    if (filters.premium !== undefined) {
      filtered = filtered.filter(voice => voice.premium === filters.premium);
    }

    setFilteredVoices(filtered);
  }, [voices, filters]);

  const handlePreview = async (voice: Voice) => {
    if (playingPreview === voice.id) {
      setPlayingPreview(null);
      return;
    }

    setPlayingPreview(voice.id);
    try {
      await onPreview(voice);
      setTimeout(() => setPlayingPreview(null), 3000); // Auto-stop after 3 seconds
    } catch (error) {
      console.error('Preview failed:', error);
      setPlayingPreview(null);
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '🤖';
    }
  };

  const getLanguageFlag = (language: string) => {
    const lang = LANGUAGES.find(l => l.value === language);
    return lang?.flag || '🌐';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Gender:</label>
          <select
            value={filters.gender || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as any || undefined }))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            value={filters.language || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value as any || undefined }))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={filters.premium === undefined ? '' : filters.premium.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({ 
                ...prev, 
                premium: value === '' ? undefined : value === 'true' 
              }));
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Voices</option>
            <option value="false">Free</option>
            <option value="true">Premium</option>
          </select>
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice) => (
          <div
            key={voice.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
              selectedVoice?.id === voice.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onVoiceSelect(voice)}
          >
            {/* Premium Badge */}
            {voice.premium && (
              <div className="absolute top-2 right-2">
                <Badge variant="premium" size="sm">
                  ✨ Premium
                </Badge>
              </div>
            )}

            {/* Voice Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getGenderIcon(voice.gender)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {getLanguageFlag(voice.language)} {voice.accent}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">{voice.description}</p>

              {/* Preview Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(voice);
                }}
                loading={playingPreview === voice.id}
                leftIcon={
                  playingPreview === voice.id ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 4v12l10-6z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                  )
                }
                className="w-full"
              >
                {playingPreview === voice.id ? 'Playing...' : 'Preview'}
              </Button>
            </div>

            {/* Selection Indicator */}
            {selectedVoice?.id === voice.id && (
              <div className="absolute inset-0 rounded-xl border-2 border-blue-500 bg-blue-500/5 pointer-events-none">
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredVoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No voices found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more voices.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({})}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredVoices.length} of {voices.length} voices
        {selectedVoice && (
          <span className="ml-2 text-blue-600 font-medium">
            • {selectedVoice.name} selected
          </span>
        )}
      </div>
    </div>
  );
};