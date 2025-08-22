import { NextRequest, NextResponse } from 'next/server';
import { mockApi } from '@/app/lib/mockApi';
import type { VoiceFilters } from '@/app/types/widget';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: VoiceFilters = {};
    
    if (searchParams.get('gender')) {
      filters.gender = searchParams.get('gender') as any;
    }
    
    if (searchParams.get('language')) {
      filters.language = searchParams.get('language') as any;
    }
    
    if (searchParams.get('premium')) {
      filters.premium = searchParams.get('premium') === 'true';
    }

    const response = await mockApi.getVoices(filters);
    
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Voices API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}