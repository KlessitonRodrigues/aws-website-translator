import './config/config.dotenv'; // sort-imports-ignore

import fs from 'fs';

import { cliMessages } from './constants/constants.messages';
import {
  originDiffFile,
  originFile,
  targetFiles,
  translationChunkSize,
} from './constants/constants.translation';
import { translateJsonWithBedrock } from './lib/bedrock/bedrock.translate';
import { readJsonObject, writeJsonObject } from './utils/utils.file';
import {
  chunkArray,
  deepMerge,
  flattenLeaves,
  getChangedValues,
  pruneMissingKeys,
  unflattenLeaves,
} from './utils/utils.object';

type TargetState = {
  path: string;
  language: string;
  result: Record<string, unknown>;
};

const run = async () => {
  console.log(`${cliMessages.READING_INPUT}: ${originFile.path}`);
  const input = readJsonObject(originFile.path);

  if (!fs.existsSync(originDiffFile.path)) {
    writeJsonObject(originDiffFile.path, {});
    console.log(`${cliMessages.CREATED_DIFF}: ${originDiffFile.path}`);
  }
  let previous = readJsonObject(originDiffFile.path, { allowEmpty: true });

  const changed = getChangedValues({ current: input, previous });
  const chunks = chunkArray(flattenLeaves(changed), translationChunkSize);
  if (chunks.length === 0) console.log(cliMessages.NO_CHANGES);

  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  const states: TargetState[] = targetFiles.map(({ path, language }) => {
    const existing = fs.existsSync(path) ? readJsonObject(path, { allowEmpty: true }) : {};
    const pruned = pruneMissingKeys({ target: existing, source: input });
    writeJsonObject(path, pruned);
    return { path, language, result: pruned };
  });

  for (const [index, chunk] of chunks.entries()) {
    const chunkInput = unflattenLeaves(chunk);
    console.log(`${cliMessages.TRANSLATING_BATCH} ${index + 1}/${chunks.length}`);

    for (const state of states) {
      console.log(`${cliMessages.TRANSLATING_TO} '${state.language}'...`);
      const { translated, usage } = await translateJsonWithBedrock({
        input: chunkInput,
        sourceLanguage: originFile.language,
        targetLanguage: state.language,
      });
      state.result = deepMerge(state.result, translated);
      writeJsonObject(state.path, state.result);
      console.log(
        `${cliMessages.TOKENS_USED} (${state.language}): ${usage.totalTokens} ` +
          `${cliMessages.TOKENS_INPUT} ${usage.inputTokens}, ` +
          `${cliMessages.TOKENS_OUTPUT} ${usage.outputTokens}`,
      );
      totalUsage.inputTokens += usage.inputTokens;
      totalUsage.outputTokens += usage.outputTokens;
      totalUsage.totalTokens += usage.totalTokens;
    }

    // Record only the lines that were translated for every target.
    previous = deepMerge(previous, chunkInput);
    writeJsonObject(originDiffFile.path, previous);
  }

  for (const state of states) console.log(`${cliMessages.WROTE_OUTPUT}: ${state.path}`);

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
