/** Text normalization shared by the content filters. */

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };

/** Lowercase, no accents, leetspeak undone, letters repeated 3+ times collapsed ("pendejooo" → "pendejo"). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[013457@$]/g, (c) => LEET[c])
    .replace(/(\p{L})\1{2,}/gu, '$1');
}

/** Whole-word (or whole-phrase) match on normalized text; plurals (-s, -es) included. */
export function containsTerm(normalized: string, term: string): boolean {
  const escaped = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}])${escaped}(?:e?s)?($|[^\\p{L}])`, 'u').test(normalized);
}

export const countTerms = (normalized: string, terms: readonly string[]) =>
  terms.filter((term) => containsTerm(normalized, term)).length;
