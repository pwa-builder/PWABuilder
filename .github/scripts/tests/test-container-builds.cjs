const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../../..');

test('Windows packager installs the serviced .NET SDK with its published checksum', () => {
  const dockerfile = readFileSync(path.join(root, 'apps/pwabuilder-microsoft-store/Dockerfile'), 'utf8');
  assert.match(dockerfile, /https:\/\/builds\.dotnet\.microsoft\.com\/dotnet\/Sdk\/10\.0\.403\/dotnet-sdk-10\.0\.403-win-x64\.exe/);
  assert.match(dockerfile, /\$expectedHash = 'cca8d82788252a8d13e778150a5e8393e204af274a12d19de7da10a0d98370a4edd5361ce5da73d0db13997fe5191e5db3a69c9665c6ddd6fba0d77845046f3c'/);
  assert.match(dockerfile, /Get-FileHash -Path 'dotnet-sdk-installer\.exe' -Algorithm SHA512/);
  assert.match(dockerfile, /if \(\$actualHash -ne \$expectedHash\) \{ throw/);
});

for (const workflow of [
  'deploy-pwabuilder-to-preview.yml',
  'deploy-msstore-to-preview.yml',
  'deploy-google-play-to-preview.yml',
]) {
  test(`${workflow} refreshes base images and rebuilds package layers`, () => {
    const contents = readFileSync(path.join(root, '.github/workflows', workflow), 'utf8');
    const build = contents.match(/^\s*run: (docker build .+)$/m);
    assert.ok(build, 'Expected a Docker build command');
    assert.match(build[1], /(?:^|\s)--pull(?:\s|$)/);
    assert.match(build[1], /(?:^|\s)--no-cache(?:\s|$)/);
  });
}
