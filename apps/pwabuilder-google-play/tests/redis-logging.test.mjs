import assert from "node:assert/strict";
import { test } from "node:test";
import { format } from "node:util";

// Exercise the real methods without constructing a production Redis connection.
process.env.NODE_ENV = "development";
const { RedisService } = await import("../services/redisService.js");

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
