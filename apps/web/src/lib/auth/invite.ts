export const INVITE_COOKIE_NAME = 'parkids_invite_code';

export function getInviteCookieValue(code: string) {
  return `${INVITE_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=1800; samesite=lax`;
}

export function getInviteCookieClearValue() {
  return `${INVITE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
