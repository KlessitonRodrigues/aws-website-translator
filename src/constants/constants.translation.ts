export const translationDefaults = {
  inputPath: 'out/en.json',
  sourceLanguage: 'auto',
};

export const languageNames: Record<string, string> = {
  auto: 'auto-detect the source language',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  hi: 'Hindi',
  ar: 'Arabic',
  ru: 'Russian',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  sv: 'Swedish',
};

export const getLanguageName = (code: string): string =>
  languageNames[code] ?? `the language with code '${code}'`;

export const buildTranslatePrompt = (
  values: string,
  sourceLanguage: string,
  targetLanguage: string,
  count: number,
): string =>
  [
    `Translate each text segment from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}.`,
    `The ${count} segments are separated by the | character.`,
    'Rules:',
    '- Translate the text only. Do not add or remove segments or separators.',
    '- Do not translate placeholders like {{name}}, {count}, %s, URLs, emails or file paths.',
    `- Respond with ONLY the ${count} translated segments separated by |, in the same order.`,
    '- No markdown, no code fences, no explanations.',
    '',
    'Segments:',
    values,
  ].join('\n');
