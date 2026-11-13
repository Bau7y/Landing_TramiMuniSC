/**
 * Attachment limits for the contact form, shared by client and server.
 * Vercel functions accept request bodies up to 4.5 MB, so files stay under 4 MB.
 */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
