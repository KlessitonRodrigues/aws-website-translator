# aws-website-translator

CLI tool that translates a JSON localization file into multiple language files using **Amazon Bedrock** (Claude).

Source and target files are configured in `src/constants/constants.translation.ts`: an `originFile` (file path + its language name) and a `targetFiles` array (file paths + their language names to be translated). Each target file is written with the same keys as the origin file.

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
yarn --cwd aws-website-translator translate
```

To update the submodule later:

```bash
git submodule update --remote
```

## Usage

```bash
yarn translate
```

No CLI args — the origin file and target files are configured in `src/constants/constants.translation.ts` (languages use full names):

```ts
export const workdir = 'out';

export const originFile = { path: `${workdir}/en.json`, language: 'English' };

export const targetFiles = [
  { path: `${workdir}/pt.json`, language: 'Portuguese' },
  { path: `${workdir}/es.json`, language: 'Spanish' },
];
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
2. Runs `yarn translate`
3. Commits `out/pt.json` and `out/es.json` to `main`

Required repository secrets (set with `gh secret set <NAME>`, see `.env.example` for the variable names):

| Secret                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM access key with `bedrock:InvokeModel` on the configured model |
| `AWS_SECRET_ACCESS_KEY` | Matching secret access key                                        |
| `AWS_REGION`            | Optional, defaults to `us-east-1`                                 |

## Project structure

- `src/translate.ts` — CLI entry point (reads `originFile`, loops `targetFiles`)
- `src/config/` — configuration (`config.dotenv.ts`, `config.bedrock.ts`)
- `src/constants/` — variables (`constants.environment.ts`, `constants.messages.ts`, `constants.translation.ts` with `originFile` + `targetFiles`, prompt builder)
- `src/utils/` — utility code (`utils.file.ts`)
- `src/lib/bedrock/` — Bedrock translation (`bedrock.translate.ts`)

## Development

```bash
yarn install
yarn format    # prettier check + fix
yarn tsc --noEmit  # typecheck
```
