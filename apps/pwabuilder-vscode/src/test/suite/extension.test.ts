import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { generateIcons, generateScreenshots } from "../../services/manifest/assets-service";

import { generateManifest } from "../../services/manifest/manifest-service";
import { generateServiceWorker } from "../../services/service-workers/simple-service-worker";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Can Generate Web Manifest", (done) => {
    generateManifest(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000);
    })
  });

  test("Can Generate Service Worker", (done) => {
    generateServiceWorker(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000);
    })
  });

  test("Can Generate Icons", (done) => {
    generateIcons(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000);
    })
  });

  test("Can Generate Screenshots", (done) => {
    generateScreenshots(true).then(() => {
      setTimeout(() => {
        done();
      }, 2000)
    })
  })
});
