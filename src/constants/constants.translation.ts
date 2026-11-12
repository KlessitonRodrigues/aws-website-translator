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

export const targetFiles: TranslationFile[] = [
  { path: `${workdir}/pt.json`, language: 'Portuguese' },
  { path: `${workdir}/es.json`, language: 'Spanish' },
];

export const buildTranslatePrompt = (params: TranslatePromptInput) =>
  [
    `Translate each text segment from ${params.sourceLanguage} to ${params.targetLanguage}.`,
    `The ${params.count} segments are separated by the | character.`,
    'Rules:',
    '- Translate the text only. Do not add or remove segments or separators.',
    '- Do not translate placeholders like {{name}}, {count}, %s, URLs, emails or file paths.',
    `- Respond with ONLY the ${params.count} translated segments separated by |, in the same order.`,
    '- No markdown, no code fences, no explanations.',
    '',
    'Segments:',
    params.values,
  ].join('\n');
