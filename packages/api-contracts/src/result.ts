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
  return result.ok === true;
}

export function isErr<T>(result: ApiResult<T>): result is { ok: false; error: ApiError } {
  return result.ok === false;
}
