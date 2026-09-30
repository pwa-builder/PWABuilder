import assert from "node:assert/strict";
import { test } from "node:test";
import { getPackageAuthorization, packageSupportIssueBody, savePackageReceipt } from "../src/script/utils/package-job-access.ts";

test("owner credentials stay in tab storage, separate from support references", () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const receipt = {
        id: "googleplaypackagejob:example.com:internal-job",
        supportReference: "d3b138af-7e9b-44b3-95c0-fd78838c09df",
        accessToken: "a".repeat(43)
    };
    assert.equal(savePackageReceipt(receipt, storage), receipt.id);
    assert.equal(getPackageAuthorization(receipt.id, storage), `Bearer ${receipt.accessToken}`);
    assert.throws(() => getPackageAuthorization("another-job", storage), /browser tab/);
    assert.throws(() => savePackageReceipt(receipt.id, storage), /invalid job receipt/);
    const body = packageSupportIssueBody(receipt.supportReference);
    assert.ok(body.includes(`/admin/package-jobs/${receipt.supportReference}`));
    assert.ok(!body.includes(receipt.id));
    assert.ok(!body.includes(receipt.accessToken));
    assert.ok(!body.includes("jobId="));
    assert.ok(!body.includes("google-play-packaging-status"));
    assert.ok(!packageSupportIssueBody("unsafe](https://attacker.test)").includes("https://attacker.test"));
});
