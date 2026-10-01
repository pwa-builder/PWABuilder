import { readFile, writeFile } from 'node:fs/promises';

// Bubblewrap 1.25.0 depends on Jimp 0.22, which imports the vulnerable
// file-type 16 CommonJS API. We override file-type with the patched ESM-only
// release and adapt Jimp's installed wrappers to its named export.
//
// Remove this script, the prebuild hook, and the file-type override once
// @bubblewrap/core upgrades to Jimp 1.x (or otherwise supports file-type 21+).
const patches = [
  {
    path: 'node_modules/@jimp/core/dist/utils/image-bitmap.js',
    replacements: [
      [
        'var _fileType = _interopRequireDefault(require("file-type"));',
        '// file-type is loaded dynamically because current releases are ESM-only.',
      ],
      [
        'const fileTypeFromBuffer = await _fileType.default.fromBuffer(buffer);',
        'const fileTypeFromBuffer = await (await import("file-type")).fileTypeFromBuffer(buffer);',
      ],
    ],
  },
  {
    path: 'node_modules/@jimp/core/es/utils/image-bitmap.js',
    replacements: [
      ['import FileType from "file-type";', 'import { fileTypeFromBuffer } from "file-type";'],
      [
        'const fileTypeFromBuffer = await FileType.fromBuffer(buffer);',
        'const fileType = await fileTypeFromBuffer(buffer);',
      ],
      ['if (fileTypeFromBuffer) {', 'if (fileType) {'],
      ['return fileTypeFromBuffer.mime;', 'return fileType.mime;'],
    ],
  },
];

for (const patch of patches) {
  let source = await readFile(patch.path, 'utf8');

  for (const [before, after] of patch.replacements) {
    if (source.includes(before)) {
      source = source.replace(before, after);
    } else if (!source.includes(after)) {
      throw new Error(`Expected Jimp source was not found in ${patch.path}`);
    }
  }

  await writeFile(patch.path, source);
}
