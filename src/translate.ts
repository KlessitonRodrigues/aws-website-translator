import './config/config.dotenv'; // sort-imports-ignore

import fs from 'fs';

import { cliMessages } from './constants/constants.messages';
import { originCloneFile, originFile, targetFiles } from './constants/constants.translation';
import { translateJsonWithBedrock } from './lib/bedrock/bedrock.translate';
import { readJsonObject, writeJsonObject } from './utils/utils.file';
import { deepMerge, getChangedValues } from './utils/utils.object';

const run = async () => {
  console.log(`${cliMessages.READING_INPUT}: ${originFile.path}`);
  const input = readJsonObject(originFile.path);

  if (!fs.existsSync(originCloneFile.path)) {
    writeJsonObject(originCloneFile.path, input);
    console.log(`${cliMessages.CREATED_CLONE}: ${originCloneFile.path}`);
  }
  const previous = readJsonObject(originCloneFile.path);

  const changed = getChangedValues({ current: input, previous });
  if (Object.keys(changed).length === 0) {
    console.log(cliMessages.NO_CHANGES);
    return;
  }

  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  for (const { path, language } of targetFiles) {
    console.log(`${cliMessages.TRANSLATING_TO} '${language}'...`);
    const { translated, usage } = await translateJsonWithBedrock({
      input: changed,
      sourceLanguage: originFile.language,
      targetLanguage: language,
    });
    const existing = fs.existsSync(path) ? readJsonObject(path) : {};
    writeJsonObject(path, deepMerge(existing, translated));
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

  writeJsonObject(originCloneFile.path, input);

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
