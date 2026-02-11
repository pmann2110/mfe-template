import { describe, it, expect } from 'vitest';
import {
  canInOrg,
  canWithSystemPermissions,
  canSystem,
  canWithPermissions,
} from './permissions';
import type { Session } from '@repo/auth-core';
import type { SystemPermission } from './permission-matrix';

describe('canInOrg', () => {
  it('returns false when orgPermissions is null or empty', () => {
    expect(canInOrg('user:read', null)).toBe(false);
    expect(canInOrg('user:read', [])).toBe(false);
  });

  it('returns true when permission is in orgPermissions', () => {
    expect(canInOrg('user:read', ['user:read', 'role:write'])).toBe(true);
    expect(canInOrg('role:write', ['user:read', 'role:write'])).toBe(true);
  });

  it('returns false when permission is not in orgPermissions', () => {
    expect(canInOrg('user:write', ['user:read'])).toBe(false);
  });
});

describe('canWithSystemPermissions', () => {
  it('returns false when systemPermissions is null or empty', () => {
    expect(canWithSystemPermissions('org:read' as SystemPermission, null)).toBe(false);
    expect(canWithSystemPermissions('org:read' as SystemPermission, [])).toBe(false);
  });

  it('returns true when permission is in systemPermissions', () => {
    expect(
      canWithSystemPermissions('org:read' as SystemPermission, ['org:read', 'billing:read'])
    ).toBe(true);
  });

  it('returns false when permission is not in systemPermissions', () => {
    expect(
      canWithSystemPermissions('system:admin' as SystemPermission, ['org:read'])
    ).toBe(false);
  });
});

describe('canSystem', () => {
  it('returns false when session is null', () => {
    expect(canSystem('org:read', null)).toBe(false);
  });

  it('returns true when session has system role that grants the permission', () => {
    const session: Session = {
      user: {
        id: '1',
        email: 'a@b.com',
        name: 'User',
        roles: ['system:admin'],
        permissions: [],
      },
      expiresAt: Date.now() + 3600,
    };
    expect(canSystem('org:read', session)).toBe(true);
    expect(canSystem('system:admin', session)).toBe(true);
  });

  it('returns false when session has no role or permission granting the system permission', () => {
    const session: Session = {
      user: {
        id: '1',
        email: 'a@b.com',
        name: 'User',
        roles: [],
        permissions: [],
      },
      expiresAt: Date.now() + 3600,
    };
    expect(canSystem('org:read', session)).toBe(false);
  });
});

describe('canWithPermissions', () => {
  it('returns false when permissions is null or empty', () => {
    expect(canWithPermissions('user:read', null)).toBe(false);
    expect(canWithPermissions('user:read', [])).toBe(false);
  });

  it('returns true when admin:access is in permissions', () => {
    expect(canWithPermissions('user:write', ['admin:access'])).toBe(true);
  });

  it('returns true when permission is in permissions', () => {
    expect(canWithPermissions('user:read', ['user:read'])).toBe(true);
  });

  it('returns false when permission is not in permissions', () => {
    expect(canWithPermissions('user:write', ['user:read'])).toBe(false);
  });
});
