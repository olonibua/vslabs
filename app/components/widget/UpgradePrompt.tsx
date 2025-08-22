'use client';

import React from 'react';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';

interface UpgradePromptProps {
  trigger: 'voice_limit' | 'usage_limit' | 'character_limit';
  onUpgrade: () => void;
  onDismiss: () => void;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  trigger,
  onUpgrade,
  onDismiss,
  className = ''
}) => {
  const getPromptConfig = () => {
    switch (trigger) {
      case 'voice_limit':
        return {
          icon: '🎭',
          title: 'Unlock Premium Voices',
          description: 'Access 50+ professional voices with different accents, emotions, and speaking styles.',
          features: [
            'Celebrity voice clones',
            'Multiple languages & accents', 
            'Emotional voice control',
            'Custom voice training'
          ],
          cta: 'Upgrade for More Voices',
          badge: 'Premium Voices'
        };
      case 'usage_limit':
        return {
          icon: '⚡',
          title: 'You\'ve Hit Your Daily Limit',
          description: 'Upgrade to Pro for unlimited generations and priority processing.',
          features: [
            'Unlimited daily generations',
            'Priority queue access',
            'Longer text support (10,000 chars)',
            'Bulk generation tools'
          ],
          cta: 'Go Unlimited Today',
          badge: 'Daily Limit Reached'
        };
      case 'character_limit':
        return {
          icon: '📝',
          title: 'Need Longer Text Support?',
          description: 'Pro users can generate audio from texts up to 10,000 characters.',
          features: [
            '10,000 character limit',
            'Book chapter support',
            'Document narration',
            'Batch processing'
          ],
          cta: 'Upgrade for More Text',
          badge: 'Character Limit'
        };
    }
  };

  const config = getPromptConfig();

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{config.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
              <Badge variant="premium" size="sm">{config.badge}</Badge>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{config.description}</p>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Features List */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">What you'll get with Pro:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">$19</span>
              <span className="text-sm text-gray-600">/month</span>
              <Badge variant="new" size="sm">50% OFF</Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">First month only, then $39/month</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Free vs Pro</div>
            <div className="text-xs text-gray-600">5 → Unlimited</div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white/50 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Join 10,000+ creators</div>
            <div className="text-xs text-gray-600">⭐⭐⭐⭐⭐ 4.9/5 rating</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={onUpgrade}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          leftIcon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 12a1 1 0 102 0v-2a1 1 0 10-2 0v2z" clipRule="evenodd"/>
            </svg>
          }
        >
          {config.cta}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onDismiss}
          className="px-6"
        >
          Maybe Later
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          30-day money back
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
          </svg>
          Cancel anytime
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          SSL secured
        </div>
      </div>
    </div>
  );
};