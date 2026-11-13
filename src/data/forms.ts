/**
 * Official Municipalidad de San Carlos forms, made fillable (AcroForm) and
 * served from public/formularios. Update `version` when the municipality
 * publishes a new one.
 */
export const forms = {
  exoneracion: {
    href: '/formularios/exoneracion-bienes-inmuebles.pdf',
    code: 'F-SBI-002-2024',
    pages: 2,
    sizeKb: 260,
  },
  declaracion: {
    href: '/formularios/declaracion-bienes-inmuebles.pdf',
    code: 'F-SBI-001-2024',
    pages: 1,
    sizeKb: 406,
  },
} as const;

export type FormKey = keyof typeof forms;

export const FORMS_SOURCE_URL = 'https://www.munisc.go.cr/Paginas/Visitantes/Documentos.aspx';
