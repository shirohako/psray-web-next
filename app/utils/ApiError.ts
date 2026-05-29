import type { ApiErrorBody, ApiErrorDetail, ApiErrorEnvelope, ErrorCode } from '~/types/api'

/**
 * Normalized API error thrown by the `$api` client for any non-2xx response.
 *
 * Branch on `code` (stable, machine-readable). `message` is safe to show to
 * users. `status` is the real HTTP status. `details` carries field-level
 * validation errors. `requestId` correlates with server logs.
 *
 * ```ts
 * try { await $api('/me') }
 * catch (e) {
 *   if (e instanceof ApiError && e.code === 'UNAUTHENTICATED') redirectToLogin()
 * }
 * ```
 */
export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: ApiErrorDetail[]
  readonly requestId?: string

  constructor(opts: {
    code: ErrorCode
    message: string
    status: number
    details?: ApiErrorDetail[]
    requestId?: string
  }) {
    super(opts.message)
    this.name = 'ApiError'
    this.code = opts.code
    this.status = opts.status
    this.details = opts.details
    this.requestId = opts.requestId
  }

  /** Build from a fetch response status + parsed body (best-effort). */
  static fromResponse(status: number, body: unknown): ApiError {
    const envelope = body as Partial<ApiErrorEnvelope> | undefined
    const err = envelope?.error as Partial<ApiErrorBody> | undefined
    return new ApiError({
      code: err?.code ?? 'INTERNAL_ERROR',
      message: err?.message ?? 'Request failed.',
      status,
      details: err?.details,
      requestId: envelope?.request_id,
    })
  }

  /** True for field-level validation failures (has `details`). */
  get isValidation(): boolean {
    return this.code === 'VALIDATION_FAILED' || (this.details?.length ?? 0) > 0
  }

  /** Convenience: map validation details to `{ field: message }`. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const d of this.details ?? []) out[d.field] = d.message
    return out
  }
}
