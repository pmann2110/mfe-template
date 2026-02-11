import type {
  User,
  UserApi,
  CreateUserRequest,
  UpdateUserRequest,
} from '@repo/api-contracts';

export interface UserApiClientOptions {
  /** Returns current tenant ID for tenant-scoped requests. Sent as X-Tenant-Id header. */
  getTenantId?: () => string | null;
  /** Optional response interceptor for error handling or logging. */
  onError?: (response: Response, body: string) => void;
}

/**
 * Shared API client that implements UserApi using fetch and API_BASE_URL.
 * Use when USE_MOCK_API is not set (e.g. production or integration).
 * When getTenantId is provided, adds X-Tenant-Id header to all requests.
 */
export function createUserApiClient(
  baseUrl: string,
  options?: UserApiClientOptions,
): UserApi {
  const base = baseUrl.replace(/\/$/, '');
  const url = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const getTenantId = options?.getTenantId;
  const onError = options?.onError;

  async function request<T>(
    path: string,
    options?: Omit<RequestInit, 'body'> & { method?: string; body?: unknown },
  ): Promise<T> {
    const { method = 'GET', body, ...rest } = options ?? {};
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(rest.headers as Record<string, string>),
    };
    const tenantId = getTenantId?.() ?? null;
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    const res = await fetch(url(path), {
      ...rest,
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      onError?.(res, text);
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
    list: (organizationId?: string) =>
      request<User[]>(
        organizationId
          ? `/users?organizationId=${encodeURIComponent(organizationId)}`
          : '/users',
      ),
    get: (id: string) => request<User>(`/users/${id}`),
    create: (data: CreateUserRequest) =>
      request<User>('/users', { method: 'POST', body: data }),
    update: (id: string, data: UpdateUserRequest) =>
      request<User>(`/users/${id}`, { method: 'PATCH', body: data }),
    delete: (id: string) =>
      request<void>(`/users/${id}`, { method: 'DELETE' }),
  };
}
