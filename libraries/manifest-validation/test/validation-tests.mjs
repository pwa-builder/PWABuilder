import { describe, it, beforeEach } from "node:test";
import assert from 'node:assert/strict';
import fetch from 'node-fetch';

import * as maniLib from "../dist/index.js";

const test_manifest = {
  "dir": "ltr",
  "lang": "en",
  "name": "Webboard",
  "scope": "/",
  "display": "standalone",
  "start_url": "/",
  "short_name": "Webboard",
  "theme_color": "#FFFFFF",
  "description": "Enhance your work day and solve your cross platform whiteboarding needs with webboard! Draw text, shapes, attach images and more and share those whiteboards with anyone through OneDrive!",
  "orientation": "any",
  "background_color": "#FFFFFF",
  "related_applications": [],
  "prefer_related_applications": false,
  "screenshots": [
    {
      "src": "assets/screen.png"
    },
    {
      "src": "assets/screen.png"
    },
    {
      "src": "assets/screen.png"
    }
  ],
  "features": [
    "Cross Platform",
    "low-latency inking",
    "fast",
    "useful AI"
  ],
  "shortcuts": [
    {
      "name": "Start Live Session",
      "short_name": "Start Live",
      "description": "Jump direction into starting or joining a live session",
      "url": "/?startLive",
      "icons": [
        {
          "src": "icons/android/maskable_icon_192.png",
          "sizes": "192x192"
        },
        {
          "src": "icons/android/maskable_icon_96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "icons": [
    {
      "src": "icons/android/android-launchericon-64-64.png",
      "sizes": "64x64"
    },
    {
      "src": "icons/android/maskable_icon_192.png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "icons/android/android-launchericon-48-48.png",
      "sizes": "48x48"
    },
    {
      "src": "icons/android/android-launchericon-512-512.png",
      "sizes": "512x512"
    },
    {
      "src": "icons/android/android-launchericon-28-28.png",
      "sizes": "28x28"
    }
  ]
};

let realWorldManifest = undefined;
let realWorldURLs = [
  "https://webboard.app/manifest.json",
]

describe('Manifest Validation with hardcoded test manifest', async () => {
  /*
  * Test validateManifest method
*/
  it('can validate whole manifest', async () => {
    assert.doesNotReject(maniLib.validateManifest(test_manifest));
  });

  it('Should reject because of improper JSON', async () => {
    assert.rejects(maniLib.validateManifest('{'));
  });

  // should include missing fields
  it('includes missing fields', async () => {
    const data = await maniLib.validateManifest(test_manifest);
    assert.equal(data.includes("iarc_rating_id"), false);
  });

  // should return the correct number of fields
  it('returns correct number of tests', async () => {
    const data = await maniLib.validateManifest(test_manifest);

    assert.equal(data.length, 24);
  });

  /*
  * Test reportMissing method
  */
  it('can report missing fields', async () => {
    const report = await maniLib.reportMissing(test_manifest);
    assert.equal(report.length > 0, true);
    assert.equal(report.includes("iarc_rating_id"), true);
  });

  /*
    * Test validateSingleField method
  */
  it('can validate a single field, should return true', async () => {
    const validity = await maniLib.validateSingleField("short_name", "Webboard");

    // validity should be a boolean, and true in this case
    assert.strictEqual(validity.valid, true);
  });

  it('can validate a single field, should return false', async () => {
    const validity = await maniLib.validateSingleField("theme_color", "black");

    assert.equal(validity.valid, false);
    assert.equal(validity.errors[0], 'theme_color should be a valid hex color');
    assert.equal(1, validity.errors.length);
  });

  /*
    * inner validation testing
  */

  it('Can validate the inner structure of shortcuts', async () => {
    const validity = await maniLib.validateSingleField("shortcuts", test_manifest.shortcuts);

    assert.equal(validity.valid, true);
  });

  // should fail because of missing 96x96 icon
  it('Can validate the inner structure of shortcuts, should fail', async () => {
    const validity = await maniLib.validateSingleField("shortcuts", [
      {
        "name": "Start Live Session",
        "short_name": "Start Live",
        "description": "Jump direction into starting or joining a live session",
        "url": "/?startLive",
        "icons": [{ "src": "icons/android/maskable_icon_192.png", "sizes": "192x192" }]
      }
    ]);

    assert.equal(validity.valid, false);
  });

  it('start_url is within app scope, should pass', async () => {
    const validity = await maniLib.validateSingleField("start_url", "/");
    console.log("start_url scope validity", validity);

    assert.equal(validity.valid, true);
  });

  it("start_url is not within app scope, should fail", async () => {
    // test_manifest.scope = "/app";
    const validity = await maniLib.validateSingleField("start_url", "https://www.example.com");

    assert.equal(validity.valid, false);
  });

  it("protocol handlers are valid, should pass", async () => {
    const validity = await maniLib.validateSingleField("protocol_handlers", [
      {
        "protocol": "mailto",
        "url": "/app/#!/%s"
      }
    ]);

    assert.equal(validity.valid, true);
  });

  /*
   * test validateRequiredFields method
  */
  it('can validate required fields', async () => {
    assert.doesNotReject(maniLib.validateRequiredFields(test_manifest));
  });

  it('should reject because of missing required field', async () => {
    const manifest = test_manifest;
    delete manifest.short_name;
    const newMani = manifest;

    assert.rejects(maniLib.validateRequiredFields(newMani));
  });

  // should reject because of improper json
  it('should reject because of improper json', async () => {
    assert.rejects(maniLib.validateRequiredFields('{'));
  });


});

realWorldURLs.forEach(url => {
  describe('Manifest Validation with real world manifest', async () => {
    beforeEach(async () => {
      // fetch manifest from https://webboard.app/manifest.json with node
      const response = await fetch(url);
      realWorldManifest = await response.json();
    });

    it('can validate whole manifest with real world manifest', async () => {
      assert.doesNotReject(maniLib.validateManifest(realWorldManifest));
    });

    // should include missing fields
    it('includes missing fields', async () => {
      const data = await maniLib.validateManifest(test_manifest);
      assert.equal(data.includes("iarc_rating_id"), false);
    });

    /*
      * Test validateSingleField method
    */
    it('can validate a single field, should return true', async () => {
      const validity = await maniLib.validateSingleField("short_name", "Webboard");

      // validity should be a boolean, and true in this case
      assert.strictEqual(validity.valid, true);
    });

    it('can validate a single field, should return false', async () => {
      const validity = await maniLib.validateSingleField("theme_color", "black");

      assert.equal(validity.valid, false);
      assert.equal(validity.errors[0], 'theme_color should be a valid hex color');
      assert.equal(1, validity.errors.length);
    });

  });
});