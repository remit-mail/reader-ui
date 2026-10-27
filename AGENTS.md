# reader-ui

The remit reader user interface: `@remit/ui` (components), `@remit/web-client` (the app shell, auth shells, runtime config and the vite preset a host builds with), the private `@remit/workbench` Storybook and the private `@remit/test-dom` test globals. It publishes `@remit/ui`, `@remit/web-client` and `@remit/web-client-dist` to npm.

## Rules

- TypeScript only. No Python.
- npm workspaces with one lockfile at the root. Node 24 (`.nvmrc`). Every dependency is an exact version.
- Biome formats and lints. Run `npm run fix` before every commit.
- Branch from `origin/main`, run `npm run ci` before pushing, and open a pull request with a conventional title under 72 characters and a four-line body. Squash merge it once `ci` is green. The repository is private on the free plan, which offers no branch protection and no auto-merge, so nothing but this rule keeps a red pull request out of `main`.
- CI runs the parts of `npm run ci` as parallel jobs, with the web-client suite in four shards. The `ci` job passes only when every one of them passed.
- Every UI change ships a story beside it; Storybook and the screen never drift. `docs/architecture/storybook.md` states the two story roots, and `docs/architecture/url-state.md` states where a fact may live in a URL.
- Never import a reader package by a relative path or a `file:` dependency. Reader code arrives from npm.

## What the code does not tell you

1. This repo depends on reader's published `@remit/api-http-client`, `@remit/domain-enums`, `@remit/data-ports` and `@remit/mail-oauth-service` as peer dependencies, so a host installs one copy and the API client keeps one configured instance. The root `package.json` pins each exactly for this repo's own build and tests.
2. Three hosts consume the packages. reader's `packages/web` and reader-cloudflare's `packages/web` build `@remit/web-client` with its vite preset, and reader's `mcp-server` renders `@remit/ui/mcp-pages`. remit's deploy installs the built `@remit/web-client-dist` and replaces its `config.js`.
3. Inside this repo the package `exports` point at the TypeScript source. `npm-scripts/pack-dist.mjs` compiles `tsconfig.build.json` into `dist`, copies the stylesheets beside the output and swaps in each package's `packManifest` around every `npm pack`, so a host reads JavaScript and declarations. `@remit/ui`'s `tokens.css` names its own components as Tailwind sources, so a host that imports it gets the ui's utilities wherever npm installs the package.
4. `@remit/web-client` depends on `@remit/spellcheck-engine`, the Hunspell WebAssembly engine. Reader builds it from `docker/hunspell/` and publishes it, because the build needs the 3.4 GB Emscripten image. `REMIT_SPELLCHECK_ENGINE_DIR` overrides the engine, and an empty `REMIT_SPELLCHECK_LANGUAGES` builds without a spellchecker.
5. The story frame fakes the API with MSW handlers typed by the pinned client. A type break shows when this repo bumps that pin; a behaviour break shows only in the hosts' e2e suites, which run after a host bumps.
6. A UI change ships in three steps: a pull request here; a `ui-v*` tag on a `main` commit whose `ci` passed, which runs the Publish workflow; then a bump of the exact pins in each host. A change that needs a new API field starts in reader: reader publishes on `pkgs-v*`, this repo bumps its pins, then tags.
7. Publishing is content-hash gated, as in reader: a package publishes only when its packed content differs from the version on npm, as a patch bump of the registry version, so the committed `version` fields trail npm and nothing commits a bump. `@remit/web-client` is published naming the exact `@remit/ui` version of the same run, so a ui change republishes it too. The tag carries no version because one tag publishes three packages, each at its own registry version; the run's log names them. npm tries the trusted publisher first and falls back to the `NPM_TOKEN` secret; the `NPM_PUBLISH_ENABLED` variable arms the workflow.
8. The Storybook Pages workflows run only while the repository is public; on a private repository every job in them skips.

## Scripts

| Script                              | Does                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `npm run fix`                       | Biome rewrites files                                                          |
| `npm run check`                     | Biome format and lint check                                                   |
| `npm run typecheck`                 | `tsgo` over every package                                                     |
| `npm run test`                      | Unit suites with their coverage floors                                        |
| `npm run test:web-client`           | The web-client suite in four shards at once, merged against its 86% floor     |
| `npm run test:scripts`              | The `npm-scripts/**/*.test.mjs` suites                                        |
| `npm run test:stories`              | Every story in Chromium, then the published Storybook behind a path prefix    |
| `npm run storybook`                 | Storybook on port 6007, bound to `0.0.0.0`                                    |
| `npm run build-storybook`           | Static Storybook into `packages/workbench/storybook-static`                   |
| `npm run icons:generate`            | Regenerate the web client icons from `packages/web-client/brand`              |
| `npm run release:dry-run`           | Pack every publishable package and print each publish decision                |
| `npm run release`                   | Publish what changed; the Publish workflow runs it                            |
| `npm run check:web-client-consumer` | Build an app from the packed packages in a clean directory, the way a host does |
| `npm run ci`                        | Every check CI runs, in sequence; run before every push                       |
