import { describe, expect, it, vi } from 'vitest';
import { isRateLimited } from '../../src/lib/spam/rate_limit';

describe('isRateLimited (memoria)', () => {
  it('permite hasta el límite y bloquea el siguiente', async () => {
    const ip = `mem-${Math.random()}`;
    const options = { limit: 2, windowSeconds: 60 };
    expect(await isRateLimited(ip, options)).toBe(false);
    expect(await isRateLimited(ip, options)).toBe(false);
    expect(await isRateLimited(ip, options)).toBe(true);
  });

  it('reinicia al terminar la ventana', async () => {
    vi.useFakeTimers();
    const ip = `win-${Math.random()}`;
    const options = { limit: 1, windowSeconds: 60 };
    await isRateLimited(ip, options);
    expect(await isRateLimited(ip, options)).toBe(true);
    vi.advanceTimersByTime(61_000);
    expect(await isRateLimited(ip, options)).toBe(false);
    vi.useRealTimers();
  });
});

describe('isRateLimited (Upstash)', () => {
  const redis = { url: 'https://redis.example', token: 't' };

  it('usa el contador de Redis', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([{ result: 6 }, { result: 0 }])));
    expect(await isRateLimited('1.1.1.1', { limit: 5, windowSeconds: 60, redis })).toBe(true);
  });

  it('deja pasar si Redis falla', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await isRateLimited('1.1.1.1', { limit: 5, windowSeconds: 60, redis })).toBe(false);
  });
});
