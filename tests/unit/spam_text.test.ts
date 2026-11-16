import { describe, expect, it } from 'vitest';
import { containsTerm, countTerms, normalize } from '../../src/lib/spam/text';

describe('normalize', () => {
  it('quita mayúsculas y acentos', () => {
    expect(normalize('Exoneración ÚNICA')).toBe('exoneracion unica');
  });

  it('deshace leetspeak y letras repetidas', () => {
    expect(normalize('p3nd3jooo')).toBe('pendejo');
    expect(normalize('$p@m')).toBe('spam');
  });
});

describe('containsTerm', () => {
  it('encuentra palabras y frases completas, con plural', () => {
    expect(containsTerm(normalize('Necesito un trámite'), 'tramite')).toBe(true);
    expect(containsTerm(normalize('varios trámites'), 'tramite')).toBe(true);
    expect(containsTerm(normalize('uso de suelo comercial'), 'uso de suelo')).toBe(true);
  });

  it('no coincide dentro de otra palabra', () => {
    // "seo" must not match inside "deseo"
    expect(containsTerm(normalize('deseo información'), 'seo')).toBe(false);
  });
});

describe('countTerms', () => {
  it('cuenta términos distintos', () => {
    expect(countTerms(normalize('crypto y casino'), ['crypto', 'casino', 'forex'])).toBe(2);
  });
});
