import { NextResponse } from 'next/server';

const REMOTE_HEALTH_TIMEOUT_MS = 5000;

/**
 * Health check endpoint for load balancers and orchestration.
 * Returns 200 when the app is ready to serve traffic.
 * When REMOTE_HEALTH_URL is set, probes that URL with a timeout; if unreachable, returns 200 with status 'degraded'.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const remoteHealthUrl = process.env.REMOTE_HEALTH_URL;

  if (!remoteHealthUrl?.trim()) {
    return NextResponse.json(
      { status: 'ok', service: 'admin-shell', timestamp },
      { status: 200 },
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REMOTE_HEALTH_TIMEOUT_MS);
    const res = await fetch(remoteHealthUrl.trim(), {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return NextResponse.json(
        {
          status: 'degraded',
          service: 'admin-shell',
          timestamp,
          details: { remoteHealth: { url: remoteHealthUrl, status: res.status } },
        },
        { status: 200 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'admin-shell',
        timestamp,
        details: {
          remoteHealth: {
            url: remoteHealthUrl,
            error: err instanceof Error ? err.message : String(err),
          },
        },
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    { status: 'ok', service: 'admin-shell', timestamp },
    { status: 200 },
  );
}
