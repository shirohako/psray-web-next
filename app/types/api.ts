/**
 * Shared types for the PSRay API response envelope.
 * See backend "API Response Standard": every endpoint returns a consistent
 * JSON envelope plus a real HTTP status code.
 */

/** Stable, machine-readable error codes from the backend `ErrorCode` enum.
 *  Known values get autocomplete; any other string is still allowed. */
export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'PSN_LEVEL_TOO_LOW'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {})

/** Field-level error detail (e.g. validation failures). */
export interface ApiErrorDetail {
  field: string
  message: string
}

/** The `error` object inside an error envelope. */
export interface ApiErrorBody {
  code: ErrorCode
  message: string
  details?: ApiErrorDetail[]
}

/** Full error envelope body. */
export interface ApiErrorEnvelope {
  error: ApiErrorBody
  request_id?: string
}

/** Success envelope. `meta` is optional (e.g. pagination). */
export interface ApiSuccess<T = unknown, M = ApiMeta> {
  data: T
  meta?: M
}

/** Common pagination meta. Extend/override per endpoint as needed. */
export interface ApiMeta {
  page?: number
  total?: number
  [key: string]: unknown
}
