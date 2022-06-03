const test = require('node:test');
const assert = require('node:assert').strict;

const maniLib = require('../dist/index');

const test_manifest = JSON.stringify({
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
      "icons": [{ "src": "icons/android/maskable_icon_192.png", "sizes": "192x192" }]
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
});

/*
  * Test validateManifest method
*/
test('can validate whole manifest', async (t) => {
  assert.doesNotReject(maniLib.validateManifest(test_manifest));
});

test('Should reject because of improper JSON', async (t) => {
  assert.rejects(maniLib.validateManifest('{'));
});


/*
  * Test validateSingleField method
*/
test('can validate a single field, should return true', async (t) => {
  const validity = await maniLib.validateSingleField("short_name", "Webboard");

  // validity should be a boolean, and true in this case
  assert.strictEqual(validity, true);
});

test('can validate a single field, should return false', async (t) => {
  const validity = await maniLib.validateSingleField("theme_color", "black");

  // validity should be a boolean, and false in this case
  assert.strictEqual(validity, false);
});

/*
 * test validateRequiredFields method
*/
