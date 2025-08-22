'use client';

import React, { useState } from 'react';
import { ImprovedDemoWidget } from './ImprovedDemoWidget';
import { MinimalistDemoWidget } from './MinimalistDemoWidget';
import { FramerDemoWidget } from './FramerDemoWidget';

type WidgetVersion = 'minimalist' | 'enhanced' | 'framer';

export const WidgetSwitcher: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState<WidgetVersion>('minimalist');

  return (
    <div className="w-full">
      {/* Version Selector */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-8">
        {/* Mobile: Stacked buttons */}
        <div className="sm:hidden space-y-2">
          <button
            onClick={() => setActiveVersion('minimalist')}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeVersion === 'minimalist'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Minimalist
            </div>
          </button>
          
          <button
            onClick={() => setActiveVersion('enhanced')}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeVersion === 'enhanced'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enhanced
            </div>
          </button>

          <button
            onClick={() => setActiveVersion('framer')}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeVersion === 'framer'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Framer Motion
            </div>
          </button>
        </div>

        {/* Desktop: Horizontal buttons */}
        <div className="hidden sm:block">
          <div className="bg-white rounded-xl border border-gray-200 p-2 inline-flex shadow-sm flex-wrap">
            <button
              onClick={() => setActiveVersion('minimalist')}
              className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeVersion === 'minimalist'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span className="hidden md:inline">Minimalist</span>
                <span className="md:hidden">Min</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveVersion('enhanced')}
              className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeVersion === 'enhanced'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden md:inline">Enhanced</span>
                <span className="md:hidden">Enh</span>
              </div>
            </button>

            <button
              onClick={() => setActiveVersion('framer')}
              className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeVersion === 'framer'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden lg:inline">Framer Motion</span>
                <span className="lg:hidden">Motion</span>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-sm text-gray-600">
          {activeVersion === 'minimalist' ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Clean and simple - matches current VSLabs design</span>
            </div>
          ) : activeVersion === 'enhanced' ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Feature-rich - advanced controls and professional UI</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Motion design - smooth interactions with sound effects</span>
            </div>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="transition-all duration-300">
        {activeVersion === 'minimalist' ? (
          <div>
            {/* Minimalist Header */}
            <div className="text-center mb-8 md:mb-12 px-4 md:px-6">
              <div className="text-sm text-gray-500 mb-4">Try it for yourself</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                Quality you can stand by
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Here's a playground for you to let your inner child out. We know you'll love our platform, 
                but for now have some fun on the house.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <MinimalistDemoWidget />
            </div>
          </div>
        ) : activeVersion === 'enhanced' ? (
          <ImprovedDemoWidget />
        ) : (
          <div>
            {/* Framer Header */}
            <div className="text-center mb-8 md:mb-12 px-4 md:px-6">
              <div className="text-sm text-gray-500 mb-4">Experience the future</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                Fluid. Interactive. Sonic.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Step into a world where every interaction feels alive. Advanced motion design meets 
                cutting-edge voice technology.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <FramerDemoWidget />
            </div>
          </div>
        )}
      </div>

      {/* Comparison Notes */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-12 md:mt-16 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Comparison</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Minimalist */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Minimalist Version</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ <strong>6 professional voices</strong> (vs 1 original)</li>
                <li>✓ <strong>Voice preview functionality</strong> with audio samples</li>
                <li>✓ <strong>Quick sample texts</strong> for easy testing</li>
                <li>✓ <strong>Smart progress tracking</strong> with realistic updates</li>
                <li>✓ <strong>Usage limits & upgrade prompts</strong> for business growth</li>
                <li>✓ <strong>Duration estimation</strong> and enhanced feedback</li>
                <li>✓ <strong>Error handling</strong> and download functionality</li>
                <li>✓ <strong>Clean, VSLabs-style design</strong> - seamless integration</li>
              </ul>
            </div>

            {/* Enhanced */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Enhanced Version</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Professional voice selection grid</li>
                <li>✓ Advanced controls (speed, emotion, language)</li>
                <li>✓ Real-time audio waveform visualization</li>
                <li>✓ Enhanced audio player with custom controls</li>
                <li>✓ Smart business logic and upgrade prompts</li>
                <li>✓ Production-ready for enterprise use</li>
              </ul>
            </div>

            {/* Framer */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Framer Motion</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Smooth motion animations and transitions</li>
                <li>✓ Interactive sound effects on interactions</li>
                <li>✓ Floating controls with hover animations</li>
                <li>✓ Circular progress indicators</li>
                <li>✓ Advanced emotion and speed controls</li>
                <li>✓ Compact design with maximum features</li>
                <li>✓ Web Audio API integration</li>
                <li>✓ Modern micro-interaction patterns</li>
              </ul>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
};