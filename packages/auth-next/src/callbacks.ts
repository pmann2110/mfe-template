import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

export function jwtCallback({
  token,
  user,
}: {
  token: JWT;
  user?: any;
}) {
  if (user) {
    token.userId = user.id;
    token.roles = user.roles || [];
    token.permissions = user.permissions || [];
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
  if (token) {
    // Ensure we have all required user properties
    session.user = {
      id: token.userId || token.sub || '',
      email: token.email || session.user?.email || '',
      name: token.name || session.user?.name || '',
      roles: Array.isArray(token.roles) ? token.roles : [],
      permissions: Array.isArray(token.permissions) ? token.permissions : [],
    };
    
    // Add additional token properties to session
    if (token.accessToken) {
      session.accessToken = token.accessToken;
    }
    if (token.exp) {
      session.expires = new Date(token.exp * 1000).toISOString();
    }
  }
  return session;
}
