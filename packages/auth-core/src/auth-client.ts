import type { Session } from './types';

export interface AuthClient {
  login: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  refreshSession: () => Promise<Session | null>;
  isAuthenticated: () => Promise<boolean>;
}

export class MockAuthClient implements AuthClient {
  private readonly storageKey = 'auth_session';

  async login(email: string, _password: string): Promise<Session> {
    // Mock login - accept any credentials
    let roles: string[];
    if (email.includes('admin')) {
      roles = ['admin', 'admin:access', 'user:read', 'user:write'];
    } else if (email.includes('manager')) {
      roles = ['manager', 'admin:access', 'user:read'];
    } else {
      roles = ['viewer', 'user:read'];
    }

    const session: Session = {
      user: {
        id: `user-${String(Date.now())}`,
        email,
        name: email.split('@')[0] ?? 'Unknown User',
        roles,
      },
      token: `mock-token-${String(Date.now())}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    await Promise.resolve();
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    await Promise.resolve();
  }

  async getSession(): Promise<Session | null> {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;

    try {
      const parsed = await Promise.resolve(JSON.parse(stored) as Session);
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return parsed;
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
