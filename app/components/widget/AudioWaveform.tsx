'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { WaveformData } from '@/app/types/widget';

interface AudioWaveformProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  peaks?: number[];
  onSeek?: (time: number) => void;
  height?: number;
  className?: string;
  animated?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  currentTime,
  duration,
  peaks = [],
  onSeek,
  height = 80,
  className = '',
  animated = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);

  // Generate default waveform if no peaks provided
  const waveformPeaks = peaks.length > 0 ? peaks : generateDefaultWaveform(100);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [waveformPeaks, currentTime, duration, hoveredPosition, canvasWidth, isPlaying]);

  function generateDefaultWaveform(bars: number): number[] {
    const waveform = [];
    for (let i = 0; i < bars; i++) {
      const progress = i / bars;
      const baseHeight = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;
      const noise = (Math.random() - 0.5) * 0.2;
      waveform.push(Math.max(0.1, Math.min(1, baseHeight + noise)));
    }
    return waveform;
  }

  function drawWaveform() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, height);

    const barWidth = canvasWidth / waveformPeaks.length;
    const barSpacing = Math.max(1, barWidth * 0.1);
    const actualBarWidth = barWidth - barSpacing;

    const progressPosition = duration > 0 ? (currentTime / duration) * canvasWidth : 0;

    waveformPeaks.forEach((peak, index) => {
      const x = index * barWidth;
      const barHeight = Math.max(2, peak * (height - 10));
      const y = (height - barHeight) / 2;

      // Determine bar color based on position
      let fillStyle = '#e5e7eb'; // Default gray

      if (x <= progressPosition) {
        fillStyle = isPlaying ? '#3b82f6' : '#6b7280'; // Blue if playing, gray if paused
      } else if (hoveredPosition !== null && x <= hoveredPosition) {
        fillStyle = '#93c5fd'; // Light blue on hover
      }

      // Add animation for playing state
      if (isPlaying && animated && x <= progressPosition + barWidth && x >= progressPosition - barWidth) {
        const animationFactor = 0.8 + 0.4 * Math.sin(Date.now() * 0.01 + index);
        ctx.fillStyle = `rgba(59, 130, 246, ${animationFactor})`;
      } else {
        ctx.fillStyle = fillStyle;
      }

      // Draw rounded rectangle
      drawRoundedRect(ctx, x, y, actualBarWidth, barHeight, 1);
    });

    // Draw progress indicator
    if (duration > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressPosition, 0);
      ctx.lineTo(progressPosition, height);
      ctx.stroke();

      // Draw time indicator dot
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(progressPosition, height / 2, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!onSeek) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    setHoveredPosition(x);
  }

  function handleMouseLeave() {
    setHoveredPosition(null);
  }

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!onSeek || duration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickedTime = (x / canvasWidth) * duration;
    onSeek(Math.max(0, Math.min(duration, clickedTime)));
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const hoveredTime = hoveredPosition && duration > 0 
    ? (hoveredPosition / canvasWidth) * duration 
    : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={height}
        className={`w-full ${onSeek ? 'cursor-pointer' : ''} rounded-lg`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ height: `${height}px` }}
      />

      {/* Time Tooltip */}
      {hoveredPosition !== null && hoveredTime !== null && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: hoveredPosition,
            top: -8
          }}
        >
          {formatTime(hoveredTime)}
        </div>
      )}

      {/* Time Labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Visual States */}
      {isPlaying && animated && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
          </div>
        </div>
      )}
    </div>
  );
};