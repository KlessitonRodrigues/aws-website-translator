import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

import bedrockClient, { bedrockModelId } from '../../config/config.bedrock';
import { cliMessages } from '../../constants/constants.messages';
import { buildTranslatePrompt } from '../../constants/constants.translation';

const collectStringValues = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(collectStringValues);
};

const rebuildWithValues = (value: unknown, values: string[]): unknown => {
  if (typeof value === 'string') return values.shift() ?? '';
  if (typeof value !== 'object' || value === null) return value;
  if (Array.isArray(value)) return value.map(child => rebuildWithValues(child, values));

  const rebuilt: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    rebuilt[key] = rebuildWithValues(child, values);
  }
  return rebuilt;
};

const parseTranslation = (text: string, expectedCount: number): string[] => {
  const values = text
    .replace(/^```(?:json)?\s*/, '')
    .replace(/```\s*$/, '')
    .split('|')
    .map(value => value.trim());

  if (expectedCount === 0 || values.length !== expectedCount) {
    throw new Error(cliMessages.INVALID_TRANSLATION);
  }
  return values;
};

export const translateJsonWithBedrock = async (
  input: Record<string, unknown>,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<Record<string, unknown>> => {
  const values = collectStringValues(input);

  const response = await bedrockClient.send(
    new ConverseCommand({
      modelId: bedrockModelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              text: buildTranslatePrompt(
                values.join('|'),
                sourceLanguage,
                targetLanguage,
                values.length,
              ),
            },
          ],
        },
      ],
      inferenceConfig: { temperature: 0, maxTokens: 4096 },
    }),
  );

  const text = (response.output?.message?.content ?? [])
    .map(part => ('text' in part ? part.text : ''))
    .join('');

  const translatedValues = parseTranslation(text, values.length);
  return rebuildWithValues(input, [...translatedValues]) as Record<string, unknown>;
};
