import assert from "node:assert/strict";
import { test } from "node:test";
import { canAccessPackageJob, createPackageJobAccess } from "../utils/package-job-access.js";
import { getPackageJobDiagnostics, getPackageJobStatus } from "../utils/package-job-diagnostics.js";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { validOptions } from "./fixtures/android-package-options.js";

test("package access requires the unexpired job-specific token, not an ID or support reference", () => {
    const owner = createPackageJobAccess();
    const other = createPackageJobAccess();
    assert.equal(canAccessPackageJob(`Bearer ${owner.accessToken}`, owner.access), true);
    assert.equal(canAccessPackageJob(`Bearer ${other.accessToken}`, owner.access), false);
    assert.equal(canAccessPackageJob(undefined, owner.access), false);
    assert.equal(canAccessPackageJob(`Bearer ${owner.accessToken}`, null), false);
    assert.equal(canAccessPackageJob(`Bearer ${owner.accessToken}`, { ...owner.access, expiresAt: Date.now() - 1 }), false);
    assert.equal(canAccessPackageJob(`Bearer ${owner.accessToken}`, { ...owner.access, tokenHash: "bad" }), false);
    assert.equal(canAccessPackageJob("Bearer job-id", owner.access), false);
    assert.ok(!JSON.stringify(owner.access).includes(owner.accessToken));
});

test("status and admin diagnostics explicitly project configuration and redact secrets before storage", () => {
    const job: GooglePlayPackageJob = {
        id: "googleplaypackagejob:example.com:job",
        supportReference: "d3b138af-7e9b-44b3-95c0-fd78838c09df",
        status: "Failed",
        pwaUrl: "https://user:password@example.com/private?token=private#fragment",
        analysisId: null,
        createdAt: new Date().toISOString(),
        retryCount: 2,
        packageOptions: {
            ...validOptions(),
            signing: {
                file: "data:application/octet-stream;base64,c2VjcmV0",
                countryCode: "US",
                alias: "private-alias", keyPassword: 'secret"key', storePassword: "secret-store"
            }
        },
        uploadedBlobFileName: "private-blob-name",
        logs: ['Error: secret"key secret-store private-alias c2VjcmV0 https://user:password@example.com/private?token=private', 'secret\\"key'],
        errors: ["data:application/octet-stream;base64,c2VjcmV0"]
    };
    const status = getPackageJobStatus(job);
    const diagnostic = getPackageJobDiagnostics(job);
    for (const projection of [status, diagnostic]) {
        const text = JSON.stringify(projection);
        for (const secret of ["secret", "private-alias", "c2VjcmV0", "token=", "password", "private-blob-name"]) {
            assert.ok(!text.includes(secret), secret);
        }
        assert.ok(!("packageOptions" in projection));
        assert.ok(!("signing" in projection));
    }
    assert.equal(diagnostic.configuration.hasUploadedKey, true);
    assert.equal(diagnostic.configuration.hasKeyPassword, true);
    assert.equal(diagnostic.siteOrigin, "https://example.com");
});
