/**
 * A tiny event bus so non-React modules (like api/axios.js) can tell
 * AdminAuthProvider "the token just got invalidated" without needing to
 * import React/context directly, and without duplicating the logout
 * logic (clearing localStorage, resetting state, clearing cached admin
 * data) in more than one place.
 */
export const ADMIN_TOKEN_EXPIRED_EVENT = 'admin-token-expired';

export function dispatchAdminTokenExpired() {
  window.dispatchEvent(new Event(ADMIN_TOKEN_EXPIRED_EVENT));
}
