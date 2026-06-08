/**
 * Sync service — request and track a PSN profile sync (`/profile/sync/:psnid`).
 *
 * `submit` enqueues a sync job; `status` reports the user's most recent job.
 * Both build on `useApi()`, so errors surface as {@link ApiError} — branch on
 * `code` (e.g. `SYNC_WORKER_UNAVAILABLE`, `NOT_FOUND`).
 */

/** Sync job lifecycle. */
export type SyncStatus = 'queued' | 'calculating' | 'syncing' | 'completed' | 'failed'

/** Result of enqueueing a sync job. */
export interface SyncSubmitResult {
  queue_id: number
}

/** A user's most recent sync job, as returned by `GET .../status`. */
export interface SyncStatusInfo {
  queue_id: number
  psnid: string
  status: SyncStatus
  /** Numeric status code: 1 queued, 2 calculating, 3 syncing, 4 completed, 0 failed. */
  status_code: number
  /** Sync progress, 0–100. */
  progress: number
  /** Total games this run needs to sync. */
  total_games: number
  synced_count: number
  failed_count: number
  skipped_count: number
  /** NP Communication ID of the game currently syncing (empty when none). */
  current_game: string
  /** Unix seconds. */
  started_at: number
  /** Unix seconds. */
  updated_at: number
  /** Unix seconds. */
  completed_at: number
  /** Failure reason (empty unless `status === 'failed'`). */
  error: string
  /** Unfinished jobs ahead of this one — only present while `queued`. */
  queue_ahead?: number
  /** Jobs currently executing across the worker pool. */
  active_queue_count: number
  /** Jobs waiting to be picked up across the worker pool. */
  waiting_queue_count: number
}

export function useSync() {
  const { get, post } = useApi()

  return {
    /** Enqueue a sync job for `psnid`. Throws `SYNC_WORKER_UNAVAILABLE` when the worker is down. */
    submit: (psnid: string) =>
      post<SyncSubmitResult>(`/profile/sync/${encodeURIComponent(psnid)}`),

    /** Latest sync job status for `psnid`. Throws `NOT_FOUND` when there is no record. */
    status: (psnid: string) =>
      get<SyncStatusInfo>(`/profile/sync/${encodeURIComponent(psnid)}/status`),
  }
}
