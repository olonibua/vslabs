'use client';

import React from 'react';
import type { GenerationProgress, GenerationStatus } from '@/app/types/widget';

interface ProgressIndicatorProps {
  progress: GenerationProgress | null;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className = ''
}) => {
  if (!progress) return null;

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      case 'analyzing':
        return (
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-100"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
          </div>
        );
      case 'synthesizing':
        return (
          <div className="relative">
            <div className="h-5 w-5">
              <svg className="animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4 4 0 10.99 3.496L7 15V6.114l8-1.6v4.9a4 4 0 11.99 3.496L16 13V3z"/>
              </svg>
            </div>
            <div className="absolute -inset-1 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
          </div>
        );
      case 'finalizing':
        return (
          <div className="relative">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
        );
    }
  };

  const getStatusColor = (status: GenerationStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const steps = [
    { status: 'processing', label: 'Processing text' },
    { status: 'analyzing', label: 'Analyzing patterns' },
    { status: 'synthesizing', label: 'Synthesizing audio' },
    { status: 'finalizing', label: 'Finalizing' },
    { status: 'completed', label: 'Complete' }
  ];

  const currentStepIndex = steps.findIndex(step => step.status === progress.step);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon(progress.step)}
          <div>
            <h3 className={`font-semibold ${getStatusColor(progress.step)}`}>
              {progress.message}
            </h3>
            {progress.estimated_time && progress.estimated_time > 0 && (
              <p className="text-sm text-gray-600">
                Estimated time: {Math.ceil(progress.estimated_time / 1000)}s
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(progress.progress)}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress.progress}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.status} className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Label */}
              <div
                className={`mt-2 text-xs text-center max-w-20 transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 w-16 h-0.5 transition-colors duration-300 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                  style={{
                    left: `${((index + 1) * 100) / steps.length}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Details */}
      {progress.step !== 'completed' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
            Working on: {progress.message.toLowerCase()}
          </div>
        </div>
      )}

      {/* Success State */}
      {progress.step === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Your audio is ready! You can now play or download it.
          </div>
        </div>
      )}
    </div>
  );
};