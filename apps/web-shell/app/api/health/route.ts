import { NextResponse } from 'next/server';

/**
 * Health check endpoint for load balancers and orchestration.
 * Returns 200 when the app is ready to serve traffic.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'web-shell', timestamp: new Date().toISOString() },
    { status: 200 },
  );
}
