# aws-website-translator

CLI tool that translates a JSON localization file into multiple language files using **Amazon Bedrock** (Claude).

Reads a source JSON file (`out/en.json` by default) and writes one translated JSON file per target language next to it (same directory, same keys).

To minimize tokens, the JSON string values are flattened and sent as a single `|`-separated string, then re-assembled into the JSON structure from the translated segments.

## Add as submodule

Add this repository as a submodule of another project using the HTTPS link:

```bash
git submodule add https://github.com/KlessitonRodrigues/aws-website-translator.git
git submodule update --init --recursive
```

Then run the CLI from your project root:

```bash
yarn --cwd aws-website-translator install
yarn --cwd aws-website-translator translate <your/en.json> -l pt,es
```

To update the submodule later:

```bash
git submodule update --remote
```

## Usage

```bash
yarn translate [inputPath] -l <lang,lang,...> [--source <lang>]
```

| Flag              | Description                                               | Default       |
| ----------------- | --------------------------------------------------------- | ------------- |
| `inputPath`       | Path to the source JSON file                              | `out/en.json` |
| `-l, --languages` | Target language codes (comma separated or repeated flags) | required      |
| `-s, --source`    | Source language code                                      | `auto`        |

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

Environment variables (`.env` — see `.env.example`):

| Variable                   | Description                                          | Default                 |
| -------------------------- | ---------------------------------------------------- | ----------------------- |
| `AWS_REGION`               | AWS region for Bedrock                               | `us-east-1`             |
| `AWS_ACCESS_KEY_ID`        | IAM access key (or use any default-chain credential) | —                       |
| `AWS_SECRET_ACCESS_KEY`    | Secret access key for the access key above           | —                       |
| `BEDROCK_MODEL_ID`         | Bedrock model id                                     | `google.gemma-3-12b-it` |
| `AWS_BEARER_TOKEN_BEDROCK` | Bearer token for Bedrock authentication              | —                       |

AWS credentials are resolved from the default credential chain (`aws configure`, env vars, SSO, etc.). The caller needs `bedrock:InvokeModel` permission for the configured model.

## Automatic translation (GitHub Actions)

`.github/workflows/translate.yml` runs automatically when `out/en.json` changes on `main` (or manually via _Run workflow_):

1. Installs dependencies and configures AWS credentials
2. Runs `yarn translate out/en.json -l pt,es`
3. Commits `out/pt.json` and `out/es.json` to `main`

Required repository secrets (set with `gh secret set <NAME>`, see `.env.example` for the variable names):

| Secret                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM access key with `bedrock:InvokeModel` on the configured model |
| `AWS_SECRET_ACCESS_KEY` | Matching secret access key                                        |
| `AWS_REGION`            | Optional, defaults to `us-east-1`                                 |

## Project structure

- `src/translate.ts` — CLI entry point (arg parsing and orchestration)
- `src/config/` — configuration (`config.dotenv.ts`, `config.bedrock.ts`)
- `src/constants/` — variables (`constants.environment.ts`, `constants.messages.ts`, `constants.translation.ts`)
- `src/utils/` — utility code (`utils.file.ts`)
- `src/lib/bedrock/` — Bedrock translation (`bedrock.translate.ts`)

## Development

```bash
yarn install
yarn format    # prettier check + fix
yarn tsc --noEmit  # typecheck
```
