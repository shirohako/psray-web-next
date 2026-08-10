import type { ApiSuccess } from '~/types/api'

/**
 * Account self-service mutations for the user-settings pages: banner +
 * avatar settings, avatar upload, email + password changes.
 *
 * Mirrors `useAuthApi()` in `~/services/auth` — thin wrappers over `useApi()`.
 * `uploadAvatar` is still by-convention pending its endpoint.
 */

/** Standard success payload for the mutation endpoints: a displayable message. */
export interface MessageResult {
  message: string
}

export interface UpdateSettingPayload {
  /** Custom profile banner image URL; `null` clears it. */
  banner_url?: string | null
  /** Custom avatar image URL; `null` clears it. */
  avatar_url?: string | null
  /**
   * `true` — stop overwriting the avatar with the synced PSN one.
   * `false` — resume PSN sync, restoring the official avatar next sync.
   * Omitted while only `avatar_url` is sent: the backend infers `true`.
   */
  use_custom_avatar?: boolean
}

/** Current banner/avatar settings, as returned by `GET /user/setting`. */
export interface UserSetting {
  banner_url: string | null
  avatar_url: string | null
  use_custom_avatar: boolean
}

export interface AvatarUploadResult {
  avatar_url: string
}

export interface ChangePasswordPayload {
  current_password: string
  /** New password, 8–255 chars (backend-validated). */
  new_password: string
}

export interface SendEmailCodePayload {
  /** The new email address to send the verification code to. */
  email: string
}

export interface ChangeEmailPayload {
  current_password: string
  /** New email address — must match the one the code was sent to. */
  email: string
  /** 6-digit verification code from `sendEmailCode`. */
  code: string
}

export function useAccountApi() {
  const { get, patch, post, $api } = useApi()

  return {
    getSetting: () => get<UserSetting>('/user/setting'),
    updateSetting: (payload: UpdateSettingPayload) =>
      patch<MessageResult>('/user/setting', payload),

    // --- Password -----------------------------------------------------------
    // Verifies the current password, writes the new one, and logs out this
    // account's other sessions (the current token stays valid).
    changePassword: (payload: ChangePasswordPayload) =>
      post<MessageResult>('/user/setting/password', payload),

    // --- Email (two-step) ---------------------------------------------------
    // Step 1: send a verification code to the new address (shared send-code
    // endpoint, fixed `type`).
    sendEmailCode: (payload: SendEmailCodePayload) =>
      post<MessageResult>('/auth/send-code', { ...payload, type: 'change_email' }),
    // Step 2: confirm the change with the current password + received code.
    changeEmail: (payload: ChangeEmailPayload) =>
      post<MessageResult>('/user/setting/email', payload),

    // Multipart upload — hand the FormData straight to ofetch so it sets the
    // multipart boundary itself (the `$api` plugin only sets `Accept`).
    async uploadAvatar(file: File) {
      const form = new FormData()
      form.append('avatar', file)
      const res = await $api<ApiSuccess<AvatarUploadResult>>('/auth/avatar', {
        method: 'POST',
        body: form,
      })
      return res.data
    },
  }
}
