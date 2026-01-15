import type { Session, User } from './types';

export interface AuthClient {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session | null>;
  isAuthenticated(): Promise<boolean>;
}

export class MockAuthClient implements AuthClient {
  private readonly storageKey = 'auth_session';

  async login(email: string, password: string): Promise<Session> {
    // Mock login - accept any credentials
    const roles = email.includes('admin')
      ? ['admin', 'admin:access', 'user:read', 'user:write', 'product:read', 'product:write']
      : email.includes('manager')
        ? ['manager', 'admin:access', 'user:read', 'product:read', 'product:write']
        : ['viewer', 'user:read', 'product:read'];

    const session: Session = {
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || 'Unknown User',
        roles,
      },
      token: `mock-token-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  async getSession(): Promise<Session | null> {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;

    try {
      const session: Session = JSON.parse(stored);
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  async refreshSession(): Promise<Session | null> {
    return this.getSession();
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }
}
