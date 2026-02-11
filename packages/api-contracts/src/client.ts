/**
 * Shared API client that implements UserApi using fetch and API_BASE_URL.
 * Use when USE_MOCK_API is not set (production or E2E with real backend).
 */

import { apiErrorFromResponse } from './result';
import type { ApiError } from './result';
import type {
  User,
  UserApi,
  CreateUserRequest,
  UpdateUserRequest,
} from './users';

function getBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  return trimmed || 'http://localhost';
}

/**
 * Creates a UserApi client that calls the given base URL (e.g. from API_BASE_URL).
 * All methods throw ApiError on non-2xx responses for consistent error handling in remotes.
 */
export function createUserApiClient(baseUrl: string): UserApi {
  const base = getBaseUrl(baseUrl);

  async function request<T>(
    path: string,
    options?: RequestInit & { parseJson?: boolean },
  ): Promise<T> {
    const { parseJson = true, ...init } = options ?? {};
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      const apiErr = apiErrorFromResponse(response, body);
      const err = Object.assign(new Error(apiErr.message), {
        code: apiErr.code,
        status: apiErr.status,
      });
      throw err;
    }

    if (!parseJson) return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  return {
    list: () => request<User[]>('/users'),
    get: (id: string) => request<User>(`/users/${encodeURIComponent(id)}`),
    create: (data: CreateUserRequest) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateUserRequest) =>
      request<User>(`/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<undefined>(`/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        parseJson: false,
      }),
  };
}

export type { ApiError };
