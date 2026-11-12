import './config/config.dotenv'; // sort-imports-ignore

import { z } from 'zod';

import { cliMessages } from './constants/constants.messages';
import { translationDefaults } from './constants/constants.translation';
import { translateJsonWithBedrock } from './lib/bedrock/bedrock.translate';
import { outputFilePath, readJsonObject, writeJsonObject } from './utils/utils.file';

const languageCode = z
  .string()
  .toLowerCase()
  .regex(/^[a-z]{2,3}(-[a-z]{2,4})?$|^auto$/);

const argsSchema = z.object({
  inputPath: z.string().min(1).default(translationDefaults.inputPath),
  sourceLanguage: languageCode.default(translationDefaults.sourceLanguage),
  targetLanguages: z.array(languageCode).min(1),
});

type TranslateArgs = z.infer<typeof argsSchema>;

const parseArgs = (argv: string[]): TranslateArgs => {
  const parsed: { inputPath?: string; sourceLanguage?: string; targetLanguages: string[] } = {
    targetLanguages: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-l' || arg === '--languages') {
      i++;
      if (i >= argv.length) throw new Error(cliMessages.MISSING_LANGUAGES);
      const langs = argv[i]
        .split(',')
        .map(lang => lang.trim().toLowerCase())
        .filter(Boolean);
      if (langs.length === 0) throw new Error(cliMessages.MISSING_LANGUAGES);
      parsed.targetLanguages.push(...langs);
    } else if (arg === '-s' || arg === '--source') {
      i++;
      if (i >= argv.length) throw new Error(cliMessages.USAGE);
      parsed.sourceLanguage = argv[i].trim().toLowerCase();
    } else if (!arg.startsWith('-')) {
      parsed.inputPath = arg;
    }
  }

  if (parsed.targetLanguages.length === 0) throw new Error(cliMessages.MISSING_LANGUAGES);

  return argsSchema.parse({
    inputPath: parsed.inputPath,
    sourceLanguage: parsed.sourceLanguage,
    targetLanguages: parsed.targetLanguages,
  });
};

const run = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2));
  console.log(`${cliMessages.READING_INPUT}: ${args.inputPath}`);
  const input = readJsonObject(args.inputPath);

  for (const language of args.targetLanguages) {
    console.log(`${cliMessages.TRANSLATING_TO} '${language}'...`);
    const translated = await translateJsonWithBedrock(input, args.sourceLanguage, language);
    const outputPath = outputFilePath(args.inputPath, language);
    writeJsonObject(outputPath, translated);
    console.log(`${cliMessages.WROTE_OUTPUT}: ${outputPath}`);
  }
};

run().catch(err => {
  if (err instanceof z.ZodError) {
    console.error(err.issues.map(issue => issue.message).join('\n'));
    console.error(cliMessages.USAGE);
  } else {
    console.error(err instanceof Error ? err.message : err);
  }
  process.exit(1);
});
