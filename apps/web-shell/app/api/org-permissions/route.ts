import { NextResponse } from 'next/server';
import { auth } from '@repo/auth-next';
import { getMockOrgPermissions } from '../../../lib/mock-data/org-permissions';

/**
 * GET /api/org-permissions?tenantId=org-1
 * Returns the current user's permissions in the given tenant.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json(
      { message: 'Missing tenantId query parameter' },
      { status: 400 },
    );
  }
  const permissions = getMockOrgPermissions(tenantId);
  return NextResponse.json({ organizationId: tenantId, permissions });
}
