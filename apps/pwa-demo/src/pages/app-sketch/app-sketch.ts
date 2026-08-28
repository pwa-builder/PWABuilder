import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import { sketchStyles } from './app-sketch.styles';
import { styles as sharedStyles } from '../../shared.styles';

const COLORS = ['#0f172a', '#2563eb', '#22d3ee', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ffffff'];

@customElement('app-sketch')
export class AppSketch extends LitElement {
  @state() private color = COLORS[1];
  @state() private size = 6;
  @state() private eraser = false;
  @state() private pressure = 1;
  @state() private isFullscreen = false;

  @query('canvas') private canvas!: HTMLCanvasElement;
  @query('.canvas-wrap') private wrap!: HTMLElement;

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private last: { x: number; y: number } | null = null;
  private wakeLock: any = null;
  private resizeObserver?: ResizeObserver;

  static styles = [sharedStyles, sketchStyles];

  firstUpdated(): void {
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(this.wrap);
    document.addEventListener('fullscreenchange', this.onFsChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    document.removeEventListener('fullscreenchange', this.onFsChange);
    void this.releaseWakeLock();
  }

  private onFsChange = () => {
    this.isFullscreen = document.fullscreenElement === this.wrap;
    // Give layout a tick before re-measuring.
    requestAnimationFrame(() => this.resizeCanvas());
  };

  // Keep the backing store crisp on high-DPI screens while preserving drawing.
  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const snapshot = this.canvas.width
      ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      : null;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    if (snapshot) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.putImageData(snapshot, 0, 0);
      this.ctx.restore();
    }
  }

  private pointerPos(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.drawing = true;
    this.last = this.pointerPos(e);
    this.pressure = e.pressure || 0.5;
    void this.requestWakeLock();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.drawing || !this.last) {
      return;
    }
    // Use coalesced events for smoother, higher-fidelity strokes.
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const pos = this.pointerPos(ev);
      const pressure = ev.pressure > 0 ? ev.pressure : 0.5;
      this.pressure = pressure;
      const width = this.size * (0.4 + pressure * 1.2);
      this.ctx.strokeStyle = this.eraser ? '#ffffff' : this.color;
      this.ctx.lineWidth = this.eraser ? this.size * 2.4 : width;
      this.ctx.beginPath();
      this.ctx.moveTo(this.last.x, this.last.y);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      this.last = pos;
    }
  };

  private onPointerUp = () => {
    this.drawing = false;
    this.last = null;
    void this.releaseWakeLock();
  };

  private clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  private toBlob(): Promise<Blob> {
    return new Promise((resolve) =>
      this.canvas.toBlob((b) => resolve(b!), 'image/png')
    );
  }

  private async download() {
    const blob = await this.toBlob();
    const name = `nimbus-sketch-${Date.now()}.png`;
    const picker = (window as any).showSaveFilePicker;
    if (picker) {
      try {
        const handle = await picker({
          suggestedName: name,
          types: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') {
          return;
        }
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private async share() {
    const blob = await this.toBlob();
    const file = new File([blob], 'nimbus-sketch.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Nimbus sketch',
          text: 'Drawn in Nimbus',
        });
      } catch {
        /* cancelled */
      }
    } else {
      await this.download();
    }
  }

  private async toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await this.wrap.requestFullscreen();
    }
  }

  // Screen Wake Lock keeps the display awake while actively drawing.
  private async requestWakeLock() {
    if (this.wakeLock || !('wakeLock' in navigator)) {
      return;
    }
    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
    } catch {
      /* ignored */
    }
  }

  private async releaseWakeLock() {
    try {
      await this.wakeLock?.release();
    } catch {
      /* ignored */
    }
    this.wakeLock = null;
  }

  render() {
    return html`
      <div class="page-head">
        <h1>Sketch</h1>
        <p>
          A pressure-sensitive canvas built on Pointer Events. Draw with a
          stylus for variable line width, then save, share, or go full-screen.
        </p>
      </div>

      <wa-card>
        <div class="toolbar">
          <div class="swatches">
            ${COLORS.map(
              (c) => html`
                <button
                  class="swatch"
                  style="background:${c}"
                  aria-label="Color ${c}"
                  aria-pressed="${!this.eraser && this.color === c}"
                  @click="${() => {
                    this.color = c;
                    this.eraser = false;
                  }}"
                ></button>
              `
            )}
          </div>

          <div class="size-control">
            <wa-icon name="paintbrush"></wa-icon>
            <input
              type="range"
              min="1"
              max="40"
              .value="${String(this.size)}"
              @input="${(e: Event) =>
                (this.size = Number((e.target as HTMLInputElement).value))}"
            />
            <span class="mono">${this.size}px</span>
          </div>

          <span class="spacer"></span>

          <wa-button
            size="s"
            appearance="${this.eraser ? 'filled' : 'outlined'}"
            variant="${this.eraser ? 'brand' : 'neutral'}"
            @click="${() => (this.eraser = !this.eraser)}"
          >
            <wa-icon slot="prefix" name="eraser"></wa-icon>Eraser
          </wa-button>
          <wa-button size="s" appearance="outlined" @click="${this.clear}">
            <wa-icon slot="prefix" name="trash-can"></wa-icon>Clear
          </wa-button>
          <wa-button size="s" appearance="outlined" @click="${this.toggleFullscreen}">
            <wa-icon slot="prefix" name="expand"></wa-icon>
            ${this.isFullscreen ? 'Exit' : 'Full screen'}
          </wa-button>
          <wa-button size="s" appearance="outlined" @click="${this.share}">
            <wa-icon slot="prefix" name="share-nodes"></wa-icon>Share
          </wa-button>
          <wa-button size="s" variant="brand" @click="${this.download}">
            <wa-icon slot="prefix" name="download"></wa-icon>Save
          </wa-button>
        </div>

        <div class="canvas-wrap ${this.isFullscreen ? 'fullscreen' : ''}">
          <canvas
            @pointerdown="${this.onPointerDown}"
            @pointermove="${this.onPointerMove}"
            @pointerup="${this.onPointerUp}"
            @pointercancel="${this.onPointerUp}"
            @pointerleave="${this.onPointerUp}"
          ></canvas>
          <div class="pressure-badge">pressure ${this.pressure.toFixed(2)}</div>
        </div>

        <p class="hint">
          Tip: on a touchscreen or with a stylus, press harder for a thicker
          stroke. The screen stays awake while you draw via the Wake Lock API.
        </p>
      </wa-card>
    `;
  }
}
