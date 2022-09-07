import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";

import { generateManifest } from "../../services/manifest/manifest-service";
import { generateServiceWorker } from "../../services/service-workers/simple-service-worker";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });

  test("Can Generate Web Manifest", (done) => {

    generateManifest(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000)
    })
  });

  test("Can Generate Service Worker", (done) => {

    // generateServiceWorker(true).then(done)
    generateServiceWorker(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000)
    })
  });
});
