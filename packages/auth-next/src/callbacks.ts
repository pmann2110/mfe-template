import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { AppUser } from './types';

interface JwtCallbackParams {
  token: JWT;
  user?: AppUser & { sub?: string; accessToken?: string };
}

export function jwtCallback({ token, user }: JwtCallbackParams): JWT {
  if (user) {
    token.userId = user.id;
    token.roles = user.roles;
    token.permissions = user.permissions;
    if (user.accessToken) {
      token.accessToken = user.accessToken;
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
