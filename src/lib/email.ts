import { promises as dns } from 'node:dns';

/** Subset of node:dns/promises used here; injectable for tests. */
export type DnsResolver = Pick<typeof dns, 'resolveMx' | 'resolve4' | 'resolve6'>;

const DNS_TIMEOUT_MS = 4000;

/** DNS answers that prove the name has no record (vs. a network failure). */
const DEFINITIVE_MISS = new Set(['ENOTFOUND', 'ENODATA']);

const errorCode = (error: unknown) => (error as NodeJS.ErrnoException)?.code ?? '';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('DNS timeout'), { code: 'ETIMEOUT' })), ms),
    ),
  ]);
}

async function hasAddressRecord(domain: string, resolver: DnsResolver): Promise<boolean> {
  const lookups = [() => resolver.resolve4(domain), () => resolver.resolve6(domain)];

  for (const lookup of lookups) {
    try {
      const addresses = await withTimeout(lookup(), DNS_TIMEOUT_MS);
      if (addresses.length > 0) return true;
    } catch (error) {
      if (!DEFINITIVE_MISS.has(errorCode(error))) return true; // unknown → fail open
    }
  }
  return false;
}

/**
 * Checks whether the email's domain can receive mail.
 *
 * - MX records present → true (unless it is a null MX, RFC 7505 → false).
 * - No MX but A/AAAA present → true (implicit MX, RFC 5321 §5.1).
 * - Domain does not exist → false.
 * - DNS unreachable or timing out → true (fail open: never block a real user
 *   because of a resolver hiccup).
 *
 * It does not prove the mailbox itself exists; only a confirmation email can.
 */
export async function canReceiveEmail(email: string, resolver: DnsResolver = dns): Promise<boolean> {
  const domain = email.split('@').pop()?.trim().toLowerCase();
  if (!domain) return false;

  try {
    const records = await withTimeout(resolver.resolveMx(domain), DNS_TIMEOUT_MS);
    const isNullMx = records.length === 1 && ['', '.'].includes(records[0].exchange);
    if (isNullMx) return false;
    return records.length > 0 || (await hasAddressRecord(domain, resolver));
  } catch (error) {
    const code = errorCode(error);
    if (code === 'ENODATA') return hasAddressRecord(domain, resolver);
    return !DEFINITIVE_MISS.has(code);
  }
}
