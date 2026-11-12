import './config/config.dotenv'; // sort-imports-ignore

import fs from 'fs';

import { cliMessages } from './constants/constants.messages';
import { originDiffFile, originFile, targetFiles } from './constants/constants.translation';
import { translateJsonWithBedrock } from './lib/bedrock/bedrock.translate';
import { readJsonObject, writeJsonObject } from './utils/utils.file';
import { deepMerge, getChangedValues, pruneMissingKeys } from './utils/utils.object';

const run = async () => {
  console.log(`${cliMessages.READING_INPUT}: ${originFile.path}`);
  const input = readJsonObject(originFile.path);

  if (!fs.existsSync(originDiffFile.path)) {
    writeJsonObject(originDiffFile.path, input);
    console.log(`${cliMessages.CREATED_DIFF}: ${originDiffFile.path}`);
  }
  const previous = readJsonObject(originDiffFile.path);

  const changed = getChangedValues({ current: input, previous });
  const hasChanges = Object.keys(changed).length > 0;
  if (!hasChanges) console.log(cliMessages.NO_CHANGES);

  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  for (const { path, language } of targetFiles) {
    const existing = fs.existsSync(path) ? readJsonObject(path, { allowEmpty: true }) : {};
    const pruned = pruneMissingKeys({ target: existing, source: input });

    let result = pruned;
    if (hasChanges) {
      console.log(`${cliMessages.TRANSLATING_TO} '${language}'...`);
      const { translated, usage } = await translateJsonWithBedrock({
        input: changed,
        sourceLanguage: originFile.language,
        targetLanguage: language,
      });
      result = deepMerge(pruned, translated);
      console.log(
        `${cliMessages.TOKENS_USED} (${language}): ${usage.totalTokens} ` +
          `${cliMessages.TOKENS_INPUT} ${usage.inputTokens}, ` +
          `${cliMessages.TOKENS_OUTPUT} ${usage.outputTokens}`,
      );
      totalUsage.inputTokens += usage.inputTokens;
      totalUsage.outputTokens += usage.outputTokens;
      totalUsage.totalTokens += usage.totalTokens;
    }

    writeJsonObject(path, result);
    console.log(`${cliMessages.WROTE_OUTPUT}: ${path}`);
  }

  writeJsonObject(originDiffFile.path, input);

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
