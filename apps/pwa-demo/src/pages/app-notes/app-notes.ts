import { LitElement, html, nothing } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { live } from 'lit/directives/live.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import '../../components/note-tools';
import '../../components/markdown-preview';
import { notesStyles } from './app-notes.styles';
import { styles as sharedStyles } from '../../shared.styles';
import { getAll, putRecord, deleteRecord, uid, type NoteRecord, type NoteAttachment } from '../../utils/db';
import { downloadFile, exportNoteFile, importNoteFile } from '../../utils/note-files';
import type { AnalyticsResult } from '../../workers/notes-analytics.worker';

type MediaTool = 'sketch' | 'photo';
interface FilePickerOptions {
  suggestedName?: string;
  types: Array<{ description: string; accept: Record<string, string[]> }>;
}
const fileWindow = window as Window & {
  showSaveFilePicker?: (options: FilePickerOptions) => Promise<FileSystemFileHandle>;
  launchQueue?: { setConsumer(callback: (params: { files: FileSystemFileHandle[] }) => void): void };
};
const badgeNavigator = navigator as Navigator & {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

@customElement('app-notes')
export class AppNotes extends LitElement {
  @property({ attribute: 'initial-tool' }) initialTool = '';
  @state() private notes: NoteRecord[] = [];
  @state() private activeId: string | null = null;
  @state() private analytics: AnalyticsResult | null = null;
  @state() private loading = true;
  @state() private pending = 0;
  @state() private failed = new Set<string>();
  @state() private error = '';
  @state() private message = '';
  @state() private search = '';
  @state() private media: { type: MediaTool; noteId: string } | null = null;
  @state() private toolsOpen = false;
  @state() private focusMode = false;
  @state() private editorMode: 'write' | 'preview' = 'write';
  @query('.body-input') private bodyInput?: HTMLTextAreaElement;
  @query('dialog') private dialog!: HTMLDialogElement;
  @query('#import-file') private importInput!: HTMLInputElement;
  private worker?: Worker;
  private analyticsSeq = 0;
  private writes: Promise<void> = Promise.resolve();
  private urls = new Map<string, string>();

  static styles = [sharedStyles, notesStyles];

  connectedCallback(): void {
    super.connectedCallback();
    this.worker = new Worker(new URL('../../workers/notes-analytics.worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', (event: MessageEvent<{ id: number; result: AnalyticsResult }>) => {
      if (event.data.id === this.analyticsSeq) this.analytics = event.data.result;
    });
    this.worker.addEventListener('error', () => { this.error = 'Word statistics are unavailable. You can still edit and save notes.'; });
    window.addEventListener('beforeunload', this.beforeUnload);
    window.addEventListener('nimbus-before-navigate', this.beforeNavigate);
    void this.run(() => this.init());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.worker?.terminate();
    window.removeEventListener('beforeunload', this.beforeUnload);
    window.removeEventListener('nimbus-before-navigate', this.beforeNavigate);
    fileWindow.launchQueue?.setConsumer(() => {});
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }

  private beforeUnload = (event: BeforeUnloadEvent): void => {
    if (this.pending || this.failed.size) event.preventDefault();
  };

  private beforeNavigate = (event: Event): void => {
    if (!this.pending && !this.failed.size) return;
    event.preventDefault();
    this.error = this.failed.size
      ? 'Some changes are not saved. Retry saving or export a backup before leaving your notebook.'
      : 'Nimbus is still saving your changes. Please wait before leaving your notebook.';
  };

  private get active(): NoteRecord | undefined {
    return this.notes.find((note) => note.id === this.activeId);
  }

  private async run(action: () => void | Promise<void>): Promise<void> {
    this.error = '';
    this.message = '';
    try { await action(); }
    catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.error = error instanceof Error ? error.message : String(error);
      }
    }
  }

  private async init(): Promise<void> {
    try {
      this.notes = await getAll<NoteRecord>('notes');
      if (!this.isConnected) return;
      const params = new URLSearchParams(location.search);
      const shared = ['title', 'text', 'url', 'protocol'].some((key) => params.has(key));
      if (shared) {
        const note = this.newRecord(params.get('title') || 'Shared to Nimbus',
          [params.get('text'), params.get('url'), params.get('protocol')].filter(Boolean).join('\n\n'));
        await this.save(note);
        this.select(note.id);
        // Consume share parameters only after persistence so refreshing cannot duplicate the note.
        if (!this.failed.has(note.id)) history.replaceState(null, '', `${import.meta.env.BASE_URL}?note=${encodeURIComponent(note.id)}`);
      } else if (params.has('new')) {
        await this.createNote();
        if (!this.failed.size) history.replaceState(null, '', `${import.meta.env.BASE_URL}?note=${encodeURIComponent(this.activeId!)}`);
      } else if (this.notes.length) {
        const requested = params.get('note');
        this.select(this.notes.some((note) => note.id === requested) ? requested! : this.sortedNotes()[0].id);
        if (requested && requested !== this.activeId) this.message = 'That note is no longer available. Your other notes are still here.';
      } else {
        const note = this.newRecord('A place for your next idea',
          'Welcome to Nimbus.\n\nWrite something worth keeping. Add a sketch, capture a photo, or use Note tools to dictate an idea and read it back.\n\nYour notes and attachments save on this device and work offline. Export a note to keep a portable backup.');
        await this.save(note);
        this.select(note.id);
      }
      fileWindow.launchQueue?.setConsumer((params) => {
        void this.run(async () => {
          for (const handle of params.files) {
            const note = await importNoteFile(await handle.getFile());
            if (!this.isConnected) return;
            await this.save(note);
            this.select(note.id);
          }
        });
      });
      const tool = params.get('new') || this.initialTool;
      if (tool === 'sketch' || tool === 'photo') await this.openMedia(tool);
      if (tool === 'tools') this.toolsOpen = true;
    } finally { this.loading = false; }
  }

  private newRecord(title = 'Untitled note', body = ''): NoteRecord {
    return { id: uid(), title, body, updated: Date.now(), attachments: [] };
  }

  private sortedNotes(): NoteRecord[] {
    return [...this.notes].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updated - a.updated);
  }

  private select(id: string): void {
    this.activeId = id;
    this.editorMode = 'write';
    this.analytics = null;
    this.runAnalytics(this.active?.body ?? '');
    this.syncUrls();
  }

  private async createNote(): Promise<void> {
    const note = this.newRecord();
    this.search = '';
    const saved = this.save(note);
    this.select(note.id);
    void this.updateComplete.then(() => this.bodyInput?.focus());
    await saved;
  }

  /** Update the UI immediately; serialize writes so a delete cannot be undone by a late save. */
  private save(note: NoteRecord): Promise<void> {
    const snapshot: NoteRecord = { ...note, attachments: [...(note.attachments ?? [])] };
    this.notes = [...this.notes.filter((item) => item.id !== note.id), snapshot];
    return this.enqueue(note.id, () => putRecord('notes', snapshot));
  }

  private enqueue(id: string, action: () => Promise<unknown>): Promise<void> {
    this.pending++;
    this.writes = this.writes.then(async () => {
      try {
        await action();
        const failed = new Set(this.failed);
        failed.delete(id);
        this.failed = failed;
      } catch (error) {
        this.failed = new Set([...this.failed, id]);
        this.error = `Could not save changes on this device: ${error instanceof Error ? error.message : String(error)}. Keep Nimbus open and retry, or export a backup.`;
      } finally { this.pending--; }
    });
    return this.writes;
  }

  private updateNote(id: string, changes: Partial<NoteRecord>): void {
    const note = this.notes.find((item) => item.id === id);
    if (!note) {
      this.error = 'This note was deleted; the change was not added.';
      return;
    }
    void this.save({ ...note, ...changes, updated: Date.now() });
    if (id === this.activeId && changes.body !== undefined) this.runAnalytics(changes.body);
  }

  private runAnalytics(text: string): void {
    this.worker?.postMessage({ id: ++this.analyticsSeq, text });
  }

  private async retry(): Promise<void> {
    this.error = '';
    for (const id of this.failed) {
      const note = this.notes.find((item) => item.id === id);
      if (note) await this.save(note);
    }
  }

  private async deleteNote(note: NoteRecord): Promise<void> {
    if (!confirm(`Delete "${note.title || 'Untitled note'}" and its attachments from this device?`)) return;
    await this.enqueue(note.id, () => deleteRecord('notes', note.id));
    if (this.failed.has(note.id)) return;
    this.notes = this.notes.filter((item) => item.id !== note.id);
    this.activeId = this.sortedNotes()[0]?.id ?? null;
    this.editorMode = 'write';
    this.runAnalytics(this.active?.body ?? '');
    this.syncUrls();
    await this.updateBadge();
  }

  private async updateBadge(): Promise<void> {
    const count = this.notes.filter((note) => note.pinned).length;
    try {
      if (count) await badgeNavigator.setAppBadge?.(count);
      else await badgeNavigator.clearAppBadge?.();
    } catch (error) { this.message = `Your note is saved, but the app badge could not update: ${String(error)}`; }
  }

  private syncUrls(): void {
    const ids = new Set((this.active?.attachments ?? []).map((item) => item.id));
    for (const [id, url] of this.urls) {
      if (!ids.has(id)) { URL.revokeObjectURL(url); this.urls.delete(id); }
    }
    for (const item of this.active?.attachments ?? []) {
      if (!this.urls.has(item.id)) this.urls.set(item.id, URL.createObjectURL(item.blob));
    }
  }

  private async openMedia(type: MediaTool): Promise<void> {
    const noteId = this.activeId;
    if (!noteId) return;
    if (type === 'sketch') await import('../app-sketch/app-sketch');
    else await import('../app-capture/app-capture');
    if (!this.isConnected || this.activeId !== noteId) return;
    this.media = { type, noteId };
    await this.updateComplete;
    this.dialog.showModal();
  }

  private closeMedia(): void {
    this.dialog.close();
    this.media = null;
  }

  private addAttachment(event: CustomEvent<NoteAttachment>): void {
    const note = this.notes.find((item) => item.id === this.media?.noteId);
    if (!note) { this.error = 'The destination note is no longer available.'; return; }
    this.updateNote(note.id, { attachments: [...(note.attachments ?? []), event.detail] });
    this.syncUrls();
    this.closeMedia();
    this.message = `${event.detail.kind === 'sketch' ? 'Sketch' : 'Photo'} added to "${note.title}".`;
    navigator.vibrate?.(40);
  }

  private removeAttachment(note: NoteRecord, id: string): void {
    if (!confirm('Remove this attachment from the note?')) return;
    this.updateNote(note.id, { attachments: note.attachments?.filter((item) => item.id !== id) });
    this.syncUrls();
  }

  private appendText(event: CustomEvent<{ id: string; text: string }>): void {
    const note = this.notes.find((item) => item.id === event.detail.id);
    if (!note) return;
    this.updateNote(note.id, { body: [note.body, event.detail.text].filter(Boolean).join('\n\n') });
  }

  private async exportNote(): Promise<void> {
    const note = this.active;
    if (!note) return;
    if (fileWindow.showSaveFilePicker) {
      const handle = await fileWindow.showSaveFilePicker({
        suggestedName: `${note.title.replace(/[^\w-]+/g, '-') || 'note'}.nimbus.json`,
        types: [{ description: 'Nimbus note with attachments', accept: { 'application/json': ['.json'] } }],
      });
      const file = await exportNoteFile(note);
      const writable = await handle.createWritable();
      await writable.write(file);
      await writable.close();
    } else downloadFile(await exportNoteFile(note));
    this.message = 'Exported a Nimbus backup, including all sketches and photos.';
  }

  private async importFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const note = await importNoteFile(file);
    await this.save(note);
    this.search = '';
    this.select(note.id);
  }

  private async shareNote(): Promise<void> {
    const note = this.active;
    if (!note) return;
    const files = (note.attachments ?? []).map((item) =>
      new File([item.blob], `${item.name}.${item.blob.type === 'image/jpeg' ? 'jpg' : item.blob.type === 'image/webp' ? 'webp' : 'png'}`, { type: item.blob.type })
    );
    if (navigator.share && (!files.length || navigator.canShare?.({ files }))) {
      await navigator.share({ title: note.title, text: note.body, ...(files.length ? { files } : {}) });
      this.message = 'Note shared.';
    } else if (files.length) {
      downloadFile(await exportNoteFile(note));
      this.message = 'This browser cannot share attachments. Downloaded a complete Nimbus backup instead.';
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.body}`);
      this.message = 'Sharing is unavailable here. Note text copied to the clipboard.';
    } else {
      downloadFile(await exportNoteFile(note));
      this.message = 'Sharing is unavailable here. Downloaded a Nimbus backup instead.';
    }
  }

  private formatDate(value: number): string {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  render() {
    const note = this.active;
    const matches = this.sortedNotes().filter((item) =>
      `${item.title}\n${item.body}`.toLocaleLowerCase().includes(this.search.toLocaleLowerCase())
    );
    return html`
      <div class="page-head notebook-heading">
        <div><h1>Your notes</h1><p>A thought, a sketch, a moment. Keep it all together in Nimbus.</p></div>
        <span class="local-label"><wa-icon name="database"></wa-icon>Saved on this device</span>
      </div>
      ${this.error ? html`<div class="feedback error" role="alert">${this.error}</div>` : nothing}
      ${this.message ? html`<div class="feedback" role="status">${this.message}</div>` : nothing}
      <div class="layout ${this.focusMode ? 'focused' : ''}">
        <aside class="list" aria-label="Your notes">
          <wa-card>
            <div class="list-actions">
              <wa-button variant="brand" ?disabled="${this.loading}" @click="${this.createNote}"><wa-icon slot="prefix" name="plus"></wa-icon>New note</wa-button>
              <wa-button appearance="outlined" ?disabled="${this.loading}" @click="${() => this.importInput.click()}">Import</wa-button>
            </div>
            <input class="search-input" type="search" aria-label="Search notes" placeholder="Search your notes"
              .value="${live(this.search)}" @input="${(event: Event) => { this.search = (event.target as HTMLInputElement).value; }}" />
            <p class="list-count">${this.notes.length} note${this.notes.length === 1 ? '' : 's'}</p>
            <div class="note-list">
              ${matches.map((item) => html`
                <button class="note-item ${item.id === this.activeId ? 'active' : ''}" aria-current="${item.id === this.activeId ? 'true' : 'false'}"
                  @click="${() => this.select(item.id)}">
                  <strong>${item.pinned ? '● ' : ''}${item.title || 'Untitled note'}</strong>
                  <span>${item.body.slice(0, 80) || 'An idea starts here…'}</span>
                  <span>${this.formatDate(item.updated)}${item.attachments?.length ? ` · ${item.attachments.length} attachments` : ''}</span>
                </button>
              `)}
              ${!matches.length ? html`<p class="empty">${this.loading ? 'Opening your notebook…' : this.search ? 'No matching notes.' : 'No notes yet. Start with New note or Import.'}</p>` : nothing}
            </div>
          </wa-card>
          <p class="storage-hint">Local-first, not cloud-synced. Export important notes to keep a backup.</p>
        </aside>
        <section class="editor" aria-label="Note editor">
          ${note ? html`
            <wa-card>
              <div class="toolbar">
                <span class="save-state" role="status">${this.failed.size ? 'Save failed' : this.pending ? 'Saving…' : 'Saved on this device'}</span>
                ${this.failed.size ? html`<wa-button @click="${this.retry}">Retry saving</wa-button>` : nothing}
                <span class="spacer"></span>
                <wa-button appearance="outlined" @click="${() => { this.focusMode = !this.focusMode; }}">
                  <wa-icon slot="prefix" name="expand"></wa-icon>${this.focusMode ? 'Show notebook' : 'Focus'}
                </wa-button>
                <wa-button appearance="outlined" @click="${() => this.run(() => this.shareNote())}">Share</wa-button>
                <wa-button appearance="outlined" @click="${() => this.run(() => this.exportNote())}">Export</wa-button>
              </div>
              <input class="title-input" aria-label="Note title" .value="${live(note.title)}" placeholder="Untitled note"
                @input="${(event: Event) => this.updateNote(note.id, { title: (event.target as HTMLInputElement).value })}" />
              <div class="note-meta">
                <span>${this.formatDate(note.updated)}</span>
                <label><input type="checkbox" .checked="${!!note.pinned}" @change="${(event: Event) => {
                  this.updateNote(note.id, { pinned: (event.target as HTMLInputElement).checked });
                  void this.updateBadge();
                }}" />Pin note</label>
              </div>
              <wa-tab-group class="markdown-editor" aria-label="Note writing and preview" .active="${live(this.editorMode)}"
                @wa-tab-show="${(event: CustomEvent<{ name: string }>) => {
                  if (event.detail.name === 'write' || event.detail.name === 'preview') this.editorMode = event.detail.name;
                }}">
                <wa-tab panel="write">Write</wa-tab>
                <wa-tab panel="preview">Preview</wa-tab>
                <wa-tab-panel name="write">
                  <textarea class="body-input" aria-label="Note text" .value="${live(note.body)}"
                    placeholder="Start writing. Markdown is supported; everything saves automatically."
                    @input="${(event: Event) => this.updateNote(note.id, { body: (event.target as HTMLTextAreaElement).value })}"></textarea>
                </wa-tab-panel>
                <wa-tab-panel name="preview">
                  ${this.editorMode === 'preview' ? html`<markdown-preview .source="${note.body}"></markdown-preview>` : nothing}
                </wa-tab-panel>
              </wa-tab-group>
              <div class="toolbar insert-toolbar">
                <wa-button appearance="outlined" @click="${() => this.run(() => this.openMedia('sketch'))}"><wa-icon slot="prefix" name="pen-nib"></wa-icon>Add sketch</wa-button>
                <wa-button appearance="outlined" @click="${() => this.run(() => this.openMedia('photo'))}"><wa-icon slot="prefix" name="camera"></wa-icon>Add photo</wa-button>
                <wa-button appearance="${this.toolsOpen ? 'filled' : 'outlined'}" @click="${() => { this.toolsOpen = !this.toolsOpen; }}" aria-expanded="${this.toolsOpen}">
                  <wa-icon slot="prefix" name="bolt"></wa-icon>Note tools
                </wa-button>
                <wa-button appearance="plain" ?disabled="${!navigator.clipboard?.writeText}" @click="${() => this.run(async () => {
                  await navigator.clipboard.writeText(`${note.title}\n\n${note.body}`);
                  this.message = 'Note text copied.';
                })}">Copy text</wa-button>
              </div>
              ${this.toolsOpen ? keyed(note.id, html`<note-tools .note="${note}" @note-append="${this.appendText}"
                @note-location="${(event: CustomEvent<{ id: string; location: NoteRecord['location'] }>) => {
                  this.updateNote(event.detail.id, { location: event.detail.location });
                }}"></note-tools>`) : nothing}
              ${note.location ? html`
                <div class="note-location"><wa-icon name="location-dot"></wa-icon>
                  ${note.location.lat.toFixed(4)}, ${note.location.lon.toFixed(4)}
                  <wa-button appearance="plain" @click="${() => this.updateNote(note.id, { location: undefined })}">Remove location</wa-button>
                </div>
              ` : nothing}
              ${(note.attachments ?? []).length ? html`
                <section class="attachments" aria-label="Note attachments">
                  ${note.attachments!.map((item) => html`
                    <figure>
                      <img src="${this.urls.get(item.id) ?? ''}" alt="${item.name}" />
                      <figcaption>
                        <span>${item.name}${item.filter && item.filter !== 'none' ? ` · ${item.filter}` : ''}</span>
                        ${item.location ? html`<small>${item.location.lat.toFixed(4)}, ${item.location.lon.toFixed(4)}</small>` : nothing}
                        <wa-button appearance="plain" @click="${() => downloadFile(new File([item.blob],
                          `${item.name}.${item.blob.type === 'image/jpeg' ? 'jpg' : item.blob.type === 'image/webp' ? 'webp' : 'png'}`, { type: item.blob.type }))}">Download</wa-button>
                        <wa-button appearance="plain" variant="danger" aria-label="Remove ${item.name}" @click="${() => this.removeAttachment(note, item.id)}">Remove</wa-button>
                      </figcaption>
                    </figure>
                  `)}
                </section>
              ` : nothing}
              <footer class="note-footer">
                <span>${this.analytics ? `${this.analytics.words} words · ${this.analytics.characters} characters · ${Math.max(1, Math.ceil(this.analytics.readingSeconds / 60))} min read` : 'Counting words…'}</span>
                <wa-button appearance="plain" variant="danger" @click="${() => this.run(() => this.deleteNote(note))}">Delete note</wa-button>
              </footer>
            </wa-card>
          ` : html`<wa-card><div class="empty"><h2>Your next idea starts here</h2><p>Create a note or import one to begin.</p></div></wa-card>`}
        </section>
      </div>
      <input id="import-file" type="file" hidden accept=".txt,.md,.json,text/plain,text/markdown,application/json"
        @change="${(event: Event) => this.run(() => this.importFile(event))}" />
      <dialog aria-labelledby="media-title" @cancel="${() => { this.media = null; }}" @close="${() => { this.media = null; }}">
        <div class="dialog-heading"><h2 id="media-title">${this.media?.type === 'sketch' ? 'Sketch for your note' : 'Photo for your note'}</h2>
          <wa-button appearance="outlined" @click="${this.closeMedia}">Cancel</wa-button></div>
        ${this.media ? keyed(this.media, html`
          <div @note-attachment="${this.addAttachment}">
            ${this.media.type === 'sketch' ? html`<app-sketch></app-sketch>` : html`<app-capture></app-capture>`}
          </div>
        `) : nothing}
      </dialog>
    `;
  }
}
