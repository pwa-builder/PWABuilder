# Google Play Packaging Service

This is PWABuilder's Google Play platform that generates a Google Play-ready app package (an `.aab` file) from a Progressive Web App using Android's Trusted Web Activity technology.

We utilize [Google's Bubblewrap](https://github.com/googlechromelabs/bubblewrap) to generate and sign an Android app package.

This tool generates a zip file containing both an `.apk` file (for testing) and an `.aab` file (for submission to Google Play Store).

The minimum Android SDK defaults to API level 24 (Android 7.0), including for Meta Quest packages, to meet [Google Play automatic protection requirements](https://support.google.com/googleplay/android-developer/answer/10183279). API callers can explicitly supply `minSdkVersion`; values below 24 are not compatible with automatic protection.

This app uses [PWABuilder's Android Build Box](https://github.com/pwa-builder/docker-android-build-box) docker image, which contains the necessary Android SDK Build Tools to execute Bubblewrap.

## Issues

Please use our [main repository for any issues/bugs/features suggestion](https://github.com/pwa-builder/PWABuilder/issues/new/choose).

## Running Locally

Steps:

1. Configure environment files: In apps/pwabuilder-google-play/env/test.env, set the paths for your JDK and AndroidTools.

2. Launch the service: In Visual Studio Code, open the Run and Debug panel, select the “Attach: Google Play Service” configuration, and press F5 to start the Android Package generator API.

3. Visit `localhost` to see the testing interface.

The response will be a zip file containing the generated app.

Alternatively, you can build and run the service using Docker:

```bash
npm run docker:build
npm run docker:run
```

This will start the docker container. Open a browser to localhost:5779 to see the testing interface.

## More info

Once a Google Play app package has been generated, follow the steps on [Next Steps](Next-steps.md).

## Deploy

Deploys are automatically pushed to the cloudapk/staging slot. Each build uses a
unique tag containing the commit SHA, workflow run ID, and run attempt, and staging
is configured with the pushed image's immutable digest rather than `:latest`.
To deploy to production, swap staging and production or deploy the tested digest.
Retain deployed and rollback images in ACR. Existing production slots using
mutable tags must be pinned separately to verified known-good digests.

### Web slot routing to CloudAPK

The web frontend reads `GET /api/packaging/config` before every enqueue, poll, and
download. The backend exposes only `Packaging__AndroidServiceUrl`; responses are
`Cache-Control: no-store`, and the frontend does not cache the selected endpoint.
Missing or unsupported hosted configuration disables Android packaging rather
than silently falling back to production.

On the **pwabuilder web app**, configure these App Service application settings:

| Web slot | `Packaging__AndroidServiceUrl` |
| --- | --- |
| Production | `https://pwabuilder-cloudapk.azurewebsites.net` |
| `preview` (staging) | `https://pwabuilder-cloudapk-staging.azurewebsites.net` |

Mark **`Packaging__AndroidServiceUrl` as a Deployment slot setting** (the site's
`slotConfigNames.appSettingNames` must include it). Preserve all existing sticky
setting names. Azure keeps this value attached to the destination slot during a
swap: the image promoted to production uses production CloudAPK, while preview
continues using staging CloudAPK. Set both values and stickiness before deploying
this code. A build-time Vite variable or a non-sticky setting is not equivalent.
The cloud endpoint setting accepts only the two exact HTTPS origins above.
Local backend Development defaults to `http://localhost:5858`.

After deployment or a swap, inspect `/api/packaging/config` on both web hosts and
confirm the Network tab targets the matching CloudAPK service for enqueue, status,
and download. Existing tabs fetch fresh configuration on their next operation;
jobs from another service are not migrated and may need to be recreated. Tabs
running older frontend code must reload to adopt this runtime configuration.
No deployment or slot swap is performed by changing these settings alone.

### Private package jobs and support diagnostics

`POST /enqueuePackageJob` returns JSON `{ id, supportReference, accessToken }`.
Keep `accessToken` private. `GET /getPackageJob?id=...` and
`GET /downloadPackageZip?id=...` (including HEAD) require
`Authorization: Bearer <accessToken>`. Neither the job ID nor support reference
authorizes access. Missing, wrong, expired, and legacy ID-only credentials are
rejected. All job responses use `Cache-Control: no-store`. Access expires 72 hours
after enqueue, including repeat downloads; progress updates do not renew it.

PWABuilder retains the token in tab-scoped session storage, never in a URL or
public issue. Reloads in the same tab work. A new browser/device or lost storage
requires a new package. Treat same-origin scripts as trusted: an XSS could read
session storage. Do not log Authorization headers or enqueue response bodies.
Other API clients must update to the JSON receipt and bearer-header contract.
The legacy synchronous packaging endpoints still return only the caller's own
newly generated ZIP and are not a way to retrieve an existing job.

Status records contain an explicit safe projection, not `packageOptions`.
Signing inputs are held only in active worker memory and queue messages; Azure
queue messages expire after one hour and workers discard jobs older than 30
minutes. Automatic worker retries remain available within that window.
User-initiated retries restart packaging and require signing inputs again.
Status and owner-verifier records expire within 72 hours. Private Blob lifecycle
deletion must also be configured and verified separately (see rollout below).

Workers write redacted diagnostic projections to Redis under
`package-diagnostics:<supportReference>` for 14 days. Failed references are
indexed in `package-diagnostics:failed` (14 days, at most 500 entries).
Diagnostics include allowlisted configuration, sanitized logs, retry count,
and signing-input presence flags, but not keystores, passwords, owner tokens,
or artifact locations. They are available through the PWABuilder Entra-protected
`/admin` pages; admin authorization is independent of customer tokens.
The web app must be configured to read the same Redis instance/database.
The two services' separate in-memory development stores are not shared.

The admin dashboard pages analyses and packages independently using Previous/Next
controls, with up to 50 failures per page within a fixed 14-day window. Package
history is limited to the latest 500 indexed failures. Summaries show the first
two nonempty lines of sanitized error text (at most 400 characters); full sanitized
details remain on the detail page. Missing errors have an explicit fallback.

Paging uses protected, service-specific continuations with a one-hour lifetime.
Previous-page history stays in browser memory and resets on navigation/sign-out.
Expired or invalid cursors return HTTP 400; Retry restarts the dashboard traversal.
Cosmos may return a short or empty page with more results available; Next remains
available when a continuation exists. Records can change or expire while browsing.
Replicas must share the ASP.NET Data Protection key ring and application identity.
Loss of keys, or a slot swap to a different key ring, invalidates existing cursors;
reload the dashboard. No new key storage is provisioned by this feature.

#### Admin sign-in configuration

Support uses a secretless browser authorization-code flow with PKCE through MSAL.
The public sign-in shell contains no diagnostics; `/api/admin` authorizes every
data request using a signed Entra access token. No client secret or support
authentication cookie is used. The public site continues to work without admin
configuration; both `/admin` and `/api/admin` fail closed until these settings
are supplied:

- `SupportAdmin__TenantId`: the approved Microsoft corporate tenant GUID.
- `SupportAdmin__ClientId`: the single-tenant support app registration's client GUID.

Configure the registration as follows:

1. Register `https://<pwabuilder-host>/admin/signin-oidc` as a **Single-page
   application** redirect URI for each supported host, not as a Web redirect.
   Leave implicit token issuance disabled. The callback is an empty browser shell,
   not a server-side code-exchange endpoint.
2. Expose `api://<client-id>/Support.Read` as an enabled delegated API scope and
   set `api.requestedAccessTokenVersion` to `2`. The SPA and API use the same
   registration; preauthorize this client ID for this one delegated scope.
   No Microsoft Graph permissions are requested.
3. Define the user app role `PWABuilder.SupportReader`, require assignment on the
   enterprise app, and assign that role only to approved support users/groups.
   Scope consent alone never grants support access.
4. Supply the two non-secret deployment settings above. Do not configure
   `SupportAdmin__ClientSecret`; a secret is neither read nor needed.

The API validates signature, issuer, audience, lifetime, tenant, originating
client, object ID, the `Support.Read` delegated scope, and the assigned support
role. ID tokens, Graph tokens, app-only tokens, cookies and URL tokens do not
authorize API access. Email suffixes are not an authorization mechanism.
Role removal takes effect when outstanding access tokens expire; sign-out is
not revocation of a previously issued token.

The isolated admin bundle runs no site analytics or service-worker registration.
MSAL keeps its tokens in tab-scoped session storage and sends API access tokens
only in Authorization headers to same-origin admin endpoints. Treat same-origin
scripts as trusted: XSS can read SPA token storage. Diagnostic data stays in
memory and is cleared on navigation/sign-out. All support responses are no-store,
and admin reads are audited by tenant/object ID.
No admin endpoint provides owner tokens, keystores, passwords, or ZIP downloads.

The web app's existing `AppSettings__AzureRedisHost` and
`AppSettings__AzureManagedIdentityApplicationId` must authorize reading CloudAPK's
sanitized diagnostics keys/index in the same Redis database. Grant the narrowest
available access rather than adding blanket credential/artifact access.
Recent analysis failures use the existing Cosmos analysis store configuration.
Verify real Entra redirects, role-denial cases, Redis connectivity and Cosmos
queries in staging before enabling production support access.

Validate locally with `dotnet test apps/pwabuilder.Tests/PWABuilder.Tests.csproj`,
and in `apps/pwabuilder/Frontend`, `npm run test:admin:unit`,
`npm run test:admin:browser`, and `npm run build`. Browser tests use mocked API/auth
boundaries and never sign in to production. If Playwright's bundled Chromium is
not installed, set `PLAYWRIGHT_CHANNEL=msedge` to use installed Edge.
For actual local sign-in, an approved development SPA callback registration and
a secure/loopback origin are required; production registrations need not expose
localhost callbacks.

#### Incident rollout and legacy cleanup

This release intentionally revokes ID-only access to existing jobs. There is no
safe migration that issues an owner token based only on a previously public ID.
Users must create a new package. Existing diagnostic records are not automatically
imported from legacy secret-bearing records.

1. Coordinate evidence preservation, publisher notifications, and any affected
   signing/upload-key resets with incident response. Do not put secrets in tickets
   or exports. Deletion does not revoke copies of exposed signing keys.
2. Pause packaging and workers; deploy the protected API and compatible frontend
   to every production instance/slot before resuming. Old workers must not run
   alongside the new contract. GitHub Actions only deploys to staging: verify the
   production slot swap and deployed image explicitly.
3. Under an approved, separately executed cleanup, purge legacy
   `googleplaypackagejob:*` records and corresponding package ZIPs. Drain/purge
   legacy queue messages and replace old workers so they cannot recreate sensitive
   records. Scope deletion to CloudAPK data, not the entire shared Redis database
   or storage account. Do not delete current jobs accidentally during rollout.
4. Verify the `google-play-packages` container is private, disable public/direct
   artifact access, and configure/verify Blob lifecycle deletion after three days.
   The application rejects downloads after 72 hours even if a blob still exists.
   Account-level lifecycle execution may lag; it is not the authorization boundary.
5. Cosmos analyses are separate from CloudAPK's credential-bearing jobs. Deleting
   analyses alone does not remediate this incident. Review diagnostic/log retention
   and remove sensitive legacy content under the same incident process.
6. Verify old public references fail for GET and HEAD, a fresh owner can poll and
   download only their own job, and authorized admins can inspect sanitized
   diagnostics without an owner token.

No production purge, Entra registration, role assignment, storage policy change,
or deployment is performed by this code change.

### Android build input security

Packaging options are untrusted, including options loaded from queued jobs. The
HTTP validator checks DNS hosts (also accepting HTTPS prefixes, ports, IDNs, and
legacy path prefixes) and the runtime types of Gradle scalar inputs. The worker
revalidates before project generation and only forwards supported manifest fields
and features to Bubblewrap.

`scripts/patch-bubblewrap-gradle.mjs` patches Bubblewrap 1.25.0's Gradle template
and shortcut URL serializer. Strings are encoded as single-quoted Groovy literals,
not interpolated GStrings; numbers and booleans are type-checked at the template
boundary. The patch checks the dependency version and complete source hashes and
fails closed on unreviewed changes. Remove it only after an upstream release
secures the same sinks and the regression tests pass.

The patch runs during installation, build, and npm start/dev. Docker deliberately
installs with `--ignore-scripts`, then applies it through `npm run build`. Do not
deploy an install made with `--ignore-scripts` without running the build. Run
`npm test` for validation, real-template rendering, patch lifecycle, and isolated
HTTP-route regressions; these do not execute Gradle or contact production.

This code fix does not isolate the build process from the service's identity,
other jobs, or signing material. Following a reported production code execution,
pause packaging and involve incident response: replace affected workers, review
queued jobs and build artifacts, investigate identity/storage access, and rotate
potentially exposed credentials and signing material as appropriate. Deploy the
patched image to every slot/worker before resuming. Separately move builds into
per-job, non-root sandboxes without backend credentials or managed-identity access;
keep signing and artifact publication outside those sandboxes. Running as non-root
alone does not remove managed-identity access.
