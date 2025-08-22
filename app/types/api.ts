export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface VoicesApiResponse extends ApiResponse {
  data: {
    voices: Voice[];
    total: number;
    filtered: number;
  };
}

export interface GenerateApiResponse extends ApiResponse {
  data: {
    job_id: string;
    estimated_time: number;
    queue_position?: number;
  };
}

export interface GenerationStatusResponse extends ApiResponse {
  data: {
    status: GenerationStatus;
    progress: number;
    message: string;
    result?: GenerationResult;
    error_details?: string;
  };
}

export interface UsageApiResponse extends ApiResponse {
  data: {
    usage: UsageStats;
    limits: {
      daily_characters: number;
      daily_generations: number;
      concurrent_generations: number;
    };
    subscription: {
      tier: 'free' | 'pro' | 'enterprise';
      features: string[];
      expires_at?: string;
    };
  };
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'X-RateLimit-Retry-After'?: string;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  error_code: string;
  details?: {
    field?: string;
    message: string;
    code: string;
  }[];
  support_id?: string;
}

import type { Voice, GenerationStatus, GenerationResult, UsageStats } from './widget';