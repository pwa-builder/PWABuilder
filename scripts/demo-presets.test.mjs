import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const nimbusUrl = "https://pwa-builder.github.io/nimbus/";
const manifestUrl = `${nimbusUrl}manifest.json`;
const iconUrl = `${nimbusUrl}assets/icons/icon_512.png`;

function loadDemo(relativePath) {
    const elements = new Map();
    const requests = [];
    const document = {
        querySelector(selector) {
            if (!elements.has(selector)) {
                elements.set(selector, {
                    value: "",
                    textContent: "",
                    handlers: {},
                    classList: { add() {}, remove() {} },
                    addEventListener(event, handler) { this.handlers[event] = handler; }
                });
            }
            return elements.get(selector);
        }
    };
    runInNewContext(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
        document,
        Headers,
        fetch: async (url, options) => {
            requests.push({ url, ...options });
            // Stop at the HTTP boundary: these checks must not enqueue real packages.
            return { ok: false, status: 503, statusText: "Test boundary", text: async () => "Test boundary" };
        }
    });
    return {
        options: () => JSON.parse(elements.get("textarea").value),
        click: selector => elements.get(selector).handlers.click(),
        requests
    };
}

for (const [button, signingMode] of [
    ["#unsignedBtn", "none"],
    ["#signedBtn", "new"],
    ["#existingKeyBtn", "mine"]
]) {
    test(`CloudAPK ${button} packages Nimbus with its scoped assets and shortcuts`, async () => {
        const demo = loadDemo("../apps/pwabuilder-google-play/static/index.js");
        assert.equal(demo.options().name, "Nimbus");
        demo.click(button);
        const options = demo.options();
        assert.equal(options.name, "Nimbus");
        assert.equal(options.launcherName, "Nimbus");
        assert.equal(options.packageId, "io.github.pwa_builder.nimbus");
        assert.equal(options.pwaUrl, nimbusUrl);
        assert.equal(new URL(options.startUrl, options.host).href, nimbusUrl);
        assert.equal(options.webManifestUrl, manifestUrl);
        assert.equal(options.iconUrl, iconUrl);
        assert.equal(options.maskableIconUrl, `${nimbusUrl}assets/icons/maskable_512.png`);
        assert.equal(options.backgroundColor, "#0d1117");
        assert.equal(options.themeColor, "#2563eb");
        assert.equal(options.signingMode, signingMode);
        if (signingMode === "mine") {
            assert.ok(options.signing.file.startsWith("data:application/octet-stream;base64,"));
        } else {
            assert.equal(options.signing.file, null);
        }
        assert.deepEqual(options.shortcuts.map(shortcut => new URL(shortcut.url, manifestUrl).href), [
            `${nimbusUrl}?new=1`, `${nimbusUrl}?new=sketch`, `${nimbusUrl}?new=photo`
        ]);
        for (const shortcut of options.shortcuts) {
            assert.equal(new URL(shortcut.icons[0].src, manifestUrl).href, `${nimbusUrl}assets/icons/icon_192.png`);
        }
        assert.doesNotMatch(JSON.stringify(options), /webboard|startLive/i);
        await demo.click("#submitBtn");
        assert.equal(demo.requests[0].url, "/enqueuePackageJob");
        assert.equal(demo.requests[0].method, "POST");
        assert.deepEqual(JSON.parse(demo.requests[0].body), options);
    });
}

for (const button of ["#simpleBtn", "#publisherBtn", "#imagesBtn", "#edgeHtmlBtn", "#kitchenSinkBtn"]) {
    test(`Windows ${button} packages Nimbus and preserves its packaging mode`, async () => {
        const demo = loadDemo("../apps/pwabuilder-microsoft-store/wwwroot/index.js");
        assert.equal(demo.options().name, "Nimbus");
        demo.click(button);
        const options = demo.options();
        assert.equal(options.name, "Nimbus");
        assert.equal(options.packageId, "PWABuilder.Nimbus");
        assert.equal(options.url, nimbusUrl);
        assert.doesNotMatch(JSON.stringify(options), /webboard|startLive/i);
        if (options.publisher) {
            assert.equal(options.publisher.displayName, "Nimbus, Inc.");
        }
        if (options.images) {
            assert.equal(options.images.baseImage, iconUrl);
        }
        if (options.edgeHtmlPackage) {
            assert.equal(options.edgeHtmlPackage.url, `${nimbusUrl}?v=legacy-edgehtml`);
            assert.deepEqual(options.edgeHtmlPackage.urlsWithWindowsRuntimeAccess, [`${nimbusUrl}*`]);
        }
        if (button === "#edgeHtmlBtn") {
            assert.equal(options.generateModernPackage, false);
            assert.equal(options.classicPackage, undefined);
            assert.equal(options.allowSigning, undefined);
        } else {
            assert.equal(options.classicPackage.generate, true);
            assert.equal(options.allowSigning, button !== "#kitchenSinkBtn");
        }
        if (button === "#kitchenSinkBtn") {
            assert.equal(options.classicPackage.url, `${nimbusUrl}?v=classic`);
            assert.equal(options.manifestUrl, manifestUrl);
            assert.equal(options.startUrl, nimbusUrl);
            assert.equal(options.manifest.name, "Nimbus");
            assert.equal(new URL(options.manifest.start_url, manifestUrl).href, nimbusUrl);
            assert.equal(new URL(options.manifest.scope, manifestUrl).href, nimbusUrl);
            assert.equal(options.manifest.theme_color, "#2563eb");
            assert.equal(options.manifest.background_color, "#0d1117");
            for (const icon of options.manifest.icons) {
                assert.ok(new URL(icon.src, manifestUrl).href.startsWith(`${nimbusUrl}assets/icons/`));
            }
            assert.deepEqual(options.manifest.shortcuts.map(shortcut => new URL(shortcut.url, manifestUrl).href), [
                `${nimbusUrl}?new=1`, `${nimbusUrl}?new=sketch`, `${nimbusUrl}?new=photo`
            ]);
        }
        await demo.click("#submitBtn");
        assert.equal(demo.requests[0].url, "/msix/generatezip");
        assert.equal(demo.requests[0].method, "POST");
        assert.deepEqual(JSON.parse(demo.requests[0].body), options);
    });
}

test("Windows widgets preset retains its separate widget-enabled sample", () => {
    const demo = loadDemo("../apps/pwabuilder-microsoft-store/wwwroot/index.js");
    demo.click("#widgetsBtn");
    const options = demo.options();
    assert.equal(options.name, "Sample.Widgets");
    assert.equal(options.url, "https://gray-meadow-079c0131e.2.azurestaticapps.net/");
    assert.equal(options.enableWebAppWidgets, true);
});
