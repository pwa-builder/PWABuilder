import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { sketchStyles } from './app-sketch.styles';
import { styles as sharedStyles } from '../../shared.styles';
import { uid, type NoteAttachment } from '../../utils/db';

const COLORS = ['#0f172a', '#2563eb', '#22d3ee', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ffffff'];

@customElement('app-sketch')
export class AppSketch extends LitElement {
  @state() private color = COLORS[1];
  @state() private size = 6;
  @state() private eraser = false;
  @state() private pressure = 0;
  @state() private busy = false;
  @state() private error = '';
  @query('canvas') private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private pointer: number | null = null;
  private last = { x: 0, y: 0 };

  static styles = [sharedStyles, sketchStyles];

  firstUpdated(): void {
    const context = this.canvas.getContext('2d');
    if (!context) {
      this.error = 'Drawing is unavailable in this browser.';
      return;
    }
    this.ctx = context;
    this.clear();
  }

  private position(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * this.canvas.width / rect.width,
      y: (event.clientY - rect.top) * this.canvas.height / rect.height,
    };
  }

  private down(event: PointerEvent): void {
    if (!this.ctx || this.pointer !== null || event.button !== 0) return;
    event.preventDefault();
    this.canvas.setPointerCapture(event.pointerId);
    this.pointer = event.pointerId;
    this.last = this.position(event);
    this.stroke(event);
  }

  private stroke(event: PointerEvent): void {
    const point = this.position(event);
    this.pressure = event.pressure || 0.5;
    this.ctx.strokeStyle = this.eraser ? '#ffffff' : this.color;
    this.ctx.lineWidth = this.size * (this.eraser ? 2.4 : 0.4 + this.pressure * 1.2);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(point.x + 0.01, point.y);
    this.ctx.stroke();
    this.last = point;
  }

  private move(event: PointerEvent): void {
    if (event.pointerId !== this.pointer) return;
    const events = event.getCoalescedEvents?.() ?? [];
    for (const sample of events.length ? events : [event]) this.stroke(sample);
  }

  private up(event: PointerEvent): void {
    if (this.pointer !== event.pointerId) return;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.pointer = null;
  }

  private clear(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private async attach(): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        this.canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not save this sketch.')), 'image/png')
      );
      if (!this.isConnected) return;
      const attachment: NoteAttachment = {
        id: uid(), kind: 'sketch', name: 'Sketch', blob, created: Date.now(),
      };
      this.dispatchEvent(new CustomEvent('note-attachment', { detail: attachment, bubbles: true, composed: true }));
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.busy = false;
    }
  }

  render() {
    return html`
      <p>Draw an idea, then add it to your note.</p>
      <div class="toolbar">
        <div class="swatches">
          ${COLORS.map((color) => html`
            <button class="swatch" style="background:${color}" aria-label="Color ${color}"
              aria-pressed="${!this.eraser && this.color === color}"
              @click="${() => { this.color = color; this.eraser = false; }}"></button>
          `)}
        </div>
        <label class="size-control">Brush
          <input type="range" min="1" max="40" .value="${String(this.size)}"
            @input="${(event: Event) => { this.size = Number((event.target as HTMLInputElement).value); }}" />
          <span>${this.size}px</span>
        </label>
        <wa-button appearance="${this.eraser ? 'filled' : 'outlined'}" @click="${() => { this.eraser = !this.eraser; }}">
          <wa-icon slot="prefix" name="eraser"></wa-icon>Eraser
        </wa-button>
        <wa-button appearance="outlined" @click="${this.clear}">Clear sketch</wa-button>
      </div>
      <div class="canvas-wrap">
        <canvas width="1200" height="800" aria-label="Sketch canvas. Draw using a mouse, touch, or pen."
          @pointerdown="${this.down}" @pointermove="${this.move}" @pointerup="${this.up}"
          @pointercancel="${this.up}" @lostpointercapture="${this.up}"></canvas>
        <div class="pressure-badge">pressure ${this.pressure.toFixed(2)}</div>
      </div>
      <p class="hint">Use a pen for pressure-sensitive strokes. Your sketch stays intact when the window resizes.</p>
      ${this.error ? html`<p role="alert">${this.error}</p>` : nothing}
      <wa-button variant="brand" ?disabled="${this.busy || !!this.error}" @click="${this.attach}">
        <wa-icon slot="prefix" name="plus"></wa-icon>${this.busy ? 'Adding…' : 'Add sketch to note'}
      </wa-button>
    `;
  }
}
