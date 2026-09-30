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

Deploys are automatically pushed to cloudapk/staging slot. To deploy to production, swap staging and production.

### Private package jobs and support diagnostics

`POST /enqueuePackageJob` returns JSON `{ id, supportReference, accessToken }`.
Keep `accessToken` private. `GET /getPackageJob?id=...` and
`GET /downloadPackageZip?id=...` (including HEAD) require
`Authorization: Bearer <accessToken>`. Neither the job ID nor support reference
authorizes access. Missing, wrong, expired, and legacy ID-only credentials are
rejected. All job responses use `Cache-Control: no-store`. Access expires 24 hours
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
Status and owner-verifier records expire within 24 hours. Private Blob lifecycle
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

#### Admin sign-in configuration

The public site continues to work without admin configuration; `/admin` fails
closed until all three deployment settings are supplied:

- `SupportAdmin__TenantId`: the approved Microsoft corporate tenant GUID.
- `SupportAdmin__ClientId`: a single-tenant web app registration's client GUID.
- `SupportAdmin__ClientSecret`: supplied through a secret store/environment, never
  checked into source control.

Register the exact HTTPS redirect URI
`https://<pwabuilder-host>/admin/signin-oidc`. Define and assign the Entra app role
`PWABuilder.SupportReader` to the approved support group/users. Authentication
validates the issuer and tenant and requires this role, not an email suffix.
Admin sessions use a Secure, HttpOnly cookie with a fixed 30-minute lifetime;
changes to role assignments may take until the session expires to take effect.
Admin reads are audited by tenant/object ID and return no-store responses.
No admin endpoint provides owner tokens, keystores, passwords, or ZIP downloads.

The web app's existing `AppSettings__AzureRedisHost` and
`AppSettings__AzureManagedIdentityApplicationId` must authorize reading CloudAPK's
sanitized diagnostics keys/index in the same Redis database. Grant the narrowest
available access rather than adding blanket credential/artifact access.
Recent analysis failures use the existing Cosmos analysis store configuration.
Verify real Entra redirects, role-denial cases, Redis connectivity and Cosmos
queries in staging before enabling production support access.

The current admin implementation requires a client secret. A tenant policy that
blocks password credentials prevents this configuration from being completed;
creating the app registration and assigning its role alone does not enable sign-in.
Do not weaken tenant policy to deploy this feature. Use an organization-approved
authentication design and update the implementation before enabling admin access.
Customer job protections can be deployed while `/admin` remains disabled.

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
   artifact access, and configure/verify Blob lifecycle deletion after one day.
   The application rejects downloads after 24 hours even if a blob still exists.
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
