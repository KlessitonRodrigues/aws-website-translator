type JsonObject = Record<string, unknown>;

type ChangedValuesParams = {
  current: JsonObject;
  previous: JsonObject;
};

const isPlainObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const getChangedValues = (params: ChangedValuesParams): JsonObject => {
  const changed: JsonObject = {};

  for (const [key, value] of Object.entries(params.current)) {
    const previousValue = params.previous[key];

    if (isPlainObject(value)) {
      const nested = getChangedValues({
        current: value,
        previous: isPlainObject(previousValue) ? previousValue : {},
      });
      if (Object.keys(nested).length > 0) changed[key] = nested;
      continue;
    }

    if (JSON.stringify(value) !== JSON.stringify(previousValue)) changed[key] = value;
  }

  return changed;
};

// Drops keys from target that no longer exist in source (recursively).
export const pruneMissingKeys = (params: {
  target: JsonObject;
  source: JsonObject;
}): JsonObject => {
  const pruned: JsonObject = {};

  for (const [key, value] of Object.entries(params.target)) {
    if (!(key in params.source)) continue;
    const sourceValue = params.source[key];

    if (isPlainObject(value) && isPlainObject(sourceValue)) {
      pruned[key] = pruneMissingKeys({ target: value, source: sourceValue });
    } else {
      pruned[key] = value;
    }
  }

  return pruned;
};

export type LeafEntry = { path: string[]; value: unknown };

export const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

const collectLeaves = (params: { node: JsonObject; path: string[]; leaves: LeafEntry[] }) => {
  for (const [key, value] of Object.entries(params.node)) {
    const path = [...params.path, key];
    if (isPlainObject(value)) collectLeaves({ node: value, path, leaves: params.leaves });
    else params.leaves.push({ path, value });
  }
  return params.leaves;
};

// Flattens nested objects into ordered leaf entries (key path + value).
export const flattenLeaves = (node: JsonObject): LeafEntry[] =>
  collectLeaves({ node, path: [], leaves: [] });

// Rebuilds a nested object from leaf entries.
export const unflattenLeaves = (entries: LeafEntry[]): JsonObject => {
  const result: JsonObject = {};

  for (const { path, value } of entries) {
    let cursor = result;
    path.slice(0, -1).forEach(key => {
      if (!isPlainObject(cursor[key])) cursor[key] = {};
      cursor = cursor[key] as JsonObject;
    });
    cursor[path[path.length - 1]] = value;
  }

  return result;
};

export const deepMerge = (target: JsonObject, source: JsonObject): JsonObject => {
  const merged: JsonObject = { ...target };

  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(value) && isPlainObject(existing) ? deepMerge(existing, value) : value;
  }

  return merged;
};
