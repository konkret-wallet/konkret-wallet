import fs from 'fs';
import { ManifestFlags } from '../../shared/lib/manifestFlags';

export const folder = `dist/${process.env.SELENIUM_BROWSER}`;

type ManifestType = { _flags?: ManifestFlags; manifest_version: string };
let manifest: ManifestType;

// Alter the manifest with CircleCI environment variables and custom flags
export async function setManifestFlags(flags: ManifestFlags = {}) {
  readManifest();

  manifest._flags = flags;

  fs.writeFileSync(`${folder}/manifest.json`, JSON.stringify(manifest));
}

export function getManifestVersion(): number {
  readManifest();

  return parseInt(manifest.manifest_version, 10);
}

function readManifest() {
  if (!manifest) {
    manifest = JSON.parse(
      fs.readFileSync(`${folder}/manifest.json`).toString(),
    );
  }
}
