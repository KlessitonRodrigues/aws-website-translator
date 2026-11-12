## General Instructions

- File convention: <parent_folder>.<file_name>.ts
- Keep agents.md and readme.md to update on change project structure
- Commit small changes using "feat/update/fix/refactor/remove: <short_description>"
- Push commits is always manual

### NodeJS

- Use src/config for configuration
- Use src/constants for variables
- Use src/utils for utilities code
- Declare type on top of file
- Only use typed return when needed
- Function with more than 2 parameters use an object: sum = (params: sumParams) => {}

### AWS

- Use src/lib/<bedrock> for aws resources

## Files

<!-- Update with current file paths -->

```
.
├── .env.example                # Environment variables example
├── .github/workflows           # GitHub Actions workflows
├── readme.md                   # Project README (submodule instructions)
├── AGENTS.md                   # This file
├── package.json                # Root package manifest
├── tsconfig.json               # TypeScript configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore                  # Git ignore rules
├── yarn.lock                   # Lockfile
├── out/                        # Translated output files (en.json, en.diff.json, es.json, pt.json)
└── src/
    ├── translate.ts            # Main translation entrypoint
    ├── config/
    │   ├── config.dotenv.ts    # Dotenv configuration
    │   └── config.bedrock.ts   # Bedrock configuration
    ├── constants/
    │   ├── constants.environment.ts
    │   ├── constants.translation.ts
    │   └── constants.messages.ts
    ├── lib/
    │   └── bedrock/
    │       └── bedrock.translate.ts
    └── utils/
        ├── utils.file.ts
        └── utils.object.ts
```

## Project Instructions

<!-- add more instruction below -->
