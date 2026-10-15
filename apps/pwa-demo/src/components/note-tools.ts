import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { formatBytes, getStorageInfo, requestPersistentStorage } from '../utils/pwa';
import type { NoteRecord } from '../utils/db';

interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
}

interface RecognitionResultEvent extends Event {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

const speechWindow = window as Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
const devices = navigator as Navigator & {
  contacts?: { select(fields: string[], options: { multiple: boolean }): Promise<Array<{ name?: string[]; email?: string[]; tel?: string[] }>> };
};

@customElement('note-tools')
export class NoteTools extends LitElement {
  @property({ attribute: false }) note!: NoteRecord;
  @state() private message = '';
  @state() private error = '';
  @state() private listening = false;
  @state() private speaking = false;
  @state() private awake = false;
  @state() private busy = false;
  private recognition?: Recognition;
  private lock?: WakeLockSentinel;

  static styles = css`
    :host { display: block; }
    .tools { display: flex; flex-wrap: wrap; gap: 8px; }
    p { font-size: .85rem; line-height: 1.5; color: var(--wa-color-text-quiet); }
    [role='alert'] { color: var(--wa-color-danger-on-quiet, #b42318); }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.recognition?.abort();
    if (this.speaking) speechSynthesis.cancel();
    void this.lock?.release().catch((error: unknown) => console.warn('Nimbus wake lock release failed', error));
  }

  private async run(action: () => void | Promise<void>): Promise<void> {
    this.error = '';
    this.message = '';
    this.busy = true;
    try {
      await action();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.error = error instanceof Error ? error.message : String(error);
      }
    } finally {
      this.busy = false;
    }
  }

  private appendText(text: string): void {
    if (!this.isConnected) return;
    this.dispatchEvent(new CustomEvent('note-append', {
      detail: { id: this.note.id, text }, bubbles: true, composed: true,
    }));
  }

  private dictate(): void {
    if (this.listening) {
      this.recognition?.stop();
      return;
    }
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) return;
    const recognition = new Constructor();
    this.recognition = recognition;
    recognition.lang = navigator.language;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.addEventListener('result', (event: Event) => {
      const result = event as RecognitionResultEvent;
      for (let i = result.resultIndex; i < result.results.length; i++) {
        if (result.results[i].isFinal) this.appendText(result.results[i][0].transcript);
      }
    });
    recognition.addEventListener('error', (event: Event) => {
      const { error } = event as Event & { error: string };
      if (this.isConnected && error !== 'aborted') this.error = `Dictation stopped: ${error}. You can keep typing.`;
      this.listening = false;
    });
    recognition.addEventListener('end', () => { this.listening = false; });
    recognition.start();
    this.listening = true;
    this.message = 'Listening. Final phrases are added to this note.';
  }

  private readAloud(): void {
    if (this.speaking) {
      speechSynthesis.cancel();
      this.speaking = false;
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${this.note.title}. ${this.note.body}`);
    utterance.lang = navigator.language;
    utterance.onend = () => { this.speaking = false; };
    utterance.onerror = (event) => {
      this.speaking = false;
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        this.error = `Read aloud stopped: ${event.error}.`;
      }
    };
    speechSynthesis.speak(utterance);
    this.speaking = true;
  }

  private async locate(): Promise<void> {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 })
    );
    if (!this.isConnected) return;
    this.dispatchEvent(new CustomEvent('note-location', {
      detail: { id: this.note.id, location: { lat: position.coords.latitude, lon: position.coords.longitude } },
      bubbles: true, composed: true,
    }));
    this.message = 'Location added to this note.';
  }

  private async contact(): Promise<void> {
    const contacts = await devices.contacts!.select(['name', 'email', 'tel'], { multiple: true });
    const text = contacts.map((contact) =>
      [...(contact.name ?? []), ...(contact.email ?? []), ...(contact.tel ?? [])].join(' · ')
    ).join('\n');
    if (text) this.appendText(text);
  }

  private async toggleAwake(): Promise<void> {
    if (this.lock && !this.lock.released) {
      await this.lock.release();
      return;
    }
    const lock = await navigator.wakeLock.request('screen');
    if (!this.isConnected) {
      await lock.release();
      return;
    }
    this.lock = lock;
    this.awake = true;
    lock.addEventListener('release', () => { this.awake = false; });
    this.message = 'Screen stays awake while this note is open and Nimbus is visible.';
  }

  private async notify(): Promise<void> {
    if (await Notification.requestPermission() !== 'granted') {
      throw new Error('Notifications are not allowed. Enable them in your browser settings to use this action.');
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.active) throw new Error('Notifications need the Nimbus service worker. Reload the production app and try again.');
    await registration.showNotification(this.note.title || 'Nimbus note', {
      body: this.note.body.slice(0, 160) || 'Open this note in Nimbus.',
      icon: `${import.meta.env.BASE_URL}assets/icons/icon_192.png`,
      tag: `nimbus-note-${this.note.id}`,
      data: `${import.meta.env.BASE_URL}?note=${encodeURIComponent(this.note.id)}`,
    });
    this.message = 'Notification sent now. Tap it to return to this note.';
  }

  private async storage(): Promise<void> {
    const persisted = await requestPersistentStorage();
    const info = await getStorageInfo();
    this.message = `${persisted ? 'Persistent storage enabled.' : 'Your browser did not grant persistent storage; export important notes as backups.'}${info ? ` Nimbus uses ${formatBytes(info.usage)} of ${formatBytes(info.quota)} available.` : ''}`;
  }

  render() {
    return html`
      <p>Tools for this note. Availability depends on your browser and device.</p>
      <div class="tools">
        <wa-button ?disabled="${this.busy || !(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition)}"
          @click="${() => this.run(() => this.dictate())}">
          <wa-icon slot="prefix" name="microphone"></wa-icon>${this.listening ? 'Stop dictation' : 'Dictate'}
        </wa-button>
        <wa-button ?disabled="${this.busy || !('speechSynthesis' in window)}"
          @click="${() => this.run(() => this.readAloud())}">
          <wa-icon slot="prefix" name="volume-high"></wa-icon>${this.speaking ? 'Stop reading' : 'Read aloud'}
        </wa-button>
        <wa-button ?disabled="${this.busy || !navigator.geolocation}" @click="${() => this.run(() => this.locate())}">
          <wa-icon slot="prefix" name="location-dot"></wa-icon>Add location
        </wa-button>
        <wa-button ?disabled="${this.busy || !devices.contacts}" @click="${() => this.run(() => this.contact())}">
          <wa-icon slot="prefix" name="address-book"></wa-icon>Insert contact
        </wa-button>
        <wa-button ?disabled="${this.busy || !navigator.wakeLock}" @click="${() => this.run(() => this.toggleAwake())}">
          <wa-icon slot="prefix" name="lightbulb"></wa-icon>${this.awake ? 'Let screen sleep' : 'Keep screen awake'}
        </wa-button>
        <wa-button ?disabled="${this.busy || !('Notification' in window) || !navigator.serviceWorker}"
          @click="${() => this.run(() => this.notify())}">
          <wa-icon slot="prefix" name="bell"></wa-icon>Notify me now
        </wa-button>
        <wa-button ?disabled="${this.busy || !navigator.storage?.persist}" @click="${() => this.run(() => this.storage())}">
          <wa-icon slot="prefix" name="database"></wa-icon>Protect local notes
        </wa-button>
      </div>
      <p>Dictation may use your browser’s online speech service. Location and contacts are requested only when you choose them. Notifications are immediate, not scheduled reminders.</p>
      ${this.message ? html`<p role="status">${this.message}</p>` : nothing}
      ${this.error ? html`<p role="alert">${this.error}</p>` : nothing}
    `;
  }
}
