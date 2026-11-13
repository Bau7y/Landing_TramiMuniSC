/** Cloudflare Turnstile server-side check. https://developers.cloudflare.com/turnstile/ */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const response = await fetch(VERIFY_URL, { method: 'POST', body });
    const { success } = (await response.json()) as { success: boolean };
    return success;
  } catch (error) {
    console.error('[turnstile]', error);
    return false;
  }
}
