'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { AudioWaveform } from './AudioWaveform';
import { audioManager } from '@/app/lib/audioUtils';
import type { AudioPlayerState, GenerationResult } from '@/app/types/widget';

interface AudioPlayerProps {
  audioResult: GenerationResult | null;
  audioBlob?: Blob | null;
  onDownload?: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioResult,
  audioBlob,
  onDownload,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLooping: false,
    playbackRate: 1
  });
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      }));
    };

    const updatePlayState = () => {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: !audio.paused
      }));
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0
      }));
      
      // Setup audio analyser for waveform
      audioManager.setupAnalyser(audio);
      
      // Generate waveform peaks
      const peaks = audioManager.generateWaveformData();
      setWaveformPeaks(peaks);
    };

    const handleEnded = () => {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', updatePlayState);
    audio.addEventListener('pause', updatePlayState);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('play', updatePlayState);
      audio.removeEventListener('pause', updatePlayState);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioResult]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playerState.isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
  };

  const handleVolumeChange = (volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = !playerState.isLooping;
    setPlayerState(prev => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const handleDownload = async () => {
    if (!audioResult?.audio_url && !audioBlob) return;

    setLoading(true);
    try {
      if (audioBlob) {
        audioManager.downloadAudio(audioBlob, `generated-speech-${Date.now()}.mp3`);
      } else if (audioResult?.audio_url) {
        const blob = await audioManager.createAudioBlob(audioResult.audio_url);
        audioManager.downloadAudio(blob, `generated-speech-${Date.now()}.mp3`);
      }
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    return audioManager.formatDuration(seconds);
  };

  const formatFileSize = (bytes: number): string => {
    return audioManager.formatFileSize(bytes * 1024); // Convert KB to bytes
  };

  if (!audioResult) {
    return (
      <div className={`p-6 border-2 border-dashed border-gray-300 rounded-xl text-center ${className}`}>
        <div className="text-gray-400 text-4xl mb-2">🎵</div>
        <p className="text-gray-600">Generate audio to see the player</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioResult.audio_url}
        preload="metadata"
      />

      {/* Player Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Generated Audio</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Duration: {formatTime(audioResult.duration)}</span>
              <span>Size: {formatFileSize(audioResult.file_size)}</span>
              <span>Voice: {audioResult.voice_used}</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            loading={loading}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Download
          </Button>
        </div>
      </div>

      {/* Waveform */}
      <div className="p-4">
        <AudioWaveform
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          peaks={waveformPeaks}
          onSeek={handleSeek}
          height={100}
          animated={true}
        />
      </div>

      {/* Player Controls */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Play Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={togglePlayPause}
              className="rounded-full w-12 h-12 p-0"
            >
              {playerState.isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 4a1 1 0 012 0v12a1 1 0 01-2 0V4zm6 0a1 1 0 012 0v12a1 1 0 01-2 0V4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </Button>

            <div className="text-sm text-gray-600">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex items-center gap-4">
            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Speed:</label>
              <select
                value={playerState.playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.778L4.165 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.165l4.218-3.778a1 1 0 011.617.778z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerState.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16"
              />
            </div>

            {/* Loop Toggle */}
            <Button
              variant={playerState.isLooping ? "primary" : "ghost"}
              size="sm"
              onClick={toggleLoop}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};