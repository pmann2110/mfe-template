import type {
  User,
  UserApi,
  CreateUserRequest,
  UpdateUserRequest,
} from '@repo/api-contracts';

/**
 * Shared API client that implements UserApi using fetch and API_BASE_URL.
 * Use when USE_MOCK_API is not set (e.g. production or integration).
 */
export function createUserApiClient(baseUrl: string): UserApi {
  const base = baseUrl.replace(/\/$/, '');
  const url = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;

  async function request<T>(
    path: string,
    options?: Omit<RequestInit, 'body'> & { method?: string; body?: unknown },
  ): Promise<T> {
    const { method = 'GET', body, ...rest } = options ?? {};
    const res = await fetch(url(path), {
      ...rest,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...rest.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      let errBody: { message?: string; code?: string } = {};
      try {
        errBody = JSON.parse(text) as { message?: string; code?: string };
      } catch {
        // ignore
      }
      throw new Error(
        (errBody.message ?? text) || `Request failed: ${res.status} ${res.statusText}`,
      );
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  return {
    list: () => request<User[]>('/users'),
    get: (id: string) => request<User>(`/users/${id}`),
    create: (data: CreateUserRequest) =>
      request<User>('/users', { method: 'POST', body: data }),
    update: (id: string, data: UpdateUserRequest) =>
      request<User>(`/users/${id}`, { method: 'PATCH', body: data }),
    delete: (id: string) =>
      request<void>(`/users/${id}`, { method: 'DELETE' }),
  };
}
