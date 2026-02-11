/**
 * Standard API result and error types for consistent loading/error handling
 * across remotes and shell. Use ApiResult<T> for list/get/create/update/delete
 * so the shell and remotes can show consistent UX (loading, error toasts, etc.).
 */

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function err(error: ApiError): ApiResult<never> {
  return { ok: false, error };
}

export function isOk<T>(result: ApiResult<T>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T>(result: ApiResult<T>): result is { ok: false; error: ApiError } {
  return !result.ok;
}

/**
 * Minimal response shape for building ApiError without depending on DOM types.
 * Any object with `status` and optional `statusText` (e.g. fetch Response) is compatible.
 */
interface ResponseLike {
  status: number;
  statusText?: string;
}

/**
 * Build an ApiError from a failed HTTP-like response and parsed body.
 * Use when implementing API clients that throw on non-2xx.
 */
export function apiErrorFromResponse(
  response: ResponseLike,
  body: unknown,
): ApiError {
  const status = response.status;
  const statusText = response.statusText ?? '';
  let message = statusText || 'Request failed';
  let code = 'UNKNOWN';
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b.message === 'string') message = b.message;
    if (typeof b.code === 'string') code = b.code;
  }
  return { code, message, status };
}
