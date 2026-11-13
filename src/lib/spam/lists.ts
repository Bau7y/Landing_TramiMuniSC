/**
 * Word lists for the contact filter. Edit freely: matching is accent-,
 * case- and leetspeak-insensitive (see text.ts).
 */

/** Insults and profanity (Spanish, Costa Rican slang, English). */
export const OFFENSIVE = [
  'hijueputa', 'jueputa', 'hijo de puta', 'malparido', 'malparida', 'puta', 'puto', 'mierda', 'pendejo', 'pendeja',
  'culero', 'cabron', 'imbecil', 'estupido', 'estupida', 'idiota', 'zorra', 'verga', 'chupamela', 'mamon',
  'fuck', 'fucking', 'motherfucker', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'retard',
] as const;

/** Typical unsolicited-offer vocabulary. One hit flags for review, two reject. */
export const SPAM_TERMS = [
  'crypto', 'bitcoin', 'forex', 'casino', 'apuestas', 'betting', 'viagra', 'cialis', 'prestamo inmediato', 'loan offer',
  'seo', 'backlinks', 'guest post', 'link building', 'rank your website', 'first page of google', 'posicionamiento web',
  'web design services', 'diseno web profesional', 'marketing digital', 'increase your sales', 'leads', 'click here',
  'unsubscribe', 'investment opportunity', 'oportunidad de inversion', 'make money', 'ganar dinero',
] as const;

/** URL shorteners hide where a link goes: a strong spam signal. */
export const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rebrand.ly', 'shorturl.at'] as const;

/** Throwaway inbox providers. */
export const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', 'temp-mail.org',
  'tempmail.com', 'tempmail.net', 'yopmail.com', 'yopmail.net', 'trashmail.com', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'tempail.com',
] as const;

/** Vocabulary of the services offered. No match at all → the message is flagged for review, never dropped. */
export const TOPIC_TERMS = [
  // Spanish
  'tramite', 'municipalidad', 'municipal', 'impuesto', 'tributo', 'bienes inmuebles', 'inmueble', 'propiedad', 'finca',
  'terreno', 'lote', 'casa', 'vivienda', 'plano', 'catastro', 'registro', 'escritura', 'derecho', 'avaluo', 'valor',
  'exoneracion', 'exonerar', 'bien unico', 'declaracion', 'declarar', 'patente', 'licencia', 'negocio', 'local',
  'comercio', 'uso de suelo', 'construir', 'construccion', 'permiso', 'agricola', 'agropecuario', 'ganado', 'cultivo',
  'ley 7509', 'ley 9071', 'cobro', 'recargo', 'multa', 'pago', 'consulta', 'requisito', 'formulario',
  // English
  'procedure', 'municipality', 'tax', 'property', 'land', 'house', 'home', 'exemption', 'declaration', 'license',
  'licence', 'permit', 'business', 'zoning', 'land use', 'build', 'farm', 'agricultural', 'fine', 'payment', 'form',
] as const;
