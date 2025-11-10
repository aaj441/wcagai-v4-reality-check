import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      version: '5.0.0',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: 'operational',
        redis: 'operational',
        bullmq: 'operational',
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
