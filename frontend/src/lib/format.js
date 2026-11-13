/** The API stores long text with a blank line between paragraphs. */
export const splitParagraphs = (text) =>
  (text ?? '').split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

export const toTelHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const cx = (...classNames) => classNames.filter(Boolean).join(' ');
