import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { AppUser } from './types';

export function jwtCallback(params: { token: JWT; user?: unknown }): JWT {
  const { token, user } = params;
  const appUser = user as (AppUser & { sub?: string; accessToken?: string }) | undefined;
  if (appUser) {
    token.userId = appUser.id;
    token.roles = appUser.roles;
    token.permissions = appUser.permissions;
    if (appUser.accessToken) {
      token.accessToken = appUser.accessToken;
    }
  }
  return token;
}

export function sessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Session {
  const email = token.email ?? '';
  const name = token.name ?? '';
  session.user = {
    id: token.userId ?? token.sub ?? '',
    email,
    name,
    roles: Array.isArray(token.roles) ? token.roles : [],
    permissions: Array.isArray(token.permissions) ? token.permissions : [],
  };
  if (token.accessToken) {
    session.accessToken = token.accessToken;
  }
  if (token.exp !== undefined) {
    session.expires = new Date(token.exp * 1000).toISOString();
  }
  return session;
}
