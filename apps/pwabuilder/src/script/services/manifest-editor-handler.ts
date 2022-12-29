import { Manifest } from "@pwabuilder/manifest-validation"

let initialManifest: Manifest = {};
export let initialized: Boolean = false;
let editedManifest: Manifest = {};

export function initManifestEditorManifest(manifest: Manifest){
  initialManifest = manifest;
  initialized = true;
}

export function updateManifestEditorManifest(manifest: Manifest) {
  editedManifest = manifest;
}

export function getManifestEditorManifest() {
  return editedManifest ?? initialManifest;
}

export function resetManifestEditorManifest(){
  initialManifest = {};
  initialized = false;
}