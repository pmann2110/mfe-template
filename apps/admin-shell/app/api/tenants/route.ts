import { NextResponse } from 'next/server';
import { auth } from '@repo/auth-next';
import { MOCK_TENANTS } from '../../../lib/mock-data/tenants';

/**
 * GET /api/tenants
 * Returns tenants/organizations the current user can access.
 * System-level; requires authenticated session.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(MOCK_TENANTS);
}
