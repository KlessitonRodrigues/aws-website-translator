export type TranslationFile = {
  path: string;
  language: string;
};

export type TranslatePromptInput = {
  json: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export const workdir = '../../apps/vite-profile-page/src/public/i18n';

// Max number of changed lines sent to the model per request.
export const translationChunkSize = 50;

export const originFile: TranslationFile = {
  path: `${workdir}/pt.json`,
  language: 'Portuguese',
};

// Snapshot of the origin file from the last successful run, used to detect changed keys.
export const originDiffFile: TranslationFile = {
  path: `${workdir}/pt.diff.json`,
  language: 'Portuguese',
};

export const targetFiles: TranslationFile[] = [
  { path: `${workdir}/es.json`, language: 'Spanish' },
  { path: `${workdir}/en.json`, language: 'English' },
];

export const systemPrompt =
  'You are a translation engine. You receive a JSON object whose keys are numeric line numbers and whose values are strings. You return a JSON object with the same keys, with each value translated into the requested target language only. Some values may be the name of a language (e.g. "English", "Spanish"). Treat them as plain text to translate. Never translate into any other language that appears in the text.';

export const buildTranslatePrompt = (params: TranslatePromptInput) =>
  [
    `Target language: ${params.targetLanguage}. Translate every value from ${params.sourceLanguage} into ${params.targetLanguage} ONLY.`,
    '- Return a valid JSON object with exactly the same keys as the input. Keep keys unchanged.',
    '- Do not translate into any other language. Do not add or remove keys.',
    '- Do not translate placeholders like {{name}}, {count}, %s, URLs, emails or file paths.',
    '- No markdown, no code fences, no explanations, no extra text.',
    '',
    'JSON:',
    params.json,
  ].join('\n');
