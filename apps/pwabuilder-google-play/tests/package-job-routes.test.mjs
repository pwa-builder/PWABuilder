import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { app, effects, PackageJobProcessor } from "./fixtures/isolated-app.mjs";
import { validOptions } from "./fixtures/android-package-options.js";
import { PackageJobLogger } from "../models/packageJobLogger.js";

test("enqueue, status and download separate owner credentials from public support references", async () => {
    const server = createServer(app);
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
        const enqueue = await fetch(`${origin}/enqueuePackageJob`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...validOptions(), signingMode: "new", signing: {
                alias: "private-alias", keyPassword: "private-key-password", storePassword: "private-store-password",
                fullName: "Example Publisher", organization: "Example", organizationalUnit: "Engineering", countryCode: "US"
            } })
        });

        assert.equal(enqueue.status, 200);
        assert.equal(enqueue.headers.get("cache-control"), "no-store");
        const receipt = await enqueue.json();
        assert.ok(receipt.accessToken);
        const stored = effects.stored.get(receipt.id);
        assert.ok(!("packageOptions" in stored));
        const allPersisted = JSON.stringify([...effects.stored]);
        for (const secret of ["private-key-password", "private-store-password", "private-alias", receipt.accessToken]) {
            assert.ok(!allPersisted.includes(secret));
        }
        assert.equal(effects.expirations.get(`package-owner:${receipt.id}`), 72 * 60 * 60);
        assert.equal(effects.expirations.get(`package-diagnostics:${receipt.supportReference}`), 14 * 86400);

        const jobUrl = `${origin}/getPackageJob?id=${encodeURIComponent(receipt.id)}`;
        for (const token of [null, "another-user", receipt.supportReference]) {
            const response = await fetch(jobUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            assert.equal(response.status, 403);
            assert.equal(response.headers.get("cache-control"), "no-store");
        }
        const auth = { Authorization: `Bearer ${receipt.accessToken}` };
        const status = await fetch(jobUrl, { headers: auth });
        assert.equal(status.status, 200);
        const publicJob = await status.json();
        assert.equal(publicJob.supportReference, receipt.supportReference);
        assert.ok(!("packageOptions" in publicJob));
        assert.ok(!("uploadedBlobFileName" in publicJob));
        assert.ok(!("accessToken" in publicJob));

        stored.status = "Completed";
        stored.uploadedBlobFileName = "test.zip";
        stored.downloadAvailable = true;
        const zipUrl = `${origin}/downloadPackageZip?id=${encodeURIComponent(receipt.id)}`;
        assert.equal((await fetch(zipUrl)).status, 403);
        assert.equal((await fetch(zipUrl, { method: "HEAD" })).status, 403);
        assert.equal(effects.downloads, 0);
        const download = await fetch(zipUrl, { headers: auth });
        assert.equal(download.status, 200);
        assert.equal(await download.text(), "test zip");
        assert.equal(download.headers.get("cache-control"), "no-store");
        assert.equal(effects.downloads, 1);
        effects.stored.get(`package-owner:${receipt.id}`).expiresAt = Date.now() - 1;
        assert.equal((await fetch(zipUrl, { headers: auth })).status, 403);

        effects.stored.set("googleplaypackagejob:legacy:123", { packageOptions: { signing: { keyPassword: "legacy-secret" } } });
        const legacy = await fetch(`${origin}/getPackageJob?id=googleplaypackagejob:legacy:123`, { headers: auth });
        assert.equal(legacy.status, 403);
        assert.ok(!(await legacy.text()).includes("legacy-secret"));
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});

test("worker completion and terminal failure never persist signing inputs", async () => {
    const processor = new PackageJobProcessor();
    for (const terminal of ["Completed", "Failed"]) {
        const job = {
            id: `googleplaypackagejob:example.com:${terminal}`,
            supportReference: terminal === "Completed" ? "dc217d3b-0855-46d5-84a8-582391213fa3" : "c9eccd6b-7a72-46c9-94ab-2cd76a6bde2f",
            pwaUrl: "https://example.com", analysisId: null, status: "InProgress",
            createdAt: new Date().toISOString(), retryCount: 2,
            packageOptions: { ...validOptions(), signing: {
                countryCode: "US", file: "data:application/octet-stream;base64,cHJpdmF0ZQ==",
                keyPassword: "private-key-password", storePassword: "private-store-password", alias: "private-alias"
            } },
            uploadedBlobFileName: null, logs: [], errors: []
        };
        const logger = new PackageJobLogger(job);
        if (terminal === "Completed") {
            await processor.jobCompleted(job, "dummy.zip", logger);
        } else {
            await processor.retryJobOrMarkAsFailed(job, "private-key-password", logger);
        }
        const stored = effects.stored.get(job.id);
        const diagnostic = effects.stored.get(`package-diagnostics:${job.supportReference}`);
        assert.equal(stored.status, terminal);
        assert.equal(diagnostic.status, terminal);
        assert.ok(!("packageOptions" in stored));
        for (const secret of ["private-key-password", "private-store-password", "private-alias", "cHJpdmF0ZQ=="]) {
            assert.ok(!JSON.stringify([stored, diagnostic]).includes(secret));
        }
        assert.ok(!JSON.stringify(diagnostic).includes("private-artifact.zip"));
        assert.ok(effects.expirations.get(job.id) <= 72 * 60 * 60);
        assert.ok(effects.expirations.get(job.id) > 72 * 60 * 60 - 5);

        job.createdAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        await processor.jobProgressed({ level: "info", message: "Saving existing job status" }, job, logger);
        assert.ok(effects.expirations.get(job.id) <= 24 * 60 * 60);
        assert.ok(effects.expirations.get(job.id) > 24 * 60 * 60 - 5);
    }
});
