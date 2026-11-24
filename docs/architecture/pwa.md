# Opt-in app shell

A host enables the shell with `webClientPreset({ entry, runtimeConfig, commit,
pwa: { enabled: true, manifestOverrides: { name: "My mail" } } })`. The preset
keeps its plugins, public directory, installation icons and credentialed manifest
link. Manifest id, start URL and scope stay `/`; the Vite base must be `/`.
`updateMode: "managed"` still disables the self-host updater UI.

The packed package includes the compiled worker. `injectManifest` builds one
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

Registration, installation and update failures leave the online app running.
The coordinator catches its background promises and records one warning per
document in telemetry and the recent-errors report, without opening a banner
or the fatal overlay. Installation failure after registration resolves is
detected from the installing worker's state; retiring an installed worker is
not an installation failure.

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
every generated asset against the worker manifest and runs Firefox and Chromium
against the packed build. Firefox checks installation, a rejected installation
with a usable app and one warning, and the brief's request count across
controller changes. Chromium checks offline shell navigation and lazy chunk downloads,
private endpoint exclusion, and a two-tab deployment with an unsaved draft,
followed by one reload per tab. Unit tests cover vetoes, suspended/new tabs,
navigation exclusions and version mismatch requests.

Merge only after `ci` passes. Tag that main commit with `ui-v*` to run Publish;
its content-hash gate publishes changed packages and the matching exact ui
version in web-client. The workflow log names the resulting npm versions. The
host then bumps its exact package pins. This chunk does not publish a release
or change a host.

# Durable reading (U2)

Enable `mountApp({ authProvider, offline: { sessionUrl: "/api/session", reauthenticate } })`
only with the PWA preset enabled. Auth providers may expose `Provider` for
identity context and `SessionGate` for online sign-in; `Shell` remains their
legacy composition. The identity provider always mounts. The offline boundary
restores remembered reading without mounting the online gate. With no remembered
partition, it renders the gate and verifies identity after authentication. Both
shipped Cognito and Better Auth compositions support this separation, including
explicit sign-in/reset-password navigations. Hosts with SDK context in their
existing shell must split that context into `Provider` and its gate into
`SessionGate`; a plain Access gate can continue to use `Shell`.
The gate restores the remembered partition without claiming a current session.
It restores successful reading queries through `PersistQueryClientProvider`
before mounting routes. Unverified sessions keep local reading available and
pause network queries. Mutations fail before optimistic updates and are never
queued for replay. Freshness remains independent of retention: retained queries
have `gcTime: Infinity`, and persistence has `maxAge: Infinity`.

The host contract for C2 is:

- Implement authenticated `GET /api/session` with `Cache-Control: no-store` and
  a 200 JSON response with a nonempty `partitionKey`. Return 401, 403 or a
  redirect when authentication is required. Hosts can import `readSession`
  from `@remit/web-client/offline` for their Access probe.
- On successful protected API and `/content/*` responses, set
  `X-Remit-Partition` to the **server-derived** partition that produced the data.
  Never echo a client-supplied tenant. The mail API client boundary checks API
  provenance before query data reaches persistence; content admission checks
  it independently. Access/login/SPA responses must never carry this provenance.
- Serve immutable mail parts at stable same-origin `/content/*` paths, with the
  exact part MIME, private caching policy, and existing CSP/security headers.
  The path identifies the bytes; query parameters authorize access and are
  excluded from device cache keys so renewed signatures reuse downloaded bytes.
  Exports belong outside these routes and use `no-store`. Only status 200,
  nonredirected, nonopaque responses with expected MIME/provenance are saved.
- `reauthenticate` performs explicit foreground navigation through Access
  (including `?reauth=1` so U1 does not intercept it). Returning from login
  re-verifies identity before refreshing. The shared account-provider boundary wipes downloads before sign-out, including
  offline logout. The host sign-out callback only clears credentials/navigates;
  it must not wipe a second time. Host-only logout outside that boundary must
  still await `getOfflineRuntime()?.removeDownloads()` before navigating.
- C2 owns the authenticated, destination-validated external-image proxy. U2b
  connects permitted remote images to it through the opt-in runtime setting
  described below. CID images and attachments retain their existing handling;
  remote images are never prefetched.

The retained describe-message queries are the downloaded-message index.
Decoded bodies are rebuilt from Cache Storage on reopen rather than duplicated
in persisted queries.
`/downloads` derives its list from the restored QueryClient; no second descriptor
store exists, and replacing a list page cannot orphan a retained message. Successful snapshots merge by query hash, retaining the last
successful result through transient errors. Only reading operations are admitted;
configuration/settings, mutations, drafts, exports, credentials and query keys containing request headers
or bodies are excluded. Storage format `OFFLINE_FORMAT` is independent of shell
commits; incompatibility requires an explicit remove-downloads action.

Cache Storage and IndexedDB writers share a Web Lock and validate a captured
partition/generation inside it. Wiping durably rotates an identity-verification
epoch (initialized before the first partition), revokes the partition, deletes private caches and IDB records, clears the
query client, and revokes every runtime across tabs and through the
worker. A response that started before a wipe cannot recreate data. The worker
forwards revocations to all windows and captures the partition for each periodic
refresh. Generic shell caches survive.
Revocation also stops tabs still reading their initial identity, and removal does
not manage push subscriptions or notifications; those belong to the later push owner.
Pending commits block U1 updates, and prepared updates reject new storage writes.
A part is available offline only after both its bytes and index entry commit.
Storage failures remain visible; nothing silently evicts old mail.

The downloads status exposes persistent-storage requests, origin usage/quota,
and save failures. Browser/user eviction remains possible. Foreground resume,
reconnect and successful reauthentication verify the session before refresh.
The existing cadence and in-flight guards remain; background sync waits for a
new server round to settle before refetching active reading metadata and visible
bodies. Explicit refresh bypasses content cache reads while retaining good saved
responses when a replacement fails.

A wiped document never binds its old QueryClient to another generation. Confirmed
identity changes wipe first, then invoke the host's foreground navigation. Other
tabs and explicit removal similarly require reopening/foreground navigation to
start downloading again. This document boundary prevents even a late mutation's
optimistic rollback callback from seeding a new tenant's in-memory cache.

The packed Chromium consumer tests close and restart the browser with the same
durable profile, age its snapshot by 90 days, and reopen old mail, referenced
inline image blobs and attachment bytes offline. They exercise both shipped auth
compositions, expired signed-link recovery, real Cache Storage and IndexedDB
failures, a delayed network response across a two-tab wipe, and tenant changes.
Unit tests retain only the pure admission and query-retention selectors.

# Periodic refresh (U4)

Periodic refresh uses the same offline options. Use a same-origin runtime
`apiUrl` and cookie authentication.

After successful foreground verification, an eligible Chromium installation
registers `remit-refresh` with a minimum interval of 24 hours. Chromium decides
when to run it. Registration is silent when the browser lacks periodic sync or
permission is unavailable. Settings → Advanced can turn it off for this
device. Removing downloads unregisters the tag and preserves the opt-out.

Each run verifies the session before reading the newest Inbox page per account.
It adds message descriptors and renderable bodies to Downloads, leaving saved
Inbox queries untouched. Writes share the foreground storage lock and stop on
opt-out or wipe. A refused session unregisters the tag.

The host must return a no-store 200 JSON session response with a nonempty
`partitionKey`, or 401, 403 or a redirect when the session expires. The shared
session request sends `X-Requested-With: XMLHttpRequest` so Cloudflare
Access answers 401 for an expired session. Set
`X-Remit-Partition` on config, thread, describe and content responses. Content
can return 202 while fetching or 403 with `x-remit-403-reason: expired` for an
expired link. Keep `periodic-background-sync` allowed in Permissions-Policy
and `connect-src 'self'` in any CSP on `/sw.js`. Refresh uses the existing
session without an Access bypass, service token or prompt. Hosts bump their
exact pins after the `ui-v*` release.

# In-app installation

Only PWA-enabled builds capture `beforeinstallprompt`. The auth shell keeps the
one-use event until the mail navigation's Install app button is pressed. Safari
instead offers Share → Add to Home Screen on iPhone/iPad (including iPadOS's Mac
user agent), or File → Add to Dock on macOS Safari 17+. Other browsers show no option.
Standalone display mode, iOS's `navigator.standalone`, and `appinstalled` hide it.
Dismissal uses the device-local `remit.installDismissed` key; Settings → Advanced
can clear it. Chromium still needs a fresh browser eligibility event after its
native prompt has been consumed. There is no server preference or worker change.

# External images and logout (U2b)

Cloudflare sets `externalImageProxyUrl: "/api/image-proxy"` in runtime config
(or the preset's `runtimeConfig`). The optional URL must be same-origin and have
no query string or fragment. With no setting, the renderer keeps its existing
direct-image behavior. The host accepts a POST with the complete absolute image
URL in a `text/plain;charset=UTF-8` body, same-origin credentials and manual
redirects. Destination queries stay in the body and in the binary storage key,
never in the proxy request URL.

Only explicit load-once permission or sender trust starts these requests; blocked
senders never do. Permitted image sources, including srcset, posters and CSS URLs,
are replaced with local object URLs after the full response is read. Only complete
200 image responses with matching `X-Remit-Partition` are admitted (SVG is refused,
as in the host contract). The offline runtime stores blobs in the authenticated
partition/generation namespace under `JSON.stringify(["external-image", resolvedRemoteUrl])`;
a reopened message creates fresh object URLs from those bytes. Failed refreshes
retain the previous bytes, and storage failures remain visible.

The shared account-provider boundary awaits `removeDownloads()` exactly once
before invoking the provider's sign-out action, for every shared logout surface.
Authentication recovery calls `reauthenticate` without wiping downloads or
revoking the live session. Hosts must delete their own `removeDownloads()` call from
their account `signOut`: the host logout should only perform its existing
credential/navigation work. This includes offline logout. A host-only logout
outside the shared `Account` boundary still owns its cleanup.
