import type { 
  Voice, 
  GenerationRequest, 
  GenerationResult, 
  UsageStats,
  VoiceFilters,
  GenerationProgress
} from '@/app/types/widget';
import type { 
  ApiResponse, 
  VoicesApiResponse, 
  GenerateApiResponse,
  GenerationStatusResponse,
  UsageApiResponse 
} from '@/app/types/api';
import { MOCK_VOICES, GENERATION_STEPS, SAMPLE_TEXTS } from './constants';

class MockApiService {
  private activeGenerations = new Map<string, GenerationProgress>();
  private usageData: UsageStats = {
    total_generations: 0,
    characters_used: 0,
    last_generation: null,
    daily_limit_reached: false,
    premium_features_used: 0
  };

  constructor() {
    this.loadUsageFromStorage();
  }

  private loadUsageFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vsl_usage_stats');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.usageData = {
            ...this.usageData,
            ...parsed,
            last_generation: parsed.last_generation ? new Date(parsed.last_generation) : null
          };
        } catch (error) {
          console.warn('Failed to parse stored usage data:', error);
        }
      }
    }
  }

  private saveUsageToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vsl_usage_stats', JSON.stringify(this.usageData));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateAudioDuration(text: string): number {
    const wordsPerMinute = 150;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  private getRandomSampleAudio(): string {
    const samples = [
      '/audio/samples/sample1.mp3',
      '/audio/samples/sample2.mp3',
      '/audio/samples/sample3.mp3'
    ];
    return samples[Math.floor(Math.random() * samples.length)];
  }

  async getVoices(filters?: VoiceFilters): Promise<VoicesApiResponse> {
    await this.delay(300); // Simulate network delay

    let filteredVoices = [...MOCK_VOICES];

    if (filters) {
      if (filters.gender) {
        filteredVoices = filteredVoices.filter(v => v.gender === filters.gender);
      }
      if (filters.language) {
        filteredVoices = filteredVoices.filter(v => v.language === filters.language);
      }
      if (filters.premium !== undefined) {
        filteredVoices = filteredVoices.filter(v => v.premium === filters.premium);
      }
    }

    return {
      success: true,
      data: {
        voices: filteredVoices,
        total: MOCK_VOICES.length,
        filtered: filteredVoices.length
      },
      timestamp: new Date().toISOString()
    };
  }

  async generateSpeech(request: GenerationRequest): Promise<GenerateApiResponse> {
    await this.delay(500);

    // Check usage limits for demo
    if (this.usageData.total_generations >= 5) {
      return {
        success: false,
        error: 'Daily limit reached. Upgrade to Pro for unlimited generations.',
        timestamp: new Date().toISOString()
      };
    }

    if (request.text.length > 500) {
      return {
        success: false,
        error: 'Text too long. Demo limited to 500 characters.',
        timestamp: new Date().toISOString()
      };
    }

    const jobId = this.generateJobId();
    const estimatedTime = Math.max(3000, request.text.length * 10); // Minimum 3 seconds

    // Start the generation simulation
    this.simulateGeneration(jobId, request);

    return {
      success: true,
      data: {
        job_id: jobId,
        estimated_time: estimatedTime,
        queue_position: 1
      },
      timestamp: new Date().toISOString()
    };
  }

  private async simulateGeneration(jobId: string, request: GenerationRequest): Promise<void> {
    let totalProgress = 0;
    
    for (const step of GENERATION_STEPS) {
      await this.delay(step.duration);
      
      totalProgress += 100 / GENERATION_STEPS.length;
      
      this.activeGenerations.set(jobId, {
        step: step.status,
        progress: Math.min(totalProgress, 100),
        message: step.message,
        estimated_time: step.status === 'completed' ? 0 : 1000
      });
    }

    // Generate final result
    const result: GenerationResult = {
      audio_url: this.getRandomSampleAudio(),
      duration: this.estimateAudioDuration(request.text),
      text_length: request.text.length,
      voice_used: request.voice_id,
      generation_time: GENERATION_STEPS.reduce((sum, step) => sum + step.duration, 0),
      file_size: Math.ceil(request.text.length * 0.8) // Rough estimate in KB
    };

    // Update usage stats
    this.usageData.total_generations += 1;
    this.usageData.characters_used += request.text.length;
    this.usageData.last_generation = new Date();
    this.saveUsageToStorage();

    // Store final result
    this.activeGenerations.set(jobId, {
      step: 'completed',
      progress: 100,
      message: 'Audio ready!',
      estimated_time: 0
    });

    // Clean up after 30 seconds
    setTimeout(() => {
      this.activeGenerations.delete(jobId);
    }, 30000);
  }

  async getGenerationStatus(jobId: string): Promise<GenerationStatusResponse> {
    await this.delay(100);

    const progress = this.activeGenerations.get(jobId);
    
    if (!progress) {
      return {
        success: false,
        error: 'Generation job not found or expired',
        timestamp: new Date().toISOString()
      };
    }

    const response: GenerationStatusResponse = {
      success: true,
      data: {
        status: progress.step,
        progress: progress.progress,
        message: progress.message
      },
      timestamp: new Date().toISOString()
    };

    if (progress.step === 'completed') {
      response.data.result = {
        audio_url: this.getRandomSampleAudio(),
        duration: 10, // Mock duration
        text_length: 100, // Mock length
        voice_used: 'sarah-us-female',
        generation_time: 3000,
        file_size: 85
      };
    }

    return response;
  }

  async getUsageStats(): Promise<UsageApiResponse> {
    await this.delay(200);

    return {
      success: true,
      data: {
        usage: { ...this.usageData },
        limits: {
          daily_characters: 2500,
          daily_generations: 5,
          concurrent_generations: 1
        },
        subscription: {
          tier: 'free',
          features: ['Basic voices', 'Limited generations', 'Standard quality']
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  async getVoicePreview(voiceId: string): Promise<string> {
    await this.delay(300);
    
    const voice = MOCK_VOICES.find(v => v.id === voiceId);
    return voice?.preview_url || '/audio/previews/default.mp3';
  }

  // Utility method for rate limiting
  getRateLimitInfo() {
    const remaining = Math.max(0, 5 - this.usageData.total_generations);
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0); // Reset at midnight

    return {
      limit: 5,
      remaining,
      reset: resetTime.getTime(),
      retryAfter: remaining === 0 ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : null
    };
  }
}

export const mockApi = new MockApiService();