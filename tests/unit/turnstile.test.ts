import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from '../../src/lib/spam/turnstile';

describe('verifyTurnstile', () => {
  it('rechaza sin token, sin llamar a Cloudflare', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await verifyTurnstile('', 'secret')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('devuelve la respuesta de Cloudflare y envía la IP', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: true }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await verifyTurnstile('token', 'secret', '2.2.2.2')).toBe(true);
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('remoteip')).toBe('2.2.2.2');
  });

  it('rechaza si Cloudflare no responde', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await verifyTurnstile('token', 'secret')).toBe(false);
  });
});
