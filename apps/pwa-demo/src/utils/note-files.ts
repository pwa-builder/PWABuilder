import { uid, type NoteAttachment, type NoteRecord } from './db.js';

interface AttachmentBackup {
  kind: NoteAttachment['kind'];
  name: string;
  data: string;
  created: number;
  location?: NoteAttachment['location'];
  filter?: string;
}

export async function blobDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

/** Portable backup includes image bytes, not temporary blob URLs. */
export async function exportNoteFile(note: NoteRecord): Promise<File> {
  const attachments: AttachmentBackup[] = await Promise.all(
    (note.attachments ?? []).map(async (item) => ({
      kind: item.kind,
      name: item.name,
      data: await blobDataUrl(item.blob),
      created: item.created,
      location: item.location,
      filter: item.filter,
    }))
  );
  const data = JSON.stringify({
    format: 'nimbus-note',
    version: 1,
    title: note.title,
    body: note.body,
    location: note.location,
    pinned: note.pinned,
    attachments,
  }, null, 2);
  const name = note.title.replace(/[^\w-]+/g, '-').toLowerCase() || 'note';
  return new File([data], `${name}.nimbus.json`, { type: 'application/json' });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readLocation(value: unknown): NoteRecord['location'] {
  if (value === undefined || value === null) return undefined;
  if (!isObject(value) || typeof value.lat !== 'number' ||
      typeof value.lon !== 'number' || !Number.isFinite(value.lat) ||
      !Number.isFinite(value.lon) || Math.abs(value.lat) > 90 || Math.abs(value.lon) > 180) {
    throw new Error('This note contains an invalid location.');
  }
  return { lat: value.lat, lon: value.lon };
}

export async function importNoteFile(file: File): Promise<NoteRecord> {
  const text = await file.text();
  const base = { id: uid(), updated: Date.now() };
  if (!file.name.toLowerCase().endsWith('.json')) {
    return { ...base, title: file.name.replace(/\.[^.]+$/, ''), body: text };
  }
  const data: unknown = JSON.parse(text);
  if (!isObject(data) || data.format !== 'nimbus-note' || data.version !== 1 ||
      typeof data.title !== 'string' || typeof data.body !== 'string' ||
      !Array.isArray(data.attachments)) {
    throw new Error('Choose a Nimbus note backup (.nimbus.json), Markdown, or text file.');
  }
  const attachments = data.attachments.map((item: unknown): NoteAttachment => {
    if (!isObject(item) || (item.kind !== 'sketch' && item.kind !== 'photo') ||
        typeof item.name !== 'string' || typeof item.data !== 'string' ||
        typeof item.created !== 'number' || !Number.isFinite(item.created)) {
      throw new Error('This note contains an invalid attachment.');
    }
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(item.data);
    if (!match) throw new Error('Only PNG, JPEG, and WebP images can be imported.');
    const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
    return {
      id: uid(), kind: item.kind, name: item.name,
      blob: new Blob([bytes], { type: match[1] }), created: item.created,
      location: readLocation(item.location),
      filter: typeof item.filter === 'string' ? item.filter : undefined,
    };
  });
  return {
    ...base, title: data.title, body: data.body, attachments,
    location: readLocation(data.location), pinned: data.pinned === true,
  };
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  // Leave time for the browser to start consuming the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
