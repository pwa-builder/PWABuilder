import { Manifest } from "@pwabuilder/manifest-validation"

let initialManifest: Manifest = {};

let editedManifest: Manifest = {};

export function initManifestEditorManifest(manifest: Manifest){
  initialManifest = manifest;
}

export function updateManifestEditorManifest(manifest: Manifest) {
  editedManifest = manifest;
}

export function getManifestEditorManifest() {
  console.log(initialManifest)
  return editedManifest ?? initialManifest;
}