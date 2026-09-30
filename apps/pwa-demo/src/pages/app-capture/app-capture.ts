import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { captureStyles } from './app-capture.styles';
import { styles as sharedStyles } from '../../shared.styles';
import { getAll, uid, type PhotoRecord, type NoteAttachment } from '../../utils/db';
import type { FilterName } from '../../workers/image-filter.worker';

const FILTERS: Array<{ id: FilterName; label: string }> = [
  { id: 'none', label: 'Original' }, { id: 'grayscale', label: 'Mono' },
  { id: 'sepia', label: 'Sepia' }, { id: 'vintage', label: 'Vintage' },
  { id: 'invert', label: 'Invert' }, { id: 'threshold', label: 'B&W' },
];

@customElement('app-capture')
export class AppCapture extends LitElement {
  @state() private streaming = false;
  @state() private error = '';
  @state() private filter: FilterName = 'none';
  @state() private previewUrl = '';
  @state() private busy = false;
  @state() private gallery: Array<{ record: PhotoRecord; url: string }> = [];
  @query('video') private video!: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private worker?: Worker;
  private original?: Blob;
  private filtered?: Blob;
  private workerSeq = 0;
  private pendingFilter?: { reject: (reason: Error) => void; cleanup: () => void };
  private facing: 'user' | 'environment' = 'environment';
  private legacyLocation?: PhotoRecord['location'];
  private readonly filtersSupported = typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap === 'function';

  static styles = [sharedStyles, captureStyles];

  connectedCallback(): void {
    super.connectedCallback();
    if (this.filtersSupported) {
      this.worker = new Worker(new URL('../../workers/image-filter.worker.ts', import.meta.url), { type: 'module' });
    }
    void this.loadGallery();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopCamera();
    const pending = this.pendingFilter;
    pending?.cleanup();
    pending?.reject(new Error('Photo editor closed.'));
    this.pendingFilter = undefined;
    this.worker?.terminate();
    this.gallery.forEach((item) => URL.revokeObjectURL(item.url));
    URL.revokeObjectURL(this.previewUrl);
  }

  private async loadGallery(): Promise<void> {
    try {
      const records = await getAll<PhotoRecord>('photos');
      if (this.isConnected) this.gallery = records.map((record) => ({ record, url: URL.createObjectURL(record.blob) }));
    } catch (error) {
      this.error = `Could not load your previously saved photos: ${String(error)}`;
    }
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.error = '';
    this.busy = true;
    try { await action(); }
    catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { this.busy = false; }
  }

  private async startCamera(): Promise<void> {
    this.stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable. Choose a photo instead.');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.facing }, audio: false });
    if (!this.isConnected) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = '';
    this.stream = stream;
    this.streaming = true;
    await this.updateComplete;
    if (!this.isConnected) return;
    this.video.srcObject = stream;
    try { await this.video.play(); }
    catch (error) { this.stopCamera(); throw error; }
  }

  private stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.streaming = false;
  }

  private async capture(): Promise<void> {
    if (!this.video?.videoWidth) throw new Error('The camera is not ready yet. Try again in a moment.');
    const canvas = document.createElement('canvas');
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo capture is unavailable in this browser.');
    context.drawImage(this.video, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not capture a photo.')), 'image/png')
    );
    this.stopCamera();
    this.legacyLocation = undefined;
    this.setOriginal(blob);
  }

  private setOriginal(blob: Blob): void {
    this.original = blob;
    this.filter = 'none';
    this.preview(blob);
  }

  private preview(blob: Blob): void {
    if (!this.isConnected) return;
    URL.revokeObjectURL(this.previewUrl);
    this.filtered = blob;
    this.previewUrl = URL.createObjectURL(blob);
  }

  private async applyFilter(filter: FilterName): Promise<void> {
    if (!this.original) return;
    if (filter === 'none') {
      this.preview(this.original);
      this.filter = filter;
      return;
    }
    const worker = this.worker;
    if (!worker) throw new Error('Photo filters are unavailable. You can still attach the original.');
    const bitmap = await createImageBitmap(this.original);
    if (!this.isConnected) { bitmap.close(); return; }
    const id = ++this.workerSeq;
    const blob = await new Promise<Blob>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        this.pendingFilter = undefined;
      };
      const onMessage = (event: MessageEvent<{ id: number; blob?: Blob; error?: string }>) => {
        if (event.data.id !== id) return;
        cleanup();
        if (event.data.blob) resolve(event.data.blob);
        else reject(new Error(event.data.error ?? 'Photo filter failed.'));
      };
      const onError = () => { cleanup(); reject(new Error('Photo filter worker failed. Try the original photo.')); };
      const timer = window.setTimeout(onError, 15_000);
      this.pendingFilter = { reject, cleanup };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage({ id, bitmap, filter }, [bitmap]);
    });
    this.filter = filter;
    this.preview(blob);
  }

  private async choosePhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      throw new Error('Choose a PNG, JPEG, or WebP photo.');
    }
    // Decode before saving so corrupt images cannot become broken attachments.
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
    } finally { URL.revokeObjectURL(url); }
    this.stopCamera();
    this.legacyLocation = undefined;
    this.setOriginal(file);
  }

  private attach(): void {
    if (!this.filtered) return;
    const attachment: NoteAttachment = {
      id: uid(), kind: 'photo', name: 'Photo', blob: this.filtered,
      created: Date.now(), filter: this.filter, location: this.legacyLocation,
    };
    this.dispatchEvent(new CustomEvent('note-attachment', { detail: attachment, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <p>Capture a photo or choose one from your device. It will be saved with this note.</p>
      <div class="stage">
        ${this.streaming ? html`<video playsinline muted aria-label="Camera preview"></video>` :
          this.previewUrl ? html`<img class="preview" src="${this.previewUrl}" alt="Photo to attach" />` :
          html`<div class="placeholder"><wa-icon name="camera"></wa-icon><div>Camera is off</div></div>`}
      </div>
      ${this.error ? html`<p role="alert">${this.error}</p>` : nothing}
      <div class="toolbar">
        ${this.streaming ? html`
          <wa-button variant="brand" ?disabled="${this.busy}" @click="${() => this.run(() => this.capture())}">Take photo</wa-button>
          <wa-button ?disabled="${this.busy}" @click="${() => this.run(async () => {
            this.facing = this.facing === 'user' ? 'environment' : 'user';
            await this.startCamera();
          })}">Flip camera</wa-button>
          <wa-button @click="${this.stopCamera}">Stop camera</wa-button>
        ` : html`
          <wa-button ?disabled="${this.busy}" @click="${() => this.run(() => this.startCamera())}">
            ${this.previewUrl ? 'Retake photo' : 'Start camera'}
          </wa-button>
        `}
        <label>Choose photo
          <input type="file" accept="image/png,image/jpeg,image/webp" ?disabled="${this.busy}"
            @change="${(event: Event) => this.run(() => this.choosePhoto(event))}" />
        </label>
      </div>
      ${this.previewUrl && !this.streaming ? html`
        <div class="filters">
          ${FILTERS.map((filter) => html`
            <button class="filter-btn" aria-pressed="${this.filter === filter.id}"
              ?disabled="${this.busy || (!this.filtersSupported && filter.id !== 'none')}"
              @click="${() => this.run(() => this.applyFilter(filter.id))}">${filter.label}</button>
          `)}
        </div>
        <p>${this.busy ? 'Processing photo…' : 'Filters run off the main thread. The original is kept while you choose.'}</p>
        <wa-button variant="brand" ?disabled="${this.busy}" @click="${this.attach}">Add photo to note</wa-button>
      ` : nothing}
      ${this.gallery.length ? html`
        <h3>Previously saved photos</h3>
        <p>Photos from the earlier Nimbus gallery are still here. Select one to attach it.</p>
        <div class="gallery">
          ${this.gallery.map((item, index) => html`
            <button class="thumb" aria-label="Use saved photo ${index + 1}" ?disabled="${this.busy}"
              @click="${() => {
                this.stopCamera();
                this.legacyLocation = item.record.location;
                this.setOriginal(item.record.blob);
              }}"><img src="${item.url}" alt="" /></button>
          `)}
        </div>
      ` : nothing}
    `;
  }
}
