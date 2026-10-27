# reader-ui

The remit reader user interface: `@remit/ui` (components), `@remit/web-client` (the app shell, auth shells, runtime config and the vite preset a host builds with), the private `@remit/workbench` Storybook and the private `@remit/test-dom` test globals. It publishes `@remit/ui`, `@remit/web-client` and `@remit/web-client-dist` to npm.

## Rules

- TypeScript only. No Python.
- npm workspaces with one lockfile at the root. Node 24 (`.nvmrc`). Every dependency is an exact version.
- Biome formats and lints. Run `npm run fix` before every commit.
- `main` is protected. Branch from `origin/main`, run `npm run ci` before pushing, and open a pull request with a conventional title under 72 characters and a four-line body. Arm `gh pr merge --squash --auto`; it squash merges once `ci` is green.
- CI runs the parts of `npm run ci` as parallel jobs, with the web-client suite in four shards. The `ci` job passes only when every one of them passed, and it is the required check on `main`.
- Every UI change ships a story beside it; Storybook and the screen never drift. `docs/architecture/storybook.md` states the two story roots, and `docs/architecture/url-state.md` states where a fact may live in a URL.
- Never import a reader package by a relative path or a `file:` dependency. Reader code arrives from npm.

## What the code does not tell you

1. This repo depends on reader's published `@remit/api-http-client`, `@remit/domain-enums`, `@remit/data-ports` and `@remit/mail-oauth-service` as peer dependencies, so a host installs one copy and the API client keeps one configured instance. The root `package.json` pins each exactly for this repo's own build and tests.
2. Reader's `mcp-server` depends on `@remit/ui/mcp-pages`, and its stylesheet scans `@remit/ui`'s components from `node_modules`. A change to `mcp-pages` or to a component those pages render reaches reader only when reader bumps `@remit/ui`.
3. `@remit/web-client` depends on `@remit/spellcheck-engine`, the Hunspell WebAssembly engine. Reader builds it from `docker/hunspell/` and publishes it, because the build needs the 3.4 GB Emscripten image. `REMIT_SPELLCHECK_ENGINE_DIR` overrides the engine, and an empty `REMIT_SPELLCHECK_LANGUAGES` builds without a spellchecker.
4. The story frame fakes the API with MSW handlers typed by the pinned client. A type break shows when this repo bumps that pin; a behaviour break shows only in reader's and reader-cloudflare's e2e suites.
5. A UI change ships in three steps: a pull request here; a `ui-v*` tag on `main`, which runs the Publish workflow; then a bump of the exact pins in reader (`packages/web`, `packages/mcp-server`) and in reader-cloudflare (`packages/web`). A change that needs a new API field starts in reader: reader publishes on `pkgs-v*`, this repo bumps its pins, then tags.
6. Publishing is content-hash gated, as in reader: a package publishes only when its packed content differs from the version on npm, as a patch bump of the registry version. Nothing commits a version. npm tries the trusted publisher first and falls back to the `NPM_TOKEN` secret; the `NPM_PUBLISH_ENABLED` variable arms the workflow.
7. Storybook deploys to the `gh-pages` root on every push to `main`. Ticking the checkbox the preview workflow comments on a pull request deploys a preview under `pr/<number>/<sha>/`, and closing the pull request removes it.

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
| `npm run check:web-client-consumer` | Build the packed web client the way a host does, in a clean directory         |
| `npm run ci`                        | Every check CI runs, in sequence; run before every push                       |
