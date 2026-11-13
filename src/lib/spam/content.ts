/**
 * Content analysis for contact messages. Pure and synchronous: easy to test
 * and independent from the action, the email provider and the UI.
 */
import { countTerms, normalize } from './text';
import { DISPOSABLE_DOMAINS, OFFENSIVE, SHORTENERS, SPAM_TERMS, TOPIC_TERMS } from './lists';

export type Verdict =
  | 'ok' // deliver
  | 'review' // deliver with [Revisar] in the subject
  | 'offensive' // ask the visitor to rewrite the message
  | 'spam'; // drop silently (the visitor sees "sent")

export interface Analysis {
  verdict: Verdict;
  reasons: string[];
}

export interface Message {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** A service picked in the form counts as on-topic. */
  hasService: boolean;
}

const URL_REGEX = /\b(?:https?:\/\/|www\.)\S+/gi;
// Scripts nobody writing to a Costa Rican municipal service is expected to use
const FOREIGN_SCRIPT = /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Thai}]/u;

export function analyzeMessage(input: Message): Analysis {
  const raw = `${input.subject}\n${input.message}`;
  const text = normalize(`${input.name}\n${raw}`);
  const domain = input.email.split('@')[1]?.toLowerCase() ?? '';
  const reasons: string[] = [];

  // 1. Offensive language: the visitor is asked to rewrite it
  if (countTerms(text, OFFENSIVE) > 0) return { verdict: 'offensive', reasons: ['lenguaje ofensivo'] };

  // 2. Hard spam signals
  const urls = raw.match(URL_REGEX) ?? [];
  if (urls.length > 1) reasons.push(`${urls.length} enlaces`);
  if (urls.some((url) => SHORTENERS.some((s) => url.toLowerCase().includes(s)))) reasons.push('acortador de enlaces');
  if ((DISPOSABLE_DOMAINS as readonly string[]).includes(domain)) reasons.push('correo desechable');
  if (FOREIGN_SCRIPT.test(raw)) reasons.push('alfabeto no esperado');
  const spamHits = countTerms(text, SPAM_TERMS);
  if (spamHits >= 2) reasons.push(`${spamHits} términos de spam`);
  if (reasons.length) return { verdict: 'spam', reasons };

  // 3. Soft signals: delivered, but marked for review
  if (spamHits === 1) reasons.push('1 término de spam');
  if (urls.length === 1) reasons.push('incluye un enlace');
  const letters = input.message.replace(/[^\p{L}]/gu, '');
  if (letters.length > 20 && letters.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.7) reasons.push('casi todo en mayúsculas');
  if (!input.hasService && countTerms(text, TOPIC_TERMS) === 0) reasons.push('no menciona temas del servicio');

  return { verdict: reasons.length ? 'review' : 'ok', reasons };
}
