## General Instructons

- File convention: <parent_folder>.<file_name>.ts
- Keep agents.md and readme.md to update on change project structure
- Commit small changes using "feat/update/fix/refactor/remove: <short_description>"
- Push commits is always manual

## Project Instructions

- Use src/config for configuration
- Use src/constants for variables
- Use src/utils for utilitare code
- Use src/lib/bedrock for aws resources
- CLI entry point is src/translate.ts (`yarn translate [inputPath] -l <lang,lang,...> [--source <lang>]`)

## Structure

- src/translate.ts: CLI entry point
- src/config: config.dotenv.ts, config.bedrock.ts (BedrockRuntimeClient + model id)
- src/constants: constants.environment.ts, constants.messages.ts, constants.translation.ts
- src/utils: utils.file.ts (JSON file read/write, output path helper)
- src/lib/bedrock: bedrock.translate.ts (translate JSON via Bedrock Converse API; values flattened into a single |-separated string to reduce tokens, then rebuilt into the JSON structure)
