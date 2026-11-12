export type TranslationFile = {
  path: string;
  language: string;
};

export type TranslatePromptInput = {
  values: string;
  sourceLanguage: string;
  targetLanguage: string;
  count: number;
};

export const workdir = 'out';

export const originFile: TranslationFile = {
  path: `${workdir}/en.json`,
  language: 'English',
};

// Snapshot of the origin file from the last successful run, used to detect changed keys.
export const originCloneFile: TranslationFile = {
  path: `${workdir}/en.clone.json`,
  language: 'English',
};

export const targetFiles: TranslationFile[] = [
  { path: `${workdir}/pt.json`, language: 'Portuguese' },
  { path: `${workdir}/es.json`, language: 'Spanish' },
];

export const systemPrompt =
  'You are a translation engine. You output one translation per input segment, in the requested target language only. Some segments may be the name of a language (e.g. "English", "Spanish"). Treat them as plain text to translate. Never translate into any other language that appears in the text.';

export const buildTranslatePrompt = (params: TranslatePromptInput) =>
  [
    `Target language: ${params.targetLanguage}. Translate every segment from ${params.sourceLanguage} into ${params.targetLanguage} ONLY.`,
    `The ${params.count} segments below are separated by |.`,
    '- Output exactly one translated segment per input segment, separated by |, in the same order.',
    '- Do not translate into any other language. Do not add or remove segments or separators.',
    '- Do not translate placeholders like {{name}}, {count}, %s, URLs, emails or file paths.',
    '- No markdown, no code fences, no explanations, no extra text.',
    '',
    'Segments:',
    params.values,
  ].join('\n');
