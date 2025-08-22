import { NextRequest, NextResponse } from 'next/server';
import { mockApi } from '@/app/lib/mockApi';
import type { GenerationRequest } from '@/app/types/widget';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerationRequest;
    
    // Validate request
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Text is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (!body.voice_id) {
      return NextResponse.json({
        success: false,
        error: 'Voice ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (body.text.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'Text exceeds maximum length of 500 characters for demo',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const response = await mockApi.generateSpeech(body);
    const rateLimitInfo = mockApi.getRateLimitInfo();
    
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
        'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
        'X-RateLimit-Reset': rateLimitInfo.reset.toString(),
        ...(rateLimitInfo.retryAfter && {
          'X-RateLimit-Retry-After': rateLimitInfo.retryAfter.toString()
        })
      }
    });
  } catch (error) {
    console.error('Generate API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const response = await mockApi.getGenerationStatus(jobId);
    
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Generation status API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}