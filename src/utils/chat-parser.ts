/**
 * Utility to sanitize and parse AI Chat responses.
 *
 * Handles:
 * - Plain string / markdown responses
 * - Python repr format: "[{'type': 'text', 'text': '...', 'extras': {...}}]"
 * - Standard JSON array/object: '[{"type": "text", "text": "..."}]'
 * - Escaped newlines and quote sequences
 */
export function cleanChatResponse(raw: unknown): string {
  if (!raw) return '';

  if (typeof raw !== 'string') {
    if (typeof raw === 'object') {
      try {
        return JSON.stringify(raw);
      } catch {
        return String(raw);
      }
    }
    return String(raw);
  }

  const trimmed = raw.trim();

  // If already a plain string without array/object wrappers, return directly
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return trimmed;
  }

  // 1. Try standard JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      const texts = parsed
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'text' in item) return String(item.text);
          return '';
        })
        .filter(Boolean);
      if (texts.length > 0) return texts.join('\n\n');
    } else if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      return String(parsed.text);
    }
  } catch {
    // Fall through to regex extraction for Python repr strings
  }

  // 2. Extract from Python repr: [{'type': 'text', 'text': '...', 'extras': ...}]
  const pythonTextRegex = /['"]text['"]\s*:\s*(['"])((?:(?!\1)[\s\S]|\\.)*)\1/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pythonTextRegex.exec(trimmed)) !== null) {
    let textContent = match[2];
    textContent = textContent
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    matches.push(textContent);
  }

  if (matches.length > 0) {
    return matches.join('\n\n');
  }

  return trimmed;
}
