import fs from 'fs';
import path from 'path';

import { cliMessages } from '../constants/constants.messages';

export const readJsonObject = (
  filePath: string,
  options: { allowEmpty?: boolean } = {},
): Record<string, unknown> => {
  if (!fs.existsSync(filePath)) throw new Error(cliMessages.INPUT_FILE_NOT_FOUND);

  const content = fs.readFileSync(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(cliMessages.INVALID_JSON_FILE);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(cliMessages.INVALID_JSON_FILE);
  }
  if (!options.allowEmpty && Object.keys(parsed).length === 0)
    throw new Error(cliMessages.INVALID_JSON_FILE);

  return parsed as Record<string, unknown>;
};

export const writeJsonObject = (filePath: string, data: Record<string, unknown>): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
};
