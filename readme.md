# aws-serveless-json-translator

CLI tool that translates a JSON localization file into multiple language files using **Amazon Bedrock** (Claude).

Reads a source JSON file (`out/en.json` by default) and writes one translated JSON file per target language next to it (same directory, same keys).

To minimize tokens, the JSON string values are flattened and sent as a single `|`-separated string, then re-assembled into the JSON structure from the translated segments.

## Usage

```bash
yarn translate [inputPath] -l <lang,lang,...> [--source <lang>]
```

| Flag | Description | Default |
| --- | --- | --- |
| `inputPath` | Path to the source JSON file | `out/en.json` |
| `-l, --languages` | Target language codes (comma separated or repeated flags) | required |
| `-s, --source` | Source language code | `auto` |

### Examples

```bash
# Translate out/en.json to Spanish and French -> out/es.json, out/fr.json
yarn translate -l es,fr

# Translate a custom file, auto-detect source language
yarn translate locales/en.json -l es fr de

# Translate specifying the source language
yarn translate out/en.json -l es --source en
```

## Configuration

Environment variables (`.env`):

| Variable | Description | Default |
| --- | --- | --- |
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `BEDROCK_MODEL_ID` | Bedrock model id | `anthropic.claude-3-haiku-20240307-v1:0` |

AWS credentials are resolved from the default credential chain (`aws configure`, env vars, SSO, etc.). The caller needs `bedrock:InvokeModel` permission for the configured model.

## Project structure

- `src/translate.ts` — CLI entry point (arg parsing and orchestration)
- `src/config/` — configuration (`config.dotenv.ts`, `config.bedrock.ts`)
- `src/constants/` — variables (`constants.environment.ts`, `constants.messages.ts`, `constants.translation.ts`)
- `src/utils/` — utility code (`utils.file.ts`)
- `src/lib/bedrock/` — Bedrock translation (`bedrock.translate.ts`)

## Automatic translation (GitHub Actions)

`.github/workflows/translate.yml` runs automatically when `out/en.json` changes on `main` (or manually via *Run workflow*):

1. Installs dependencies and configures AWS credentials
2. Runs `yarn translate out/en.json -l pt,es`
3. Commits `out/pt.json` and `out/es.json` to `main`

Required repository secrets:

| Secret | Description |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | IAM access key with `bedrock:InvokeModel` on the configured model |
| `AWS_SECRET_ACCESS_KEY` | Matching secret access key |
| `AWS_REGION` | Optional, defaults to `us-east-1` |

## Development

```bash
yarn install
yarn format    # prettier check + fix
yarn tsc --noEmit  # typecheck
```
