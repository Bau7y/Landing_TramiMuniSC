import { describe, expect, it } from 'vitest';
import { analyzeMessage, type Message } from '../../src/lib/spam/content';

const base: Message = {
  name: 'Ana Rojas',
  email: 'ana@gmail.com',
  subject: 'Exoneración',
  message: 'Quiero exonerar mi propiedad, ¿qué requisitos necesito?',
  hasService: false,
};
const check = (overrides: Partial<Message>) => analyzeMessage({ ...base, ...overrides });

describe('analyzeMessage', () => {
  it('entrega un mensaje normal sobre un trámite', () => {
    expect(check({})).toEqual({ verdict: 'ok', reasons: [] });
  });

  it('pide reescribir si hay lenguaje ofensivo, aunque esté disfrazado', () => {
    expect(check({ message: 'Son unos p3nd3jooo, quiero mi trámite' }).verdict).toBe('offensive');
  });

  it('descarta spam con varios términos', () => {
    expect(check({ message: 'We offer SEO and backlinks for your property website' }).verdict).toBe('spam');
  });

  it('descarta acortadores, correos desechables y varios enlaces', () => {
    expect(check({ message: 'Vea https://bit.ly/x sobre su propiedad' }).verdict).toBe('spam');
    expect(check({ email: 'x@mailinator.com' }).verdict).toBe('spam');
    expect(check({ message: 'Mi propiedad https://a.com https://b.com' }).verdict).toBe('spam');
  });

  it('descarta alfabetos no esperados', () => {
    expect(check({ message: 'Привет, propiedad' }).verdict).toBe('spam');
  });

  it('marca para revisar señales suaves', () => {
    expect(check({ message: 'Vea https://ejemplo.com sobre mi propiedad' })).toMatchObject({
      verdict: 'review',
      reasons: ['incluye un enlace'],
    });
    expect(check({ subject: 'Hola', message: 'Buenas tardes, quería saludarles y conversar.' }).reasons).toContain(
      'no menciona temas del servicio',
    );
  });

  it('un servicio elegido en el formulario cuenta como tema', () => {
    expect(check({ subject: 'Hola', message: 'Buenas tardes, quería saludarles.', hasService: true }).verdict).toBe('ok');
  });

  it('marca mensajes casi todo en mayúsculas', () => {
    expect(check({ message: 'NECESITO AYUDA CON MI PROPIEDAD URGENTE POR FAVOR' }).reasons).toContain(
      'casi todo en mayúsculas',
    );
  });
});
