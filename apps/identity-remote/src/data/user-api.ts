import type { UserApi } from '@repo/api-contracts';
import { createUserApiClient } from '@repo/api-client';
import { mockUserApi } from './mock-users';

/**
 * Users data is mock-only for now (in-memory). To use a real backend later, set
 * VITE_USE_MOCK_API=false and VITE_API_BASE_URL to your API base URL.
 */
function getUserApi(): UserApi {
  const useMock =
    (import.meta.env.VITE_USE_MOCK_API ?? 'true').toLowerCase() === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (useMock || !baseUrl?.trim()) {
    return mockUserApi;
  }
  return createUserApiClient(baseUrl.trim());
}

export const userApi = getUserApi();
