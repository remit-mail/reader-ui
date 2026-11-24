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

Enable `mountApp({ authProvider, offline: { verifySession, reauthenticate } })`
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
  JSON `{ "partitionKey": "<opaque account-config ID>" }`. `verifySession` must
  make a fresh same-origin fetch with `cache: "no-store"`, `credentials:
  "same-origin"`, `redirect: "manual"` and a bounded timeout. Validate a 200 JSON
  response before returning that object; return `null` for 401, 403 or an opaque
  redirect, and reject transport/server failures. Never derive identity from
  persisted config, a URL, a user-editable email, or a login HTML response.
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
worker. A response that started before a wipe cannot recreate data. The worker forwards revocations to all windows and has no global current tenant.
U4 background writers capture the verified partition and use this same durable
lock/generation/epoch admission before every private commit. Generic shell caches survive.
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
responses when a replacement fails. Periodic synchronization is the optional U4 contract below; push remains separate.

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

# Optional periodic downloads (U4 / C4)

C4 opts in with `mountApp({ authProvider, offline: { verifySession,
reauthenticate, periodicRefresh: { sessionEndpoint: "/api/session" } } })`
and `webClientPreset({ pwa: { enabled: true }, ... })`. Omit `periodicRefresh`
to leave background refresh disabled; the next foreground mount removes any earlier
registration and worker configuration. The API base comes from runtime `apiUrl`;
both it and `sessionEndpoint` must be same-origin. No Access-specific policy,
IdP flow or service token lives in the shared client.

The session endpoint is authenticated `GET`, `Cache-Control: no-store`, and
returns status 200 JSON `{ "partitionKey": "<server-derived opaque ID>" }`.
The worker sends same-origin cookies, disables HTTP caching, follows no redirects,
and bounds this check to five seconds within a thirty-second run. Redirects,
opaque redirects, 401 and 403 set durable `needsLogin`, unregister the tag and
stop. `getOfflineRuntime()?.state.needsLogin` exposes this on next startup;
foreground identity verification clears it and re-enables eligible registration.
C4 keeps the existing explicit foreground `reauthenticate` navigation.

Only installed standalone browsers with `periodicSync` on
`ServiceWorkerRegistration.prototype` and granted `periodic-background-sync`
permission register `remit-refresh-downloads`, requesting `minInterval: 86400000`.
This is a daily minimum request, never a delivery schedule. Unsupported browsers,
uninstalled tabs, denied permissions and registration failures produce no output,
reporter events or user notices. Logout, tenant change and remove-downloads revoke
writers, erase staging and unregister. A successful foreground session is required
to bind the worker configuration to the verified partition/generation.

The worker reads `/config` for accounts (without persisting config), each account's
mailboxes, one newest INBOX thread page per account, and descriptions plus the
selected HTML/plain body for at most twenty previously unknown messages in total.
Every request is a sequential GET; there are no server sync writes, attachment,
inline-image or remote-image downloads. All response bytes, including metadata,
share a 10 MiB budget and all work shares a thirty-second deadline. API responses
need `X-Remit-Partition`; body responses use U2's exact MIME/provenance admission.
Complete bodies enter the existing content cache and part index. Completed query
results enter `periodic:batch:<generation>` in the existing IndexedDB data store,
separately from `queries:<generation>`. Foreground hydration merges by query hash
and timestamp before mounting queries, then removes the staging batch. Partition
mismatches discard staging; every commit rechecks the durable wipe epoch.

Transport failures retain previous downloads. Other failures record one warning
through the existing recent-errors/telemetry reporter on the next foreground
startup, without a user banner. Failed runs back off across browser events, starting
at one day and doubling; after ten failed attempts the tag is removed. There are
no retries inside an event and no custom wake timers. Foreground verification
resets failure state. C4 must keep the session endpoint and existing protected API
and content provenance contract available; no new server writes are required.
