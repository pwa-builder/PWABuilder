import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';

import { notesStyles } from './app-notes.styles';
import { styles as sharedStyles } from '../../shared.styles';
import {
  getAll,
  putRecord,
  deleteRecord,
  uid,
  type NoteRecord,
} from '../../utils/db';
import type { AnalyticsResult } from '../../workers/notes-analytics.worker';

@customElement('app-notes')
export class AppNotes extends LitElement {
  @state() private notes: NoteRecord[] = [];
  @state() private activeId: string | null = null;
  @state() private analytics: AnalyticsResult | null = null;
  @state() private saving = false;

  @query('.body-input') private bodyInput?: HTMLTextAreaElement;

  private worker?: Worker;
  private analyticsSeq = 0;
  private saveTimer?: number;

  static styles = [sharedStyles, notesStyles];

  connectedCallback(): void {
    super.connectedCallback();
    // Spin up the analytics Web Worker (bundled by Vite as an ES module).
    this.worker = new Worker(
      new URL('../../workers/notes-analytics.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.worker.addEventListener('message', (e: MessageEvent) => {
      if (e.data.id === this.analyticsSeq) {
        this.analytics = e.data.result;
      }
    });
    void this.init();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.worker?.terminate();
  }

  private get active(): NoteRecord | undefined {
    return this.notes.find((n) => n.id === this.activeId);
  }

  private async init() {
    const stored = await getAll<NoteRecord>('notes');
    stored.sort((a, b) => b.updated - a.updated);
    this.notes = stored;

    // Handle deep-links: share target, file handler, shortcuts, protocol.
    const params = new URLSearchParams(window.location.search);
    const shared = this.noteFromShareParams(params);

    if (shared) {
      await this.commit(shared);
      this.select(shared.id);
    } else if (params.has('new')) {
      this.createNote();
    } else if (this.notes.length) {
      this.select(this.notes[0].id);
    } else {
      this.seedWelcome();
    }

    this.handleFileHandler();
  }

  /** Build a note from Web Share Target / protocol params, if present. */
  private noteFromShareParams(params: URLSearchParams): NoteRecord | null {
    const title = params.get('title');
    const text = params.get('text');
    const url = params.get('url');
    const protocol = params.get('protocol');
    if (!title && !text && !url && !protocol) {
      return null;
    }
    const bodyParts = [text, url, protocol && `Opened via: ${protocol}`].filter(
      Boolean
    );
    return {
      id: uid(),
      title: title || 'Shared to Nimbus',
      body: bodyParts.join('\n\n'),
      updated: Date.now(),
    };
  }

  /** Accept .txt/.md files opened via the File Handling API. */
  private handleFileHandler() {
    const queue = (window as any).launchQueue;
    if (!queue) {
      return;
    }
    queue.setConsumer(async (params: any) => {
      if (!params.files || !params.files.length) {
        return;
      }
      for (const handle of params.files) {
        const file = await handle.getFile();
        const body = await file.text();
        const note: NoteRecord = {
          id: uid(),
          title: file.name.replace(/\.[^.]+$/, ''),
          body,
          updated: Date.now(),
        };
        await this.commit(note);
        this.select(note.id);
      }
    });
  }

  private seedWelcome() {
    const note: NoteRecord = {
      id: uid(),
      title: 'Welcome to Nimbus Notes',
      body: `These notes live in your browser's IndexedDB, so they work fully offline.

Try this:
- Edit this note — the stats update live from a Web Worker.
- Export it to a .md file with the File System Access API.
- Share a link to Nimbus from another app; it lands here via the Web Share Target.

Everything is saved automatically.`,
      updated: Date.now(),
    };
    void this.commit(note);
    this.select(note.id);
  }

  private select(id: string) {
    this.activeId = id;
    this.runAnalytics(this.active?.body ?? '');
  }

  private createNote() {
    const note: NoteRecord = {
      id: uid(),
      title: 'Untitled note',
      body: '',
      updated: Date.now(),
    };
    void this.commit(note);
    this.select(note.id);
    requestAnimationFrame(() => this.bodyInput?.focus());
  }

  /** Persist a note and keep the in-memory list sorted. */
  private async commit(note: NoteRecord) {
    await putRecord('notes', note);
    const others = this.notes.filter((n) => n.id !== note.id);
    this.notes = [note, ...others].sort((a, b) => b.updated - a.updated);
  }

  private onTitleInput(e: Event) {
    const note = this.active;
    if (!note) {
      return;
    }
    note.title = (e.target as HTMLInputElement).value;
    note.updated = Date.now();
    this.scheduleSave(note);
  }

  private onBodyInput(e: Event) {
    const note = this.active;
    if (!note) {
      return;
    }
    note.body = (e.target as HTMLTextAreaElement).value;
    note.updated = Date.now();
    this.runAnalytics(note.body);
    this.scheduleSave(note);
  }

  private scheduleSave(note: NoteRecord) {
    this.saving = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(async () => {
      await this.commit({ ...note });
      this.saving = false;
    }, 400);
  }

  private runAnalytics(text: string) {
    this.analyticsSeq += 1;
    this.worker?.postMessage({ id: this.analyticsSeq, text });
  }

  private async deleteNote(id: string) {
    await deleteRecord('notes', id);
    this.notes = this.notes.filter((n) => n.id !== id);
    if (this.activeId === id) {
      if (this.notes.length) {
        this.select(this.notes[0].id);
      } else {
        this.activeId = null;
        this.analytics = null;
      }
    }
  }

  /** Export the active note using the File System Access API, with a download fallback. */
  private async exportNote() {
    const note = this.active;
    if (!note) {
      return;
    }
    const contents = `# ${note.title}\n\n${note.body}\n`;
    const filename = `${note.title.replace(/[^\w\-]+/g, '-').toLowerCase() || 'note'}.md`;
    const picker = (window as any).showSaveFilePicker;
    if (picker) {
      try {
        const handle = await picker({
          suggestedName: filename,
          types: [
            { description: 'Markdown', accept: { 'text/markdown': ['.md'] } },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(contents);
        await writable.close();
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') {
          return;
        }
      }
    }
    // Fallback: trigger a classic download.
    const blob = new Blob([contents], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Import a text/markdown file into a new note. */
  private async importNote() {
    const picker = (window as any).showOpenFilePicker;
    let file: File | null = null;
    if (picker) {
      try {
        const [handle] = await picker({
          types: [
            {
              description: 'Text',
              accept: { 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
            },
          ],
        });
        file = await handle.getFile();
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') {
          return;
        }
      }
    }
    if (!file) {
      file = await this.pickFileFallback();
    }
    if (!file) {
      return;
    }
    const body = await file.text();
    const note: NoteRecord = {
      id: uid(),
      title: file.name.replace(/\.[^.]+$/, ''),
      body,
      updated: Date.now(),
    };
    await this.commit(note);
    this.select(note.id);
  }

  private pickFileFallback(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,text/plain,text/markdown';
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  }

  private async shareNote() {
    const note = this.active;
    if (!note) {
      return;
    }
    const data = { title: note.title, text: note.body };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.body}`);
    }
  }

  private formatDate(ts: number): string {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private renderStats() {
    const a = this.analytics;
    if (!a) {
      return nothing;
    }
    const mins = Math.floor(a.readingSeconds / 60);
    const secs = a.readingSeconds % 60;
    const reading = mins ? `${mins}m ${secs}s` : `${secs}s`;
    return html`
      <div class="stats">
        <div class="stat"><b>${a.words}</b><span>Words</span></div>
        <div class="stat"><b>${a.characters}</b><span>Chars</span></div>
        <div class="stat"><b>${a.sentences}</b><span>Sentences</span></div>
        <div class="stat"><b>${reading}</b><span>Read time</span></div>
      </div>
      ${a.topWords.length
        ? html`<div class="tags">
            ${a.topWords.map(
              (w) =>
                html`<wa-badge variant="brand" appearance="outlined"
                  >${w.word} · ${w.count}</wa-badge
                >`
            )}
          </div>`
        : nothing}
    `;
  }

  render() {
    const note = this.active;
    return html`
      <div class="page-head">
        <h1>Notes</h1>
        <p>
          Offline notes stored in IndexedDB. Live word analytics run in a Web
          Worker; export and import use the File System Access API.
        </p>
      </div>

      <div class="layout">
        <div class="list">
          <wa-card>
            <div class="row" style="justify-content:space-between;margin-bottom:6px">
              <strong>${this.notes.length} note${this.notes.length === 1 ? '' : 's'}</strong>
              <wa-button size="s" variant="brand" @click="${this.createNote}">
                <wa-icon slot="prefix" name="plus"></wa-icon>New
              </wa-button>
            </div>
            ${this.notes.length
              ? this.notes.map(
                  (n) => html`
                    <div
                      class="note-item ${n.id === this.activeId ? 'active' : ''}"
                      @click="${() => this.select(n.id)}"
                    >
                      <strong>${n.title || 'Untitled note'}</strong>
                      <span>${this.formatDate(n.updated)}</span>
                    </div>
                  `
                )
              : html`<div class="empty">No notes yet.</div>`}
          </wa-card>
        </div>

        <div class="editor">
          ${note
            ? html`
                <wa-card>
                  <div class="toolbar" style="margin-bottom:10px">
                    <wa-badge
                      variant="${this.saving ? 'warning' : 'success'}"
                      appearance="outlined"
                    >
                      ${this.saving ? 'Saving…' : 'Saved'}
                    </wa-badge>
                    <span class="spacer"></span>
                    <wa-button size="s" appearance="outlined" @click="${this.shareNote}">
                      <wa-icon slot="prefix" name="share-nodes"></wa-icon>Share
                    </wa-button>
                    <wa-button size="s" appearance="outlined" @click="${this.importNote}">
                      <wa-icon slot="prefix" name="file-import"></wa-icon>Import
                    </wa-button>
                    <wa-button size="s" appearance="outlined" @click="${this.exportNote}">
                      <wa-icon slot="prefix" name="file-export"></wa-icon>Export
                    </wa-button>
                    <wa-button
                      size="s"
                      appearance="outlined"
                      variant="danger"
                      @click="${() => this.deleteNote(note.id)}"
                    >
                      <wa-icon slot="prefix" name="trash"></wa-icon>
                    </wa-button>
                  </div>

                  <input
                    class="title-input"
                    .value="${note.title}"
                    placeholder="Note title"
                    @input="${this.onTitleInput}"
                  />
                  <textarea
                    class="body-input"
                    .value="${note.body}"
                    placeholder="Start writing… everything saves automatically."
                    @input="${this.onBodyInput}"
                  ></textarea>

                  <div style="margin-top:14px">${this.renderStats()}</div>
                </wa-card>
              `
            : html`<wa-card
                ><div class="empty">
                  Select a note or create a new one to begin.
                </div></wa-card
              >`}
        </div>
      </div>
    `;
  }
}
