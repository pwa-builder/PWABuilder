import assert from "node:assert/strict";
import { test } from "node:test";
import { format } from "node:util";

// Exercise the real methods without constructing a production Redis connection.
process.env.NODE_ENV = "development";
const { RedisService, redisService } = await import("../services/redisService.js");

test("delivery logs retain only the last hundred concurrent events and expire after fourteen days", async context => {
    context.mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-16T00:00:00Z") });
    const reference = "1b7facaa-d5b5-48ef-b4cf-841ebc2e872e";
    await Promise.all(Array.from({ length: 105 }, (_, index) =>
        redisService.appendPackageDiagnostic(reference, `event-${index}`)));
    const key = `package-delivery:${reference}`;
    const logs = await redisService.getJson(key);
    assert.equal(logs.length, 100);
    assert.equal(logs[0], "event-5");
    assert.equal(logs[99], "event-104");
    context.mock.timers.tick(14 * 86400 * 1000);
    assert.equal(await redisService.getJson(key), null);
});

test("Redis errors keep caller-controlled keys out of the format string", async context => {
    context.mock.timers.enable({ apis: ["setTimeout"] });
    const log = context.mock.method(console, "error", () => {});
    const failure = new Error("Synthetic Redis failure");
    const key = "googleplaypackagejob:example.com:%s-%j-%o";
    const service = Object.create(RedisService.prototype);
    service.redis = {
        isReady: true,
        get: async () => { throw failure; },
        set: async () => { throw failure; },
        lPop: async () => { throw failure; }
    };

    for (const operation of [
        () => service.getJson(key),
        () => service.save(key, {}),
        () => service.dequeue(key)
    ]) {
        const previousCalls = log.mock.callCount();
        await assert.rejects(operation(), error => error === failure);
        const args = log.mock.calls[previousCalls].arguments;
        assert.ok(!args[0].includes(key));
        assert.equal(args[1], key);
        assert.equal(args[2], failure);
        assert.ok(format(...args).includes(key));
    }
});
