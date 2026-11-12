import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

import bedrockClient, { bedrockModelId } from '../../config/config.bedrock';
import { cliMessages } from '../../constants/constants.messages';
import { buildTranslatePrompt, systemPrompt } from '../../constants/constants.translation';
import { flattenLeaves, unflattenLeaves } from '../../utils/utils.object';

export type BedrockUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type TranslationResult = {
  translated: Record<string, unknown>;
  usage: BedrockUsage;
};

export type TranslateJsonInput = {
  input: Record<string, unknown>;
  sourceLanguage: string;
  targetLanguage: string;
};

const parseTranslation = (text: string): Record<string, unknown> | null => {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/, '')
    .replace(/```\s*$/, '');

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const translateJsonWithBedrock = async (
  params: TranslateJsonInput,
): Promise<TranslationResult> => {
  // Send only values keyed by index ({"1": "...", "2": "..."}) to save tokens.
  const leaves = flattenLeaves(params.input);
  const indexed: Record<string, unknown> = {};
  leaves.forEach((leaf, i) => {
    indexed[String(i + 1)] = leaf.value;
  });

  const response = await bedrockClient.send(
    new ConverseCommand({
      modelId: bedrockModelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              text: buildTranslatePrompt({
                json: JSON.stringify(indexed),
                sourceLanguage: params.sourceLanguage,
                targetLanguage: params.targetLanguage,
              }),
            },
          ],
        },
      ],
      system: [{ text: systemPrompt }],
      inferenceConfig: { temperature: 0, maxTokens: 4096 },
    }),
  );

  const text = (response.output?.message?.content ?? [])
    .map(part => ('text' in part ? part.text : ''))
    .join('');

  const usage: BedrockUsage = {
    inputTokens: response.usage?.inputTokens ?? 0,
    outputTokens: response.usage?.outputTokens ?? 0,
    totalTokens: response.usage?.totalTokens ?? 0,
  };

  const translatedIndexed = parseTranslation(text);
  const missingIndex = leaves.some((_, i) => !(String(i + 1) in (translatedIndexed ?? {})));
  if (!translatedIndexed || missingIndex) {
    console.error(`Raw model response: ${JSON.stringify(text)}`);
    throw new Error(cliMessages.INVALID_TRANSLATION);
  }

  const translated = unflattenLeaves(
    leaves.map((leaf, i) => ({ path: leaf.path, value: translatedIndexed[String(i + 1)] })),
  );
  return { translated, usage };
};
