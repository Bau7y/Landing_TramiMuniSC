import { describe, expect, it } from 'vitest';
import { canReceiveEmail, type DnsResolver } from '../../src/lib/email';

const dnsError = (code: string) => Object.assign(new Error(code), { code });

/** Fake resolver: each record type returns the given value or throws the given error code. */
function resolver(records: { mx?: unknown; a?: unknown; aaaa?: unknown }): DnsResolver {
  const answer = (value: unknown) => async () => {
    if (typeof value === 'string') throw dnsError(value);
    return value ?? [];
  };
  return {
    resolveMx: answer(records.mx),
    resolve4: answer(records.a),
    resolve6: answer(records.aaaa),
  } as unknown as DnsResolver;
}

describe('canReceiveEmail', () => {
  it('acepta dominios con MX', async () => {
    expect(await canReceiveEmail('a@gmail.com', resolver({ mx: [{ exchange: 'mx.google.com', priority: 5 }] }))).toBe(true);
  });

  it('rechaza un MX nulo (RFC 7505)', async () => {
    expect(await canReceiveEmail('a@x.com', resolver({ mx: [{ exchange: '', priority: 0 }] }))).toBe(false);
  });

  it('acepta el MX implícito por registro A', async () => {
    expect(await canReceiveEmail('a@x.com', resolver({ mx: 'ENODATA', a: ['1.2.3.4'] }))).toBe(true);
  });

  it('rechaza dominios que no existen', async () => {
    expect(await canReceiveEmail('a@nope.invalid', resolver({ mx: 'ENOTFOUND' }))).toBe(false);
  });

  it('deja pasar si el DNS falla', async () => {
    expect(await canReceiveEmail('a@x.com', resolver({ mx: 'ESERVFAIL' }))).toBe(true);
  });

  it('rechaza correos sin dominio', async () => {
    expect(await canReceiveEmail('sin-arroba', resolver({}))).toBe(false);
  });
});
