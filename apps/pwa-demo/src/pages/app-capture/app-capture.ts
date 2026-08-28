import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/spinner/spinner.js';

import { captureStyles } from './app-capture.styles';
import { styles as sharedStyles } from '../../shared.styles';
import { getAll, putRecord, deleteRecord, uid, type PhotoRecord } from '../../utils/db';
import type { FilterName } from '../../workers/image-filter.worker';

interface GalleryItem {
  record: PhotoRecord;
  url: string;
}

const FILTERS: Array<{ id: FilterName; label: string }> = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'Mono' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'invert', label: 'Invert' },
  { id: 'threshold', label: 'B&W' },
];

@customElement('app-capture')
export class AppCapture extends LitElement {
  @state() private streaming = false;
  @state() private error = '';
  @state() private filter: FilterName = 'none';
  @state() private previewUrl = '';
  @state() private processing = false;
  @state() private geotag = false;
  @state() private gallery: GalleryItem[] = [];
  @state() private facing: 'user' | 'environment' = 'environment';

  @query('video') private video!: HTMLVideoElement;

  private stream: MediaStream | null = null;
  private worker?: Worker;
  private workerSeq = 0;
  private lastBlob: Blob | null = null;

  static styles = [sharedStyles, captureStyles];

  connectedCallback(): void {
    super.connectedCallback();
    this.worker = new Worker(
      new URL('../../workers/image-filter.worker.ts', import.meta.url),
      { type: 'module' }
    );
    void this.loadGallery();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopCamera();
    this.worker?.terminate();
    this.gallery.forEach((g) => URL.revokeObjectURL(g.url));
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  private async loadGallery() {
    const records = await getAll<PhotoRecord>('photos');
    records.sort((a, b) => b.created - a.created);
    this.gallery = records.map((record) => ({
      record,
      url: URL.createObjectURL(record.blob),
    }));
  }

  private async startCamera() {
    this.error = '';
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error = 'Camera access (getUserMedia) is not available in this browser.';
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facing },
        audio: false,
      });
      this.streaming = true;
      await this.updateComplete;
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch (err) {
      this.error =
        (err as Error)?.message ||
        'Could not access the camera. Grant permission and try again.';
    }
  }

  private stopCamera() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.streaming = false;
  }

  private async flipCamera() {
    this.facing = this.facing === 'user' ? 'environment' : 'user';
    if (this.streaming) {
      this.stopCamera();
      await this.startCamera();
    }
  }

  private async capture() {
    if (!this.streaming) {
      return;
    }
    // Snapshot the current video frame as the pristine original.
    const bitmap = await createImageBitmap(this.video);
    this.originalBlob = await this.bitmapToBlob(bitmap);
    await this.renderFilter(this.filter);
  }

  private async applyFilter(filter: FilterName) {
    this.filter = filter;
    await this.renderFilter(filter);
  }

  // Filter the pristine original on the Web Worker's OffscreenCanvas. Always
  // starting from the original means filters are never stacked on each other.
  private async renderFilter(filter: FilterName): Promise<void> {
    if (!this.originalBlob) {
      return;
    }
    const bitmap = await createImageBitmap(this.originalBlob);
    this.processing = true;
    const seq = ++this.workerSeq;
    await new Promise<void>((resolve) => {
      const onMessage = (e: MessageEvent) => {
        if (e.data.id !== seq) {
          return;
        }
        this.worker!.removeEventListener('message', onMessage);
        this.processing = false;
        if (e.data.blob) {
          if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
          }
          this.previewUrl = URL.createObjectURL(e.data.blob);
          this.lastBlob = e.data.blob;
        }
        resolve();
      };
      this.worker!.addEventListener('message', onMessage);
      this.worker!.postMessage({ id: seq, bitmap, filter }, [bitmap]);
    });
  }

  private originalBlob: Blob | null = null;

  private async bitmapToBlob(bitmap: ImageBitmap): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
    bitmap.close();
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png')
    );
  }

  private async getLocation(): Promise<PhotoRecord['location']> {
    if (!this.geotag || !navigator.geolocation) {
      return null;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 6000 }
      );
    });
  }

  private async saveToGallery() {
    if (!this.lastBlob) {
      return;
    }
    const location = await this.getLocation();
    const record: PhotoRecord = {
      id: uid(),
      blob: this.lastBlob,
      created: Date.now(),
      location,
      filter: this.filter,
    };
    await putRecord('photos', record);
    this.gallery = [
      { record, url: URL.createObjectURL(record.blob) },
      ...this.gallery,
    ];
    // Update the app badge to reflect the number of saved photos.
    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge(this.gallery.length).catch(() => {});
    }
  }

  private async removePhoto(id: string) {
    await deleteRecord('photos', id);
    const item = this.gallery.find((g) => g.record.id === id);
    if (item) {
      URL.revokeObjectURL(item.url);
    }
    this.gallery = this.gallery.filter((g) => g.record.id !== id);
    if ('setAppBadge' in navigator) {
      if (this.gallery.length) {
        (navigator as any).setAppBadge(this.gallery.length).catch(() => {});
      } else {
        (navigator as any).clearAppBadge?.().catch(() => {});
      }
    }
  }

  private async sharePreview() {
    if (!this.lastBlob) {
      return;
    }
    const file = new File([this.lastBlob], 'nimbus-photo.png', {
      type: 'image/png',
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Nimbus photo' });
      } catch {
        /* cancelled */
      }
    }
  }

  render() {
    return html`
      <div class="page-head">
        <h1>Capture</h1>
        <p>
          Take a photo with your camera (getUserMedia). Filters are applied on a
          background thread using a Web Worker + OffscreenCanvas, and photos are
          saved offline with an optional geotag.
        </p>
      </div>

      <wa-card>
        <div class="stage">
          ${this.previewUrl
            ? html`<img class="preview" src="${this.previewUrl}" alt="Captured photo" />`
            : this.streaming
              ? html`<video playsinline muted></video>`
              : html`<div class="placeholder">
                  <wa-icon name="camera"></wa-icon>
                  <div>${this.error || 'Camera is off'}</div>
                </div>`}
          ${this.processing
            ? html`<wa-spinner
                style="position:absolute;font-size:2rem;--track-color:rgba(255,255,255,.3);--indicator-color:#fff"
              ></wa-spinner>`
            : nothing}
        </div>

        ${this.previewUrl
          ? html`<div class="filters">
              ${FILTERS.map(
                (f) => html`
                  <button
                    class="filter-btn"
                    aria-pressed="${this.filter === f.id}"
                    @click="${() => this.applyFilter(f.id)}"
                  >
                    ${f.label}
                  </button>
                `
              )}
            </div>`
          : nothing}

        <div class="toolbar">
          ${this.streaming
            ? html`
                <wa-button variant="brand" @click="${this.capture}">
                  <wa-icon slot="prefix" name="circle-dot"></wa-icon>Capture
                </wa-button>
                <wa-button appearance="outlined" @click="${this.flipCamera}">
                  <wa-icon slot="prefix" name="camera-rotate"></wa-icon>Flip
                </wa-button>
                <wa-button appearance="outlined" @click="${this.stopCamera}">
                  <wa-icon slot="prefix" name="stop"></wa-icon>Stop
                </wa-button>
              `
            : html`
                <wa-button variant="brand" @click="${this.startCamera}">
                  <wa-icon slot="prefix" name="camera"></wa-icon>Start camera
                </wa-button>
              `}

          <span class="spacer"></span>

          ${this.previewUrl
            ? html`
                <label class="row" style="font-size:.85rem;gap:6px">
                  <input
                    type="checkbox"
                    .checked="${this.geotag}"
                    @change="${(e: Event) =>
                      (this.geotag = (e.target as HTMLInputElement).checked)}"
                  />
                  Geotag
                </label>
                <wa-button appearance="outlined" @click="${this.sharePreview}">
                  <wa-icon slot="prefix" name="share-nodes"></wa-icon>Share
                </wa-button>
                <wa-button variant="brand" @click="${this.saveToGallery}">
                  <wa-icon slot="prefix" name="floppy-disk"></wa-icon>Save
                </wa-button>
              `
            : nothing}
        </div>
      </wa-card>

      ${this.gallery.length
        ? html`
            <div class="page-head" style="margin-top:26px">
              <h1 style="font-size:1.3rem">Gallery</h1>
              <p>Saved offline in IndexedDB. Count is mirrored to the app icon badge.</p>
            </div>
            <div class="gallery">
              ${this.gallery.map(
                (g) => html`
                  <div class="thumb">
                    <img src="${g.url}" alt="Saved photo" />
                    <button
                      class="del"
                      aria-label="Delete photo"
                      @click="${() => this.removePhoto(g.record.id)}"
                    >
                      <wa-icon name="xmark"></wa-icon>
                    </button>
                    ${g.record.location
                      ? html`<span class="geo">
                          <wa-icon name="location-dot"></wa-icon>
                          ${g.record.location.lat.toFixed(2)},
                          ${g.record.location.lon.toFixed(2)}
                        </span>`
                      : nothing}
                  </div>
                `
              )}
            </div>
          `
        : nothing}
    `;
  }
}
