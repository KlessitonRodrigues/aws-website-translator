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

export const deepMerge = (target: JsonObject, source: JsonObject): JsonObject => {
  const merged: JsonObject = { ...target };

  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(value) && isPlainObject(existing) ? deepMerge(existing, value) : value;
  }

  return merged;
};
