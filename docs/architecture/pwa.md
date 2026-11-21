# Opt-in app shell

A host enables the shell with `webClientPreset({ entry, runtimeConfig, commit,
pwa: { enabled: true, manifestOverrides: { name: "My mail" } } })`. The preset
keeps its plugins, public directory, installation icons and credentialed manifest
link. Manifest id, start URL and scope stay `/`; the Vite base must be `/`.
`updateMode: "managed"` still disables the self-host updater UI.

The packed package includes the TypeScript worker. `injectManifest` builds one
root `/sw.js` without imports. Registration is manual in `mountApp`, with scope
`/` and no plugin reload code. The runtime config is a Rollup asset, emitted
before precache generation. Hosts that copy runtime assets after building must
move that work to the awaited `pwa.beforePrecache(outDir)` hook. Every output
file except source maps and the worker must appear in the revisioned precache;
missing or oversized entries fail the build. The HTML entry is `/`, because
Cloudflare canonicalizes `/index.html` with a redirect.

Navigations read the shell cache first. API, content, uploads, Access, OAuth,
authentication and `reauth=1` navigations reach the network. No runtime response
cache is installed. Failed or redirected precache downloads fail installation.
Hosts with server-rendered pages add `pwa.navigationDenylist: ["/consent",
"/device", "/apps"]`. This optional `readonly string[]` is baked into `sw.js`;
each rooted pathname excludes itself and its descendants, while built-in
exclusions remain in force. Navigations whose final path segment has a file
extension also reach the network, preserving server responses for missing
assets. Regular asset fetches still use the precache.
Hosts must serve worker/manifest MIME types, prevent missing-static-file SPA
fallback, and configure Access bypass paths themselves.

# Update and U2 contracts

The waiting worker asks every window client, including uncontrolled clients,
for permission before activation. An unresponsive tab vetoes the update. Each
tab blocks while a composer is open or a React Query mutation is pending. Draft
saves also own blockers from scheduling through queueing and settlement, even
after the composer closes. Safe
tabs hold user input while voting; a veto releases them. A second vote checks
for late writes and pins the hold through activation. Membership is checked
again after that vote. An accepted activation claims clients; each tab checks
its own draft/write barrier before reloading once, including arrivals during
takeover. The chunk error
handler requests a worker update through this same coordinator. A successful
fresh network config response compares `buildCommit` to the bundle SHA and
requests `registration.update()` on mismatch. Config requests bypass HTTP cache;
query-cache restoration never participates in that comparison. The controlling
worker reports its shell version so a stale document can recover safely even
when updating the already-current worker creates no waiting worker. Persisted
`pageshow` restarts waiting-worker checks immediately and resumes polling.
Recovery uses an in-memory reload guard and the worker/document versions;
unavailable or full session storage cannot block a safe takeover.

`@remit/web-client/pwa` exports `registerUpdateBlocker(() => boolean)` (returns
an unregister function), `isUpdatePrepared()` and `observeServerBuild(commit,
registration)`. U2 must register its pending storage writes, return current
synchronous state, and defer starting new writes while `isUpdatePrepared()` is
true. A host fetching config outside the shared client can call
`observeServerBuild` with a successful fresh response. Tenant identity, content
storage and persistence are deliberately independent of shell cache versions.
Shell caches are versioned by commit and build timestamp and retained across
activation so an older document can still read its chunks. Older caches are
removed only after every tab reports the current shell version; installing or
waiting caches are preserved.

# Verification and release

`npm run check:web-client-consumer` packs and installs both packages, checks
every generated asset against the worker manifest and runs Chromium against
the packed build. It checks offline shell navigation and lazy chunk downloads,
private endpoint exclusion, and a two-tab deployment with an unsaved draft,
followed by one reload per tab. Unit tests cover vetoes, suspended/new tabs,
navigation exclusions and version mismatch requests.

Merge only after `ci` passes. Tag that main commit with `ui-v*` to run Publish;
its content-hash gate publishes changed packages and the matching exact ui
version in web-client. The workflow log names the resulting npm versions. The
host then bumps its exact package pins. This chunk does not publish a release
or change a host.
