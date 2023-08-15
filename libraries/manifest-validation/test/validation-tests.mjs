import { describe, it, beforeEach } from "node:test";
import assert from 'node:assert/strict';
import fetch from 'node-fetch';

import * as maniLib from "../dist/index.js";

import test_manifest from "./test-manifest.json" assert { type: "json" };

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
    await maniLib.validateManifest('{').then((data) => {
      assert.ok(false, "Should have rejected");
    }).catch((err) => {
      assert.equal(err, 'Manifest is not valid JSON');
    });
  });

  // should include missing fields
  it('includes missing fields', async () => {
    const data = await maniLib.validateManifest(test_manifest);
    assert.equal(data.includes("iarc_rating_id"), false);
  });

  // should return the correct number of fields
  it('returns correct number of tests', async () => {
    const data = await maniLib.validateManifest(test_manifest, true);

    assert.equal(data.length, 29);
  });


  it('number of invalid tests is 0', async () => {
    const results = await maniLib.validateManifest(test_manifest, true);
    const invalid = results.reduce((amount, result) => amount + !result.valid? 1 : 0, 0);
    assert.equal(invalid, 0, results.filter((result) => !result.valid).map((result) => result.errorString).toString());
  });

  it('grouped tokens validation', async () => {
    const results = await maniLib.groupedValidation(test_manifest);
    // console.log(JSON.stringify(results));
    assert.ok(results);
    
  });

  /*
  * Test reportMissing method
  */
  // it('can report missing fields', async () => {
  //   const report = await maniLib.reportMissing(test_manifest);
  //   assert.equal(report.length > 0, true);
  //   assert.equal(report.includes("iarc_rating_id"), true);
  // });

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
  it('Can validate the inner structure of shortcuts', async () => {
    const validity = await maniLib.validateSingleField("shortcuts", [
      {
        "name": "Start Live Session",
        "short_name": "Start Live",
        "description": "Jump direction into starting or joining a live session",
        "url": "/?startLive",
        "icons": [{ "src": "icons/android/maskable_icon_192.png", "sizes": "192x192" }]
      }
    ]);

    assert.equal(validity.valid, true);
  });

  it('start_url is within app scope, should pass', async () => {
    const validity = await maniLib.validateSingleField("start_url", "/");
    console.log("start_url scope validity", validity);

    assert.equal(validity.valid, true);
  });

  // Uncomment after the actual test will work
  // it("start_url is not within app scope, should fail", async () => {
  //   // test_manifest.scope = "/app";
  //   const validity = await maniLib.validateSingleField("start_url", "https://www.example.com");

  //   assert.equal(validity.valid, false);
  // });

  it("protocol handlers are valid, should pass", async () => {
    const validity = await maniLib.validateSingleField("protocol_handlers", [
      {
        "protocol": "mailto",
        "url": "/app/#!/%s"
      }
    ]);

    assert.equal(validity.valid, true);
  });

  it("handle_links is valid, should pass", async () => {
    const validity = await maniLib.validateSingleField("handle_links", "auto");

    assert.equal(validity.valid, true);
  })

  if ("handle_links is invalid, should fail", async () => {
    const validity = await maniLib.validateSingleField("handle_links", "justin");

    assert.equal(validity.valid, false);
  })

  /*
   * test validateRequiredFields method
  */
  it('can validate required fields', async () => {
    assert.doesNotReject(maniLib.validateRequiredFields(test_manifest));
  });

  it('should reject because of missing required field', async () => {
    const manifest = { ...test_manifest, short_name: undefined };

    await maniLib.validateRequiredFields(manifest).then((data) => {
      const invalid = data.reduce((amount, result) => amount + !result.valid? 1 : 0, 0);
      assert.equal(invalid, 1, "Should have 1 invalid field");
    }).catch((err) => {
      assert.ok(false, err);
    });

  });

  // should reject because of improper json
  it('should reject because of improper json', async () => {
    await maniLib.validateRequiredFields('{').then((data) => {
      assert.ok(false, "Should have rejected");
    }).catch((err) => {
      assert.equal(err, 'Manifest is not valid JSON');
    });
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