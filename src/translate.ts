import './config/config.dotenv'; // sort-imports-ignore

import { cliMessages } from './constants/constants.messages';
import { originFile, targetFiles } from './constants/constants.translation';
import { translateJsonWithBedrock } from './lib/bedrock/bedrock.translate';
import { readJsonObject, writeJsonObject } from './utils/utils.file';

const run = async () => {
  console.log(`${cliMessages.READING_INPUT}: ${originFile.path}`);
  const input = readJsonObject(originFile.path);

  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  for (const { path, language } of targetFiles) {
    console.log(`${cliMessages.TRANSLATING_TO} '${language}'...`);
    const { translated, usage } = await translateJsonWithBedrock({
      input,
      sourceLanguage: originFile.language,
      targetLanguage: language,
    });
    writeJsonObject(path, translated);
    console.log(`${cliMessages.WROTE_OUTPUT}: ${path}`);
    console.log(
      `${cliMessages.TOKENS_USED} (${language}): ${usage.totalTokens} ` +
        `${cliMessages.TOKENS_INPUT} ${usage.inputTokens}, ` +
        `${cliMessages.TOKENS_OUTPUT} ${usage.outputTokens}`,
    );
    totalUsage.inputTokens += usage.inputTokens;
    totalUsage.outputTokens += usage.outputTokens;
    totalUsage.totalTokens += usage.totalTokens;
  }

  console.log(
    `${cliMessages.TOKENS_USED}: ${totalUsage.totalTokens} ` +
      `${cliMessages.TOKENS_INPUT} ${totalUsage.inputTokens}, ` +
      `${cliMessages.TOKENS_OUTPUT} ${totalUsage.outputTokens}`,
  );
};

run().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
