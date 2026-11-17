/** Global site data. Translatable text lives in src/i18n/ui.ts. */
export const site = {
  name: 'TramiMuniSC',
  email: 'tramimuni.sc@gmail.com',
  location: 'San Carlos, Alajuela, Costa Rica',
  /** Official online portal of the Municipality, linked as the free alternative. */
  municipalPortal: 'https://tramites.munisc.go.cr/',
  /**
   * Optional business data for search engines (schema.org). Each one is
   * published only when it has a value.
   * phone: international format, e.g. '+506 8888 8888'.
   * profiles: public profiles of the business (Google Business Profile,
   * Facebook, Instagram…), used as `sameAs`.
   */
  phone: '' as string,
  profiles: [] as string[],
} as const;
