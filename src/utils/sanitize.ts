import sanitizeHtml from 'sanitize-html';

const strictConfig: sanitizeHtml.IOptions = {
  allowedTags: [],       
  allowedAttributes: {}, 
  disallowedTagsMode: 'discard',
};

const richTextConfig: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

export function sanitizeText(value: string | undefined | null): string {
  if (!value) return '';
  return sanitizeHtml(value.trim(), strictConfig);
}

export function sanitizeRichText(value: string | undefined | null): string {
  if (!value) return '';
  return sanitizeHtml(value.trim(), richTextConfig);
}

function sanitizeStringField<T, K extends keyof T>(
  obj: T,
  key: K,
  sanitizer: (value: string) => string
): void {
  const value = obj[key];
  if (typeof value === 'string') {
    (obj as any)[key] = sanitizer(value);
  }
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    sanitizeStringField(result, key, sanitizeText);
  }
  return result;
}