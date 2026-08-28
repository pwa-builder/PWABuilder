import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';

import { powersStyles } from './app-powers.styles';
import { styles as sharedStyles } from '../../shared.styles';

type Tone = 'ok' | 'err' | 'info';

interface RunContext {
  set: (message: string, tone?: Tone) => void;
  addCleanup: (fn: () => void) => void;
}

interface Power {
  id: string;
  title: string;
  icon: string;
  iconFamily?: string;
  blurb: string;
  supported: () => boolean;
  run: (ctx: RunContext) => void | Promise<void>;
}

// A small helper so demos can reference vendor-prefixed / unshipped globals
// without fighting the DOM typings. Every access is feature-detected first.
const w = window as any;
const nav = navigator as any;

const powers: Power[] = [
  {
    id: 'share',
    title: 'Web Share',
    icon: 'share-nodes',
    blurb: 'Invoke the native OS share sheet to send a link to any app.',
    supported: () => !!navigator.share,
    run: async ({ set }) => {
      await navigator.share({
        title: 'Nimbus',
        text: 'Check out this PWA built with PWABuilder!',
        url: location.href,
      });
      set('Shared via the system share sheet.', 'ok');
    },
  },
  {
    id: 'clipboard',
    title: 'Async Clipboard',
    icon: 'clipboard',
    blurb: 'Write to and read back from the system clipboard.',
    supported: () => !!(navigator.clipboard && navigator.clipboard.writeText),
    run: async ({ set }) => {
      const stamp = `Nimbus 👋 ${new Date().toLocaleTimeString()}`;
      await navigator.clipboard.writeText(stamp);
      let read = '(read not permitted)';
      try {
        read = await navigator.clipboard.readText();
      } catch {
        /* read may be blocked; write still worked */
      }
      set(`Copied. Clipboard now holds: “${read}”`, 'ok');
    },
  },
  {
    id: 'vibration',
    title: 'Vibration',
    icon: 'mobile-screen',
    blurb: 'Play a haptic pattern on devices with a vibration motor.',
    supported: () => 'vibrate' in navigator,
    run: ({ set }) => {
      navigator.vibrate([120, 60, 120, 60, 240]);
      set('Buzzed a pattern (feel it on a phone).', 'ok');
    },
  },
  {
    id: 'battery',
    title: 'Battery Status',
    icon: 'battery-three-quarters',
    blurb: 'Read live charge level and charging state from the device.',
    supported: () => 'getBattery' in navigator,
    run: async ({ set, addCleanup }) => {
      const b = await nav.getBattery();
      const show = () =>
        set(
          `${Math.round(b.level * 100)}% · ${b.charging ? 'charging ⚡' : 'on battery'}`,
          'ok'
        );
      show();
      b.addEventListener('levelchange', show);
      b.addEventListener('chargingchange', show);
      addCleanup(() => {
        b.removeEventListener('levelchange', show);
        b.removeEventListener('chargingchange', show);
      });
    },
  },
  {
    id: 'network',
    title: 'Network Information',
    icon: 'gauge-high',
    blurb: 'Inspect the effective connection type and estimated bandwidth.',
    supported: () => 'connection' in navigator,
    run: ({ set, addCleanup }) => {
      const c = nav.connection;
      const show = () =>
        set(
          `${c.effectiveType} · ~${c.downlink} Mbps · RTT ${c.rtt}ms${c.saveData ? ' · Data Saver' : ''}`,
          'ok'
        );
      show();
      c.addEventListener('change', show);
      addCleanup(() => c.removeEventListener('change', show));
    },
  },
  {
    id: 'geolocation',
    title: 'Geolocation',
    icon: 'location-dot',
    blurb: 'Resolve the device’s current latitude and longitude.',
    supported: () => 'geolocation' in navigator,
    run: ({ set }) => {
      set('Locating…', 'info');
      navigator.geolocation.getCurrentPosition(
        (p) =>
          set(
            `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)} (±${Math.round(p.coords.accuracy)}m)`,
            'ok'
          ),
        (e) => set(e.message, 'err'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'bell',
    blurb: 'Request permission and post a notification through the service worker.',
    supported: () => 'Notification' in window,
    run: async ({ set }) => {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        set(`Permission ${perm}.`, 'err');
        return;
      }
      const reg = await navigator.serviceWorker?.ready;
      const opts: NotificationOptions = {
        body: 'This notification came from Nimbus’ service worker.',
        icon: '/assets/icons/icon_192.png',
        badge: '/assets/icons/icon_48.png',
      };
      if (reg) {
        await reg.showNotification('Hello from Nimbus', opts);
      } else {
        new Notification('Hello from Nimbus', opts);
      }
      set('Notification posted.', 'ok');
    },
  },
  {
    id: 'wakelock',
    title: 'Screen Wake Lock',
    icon: 'lightbulb',
    blurb: 'Keep the screen awake, then auto-release after 20 seconds.',
    supported: () => 'wakeLock' in navigator,
    run: async ({ set, addCleanup }) => {
      const lock = await nav.wakeLock.request('screen');
      set('Screen will stay awake for 20s…', 'ok');
      const timer = setTimeout(() => {
        lock.release();
        set('Wake lock released.', 'info');
      }, 20000);
      addCleanup(() => {
        clearTimeout(timer);
        lock.release().catch(() => {});
      });
    },
  },
  {
    id: 'orientation',
    title: 'Device Orientation',
    icon: 'compass',
    blurb: 'Stream tilt data from the device’s motion sensors.',
    supported: () => 'DeviceOrientationEvent' in window,
    run: async ({ set, addCleanup }) => {
      const DOE = w.DeviceOrientationEvent;
      if (typeof DOE.requestPermission === 'function') {
        const perm = await DOE.requestPermission();
        if (perm !== 'granted') {
          set('Motion permission denied.', 'err');
          return;
        }
      }
      const handler = (e: DeviceOrientationEvent) =>
        set(
          `α ${Math.round(e.alpha ?? 0)}° · β ${Math.round(e.beta ?? 0)}° · γ ${Math.round(e.gamma ?? 0)}°`,
          'ok'
        );
      window.addEventListener('deviceorientation', handler);
      set('Tilt your device…', 'info');
      addCleanup(() => window.removeEventListener('deviceorientation', handler));
    },
  },
  {
    id: 'tts',
    title: 'Text to Speech',
    icon: 'volume-high',
    blurb: 'Speak text aloud with the Web Speech synthesis engine.',
    supported: () => 'speechSynthesis' in window,
    run: ({ set }) => {
      const u = new SpeechSynthesisUtterance(
        'Hello! I am Nimbus, a progressive web app built with PWA Builder.'
      );
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      set('Speaking…', 'ok');
    },
  },
  {
    id: 'stt',
    title: 'Speech Recognition',
    icon: 'microphone',
    blurb: 'Transcribe a few seconds of speech to text on-device.',
    supported: () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    run: ({ set, addCleanup }) => {
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        const text = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        set(`“${text}”`, 'ok');
      };
      rec.onerror = (e: any) => set(`Error: ${e.error}`, 'err');
      rec.start();
      set('Listening — say something…', 'info');
      addCleanup(() => rec.stop());
    },
  },
  {
    id: 'contacts',
    title: 'Contact Picker',
    icon: 'address-book',
    blurb: 'Let the user pick a contact without granting full address-book access.',
    supported: () => 'contacts' in navigator && 'ContactsManager' in window,
    run: async ({ set }) => {
      const picked = await nav.contacts.select(['name', 'email'], {
        multiple: false,
      });
      if (!picked.length) {
        set('No contact selected.', 'info');
        return;
      }
      const name = picked[0].name?.[0] ?? '(no name)';
      set(`Picked: ${name}`, 'ok');
    },
  },
  {
    id: 'badge',
    title: 'App Badging',
    icon: 'circle-dot',
    blurb: 'Set a count badge on the installed app icon, then clear it.',
    supported: () => 'setAppBadge' in navigator,
    run: async ({ set }) => {
      await nav.setAppBadge(7);
      set('Badge set to 7 — clearing in 4s (install the app to see it).', 'ok');
      setTimeout(() => nav.clearAppBadge(), 4000);
    },
  },
  {
    id: 'fullscreen',
    title: 'Fullscreen',
    icon: 'expand',
    blurb: 'Toggle the whole document into and out of fullscreen.',
    supported: () => !!document.documentElement.requestFullscreen,
    run: async ({ set }) => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        set('Exited fullscreen.', 'info');
      } else {
        await document.documentElement.requestFullscreen();
        set('Entered fullscreen — run again to exit.', 'ok');
      }
    },
  },
  {
    id: 'idle',
    title: 'Idle Detection',
    icon: 'user-clock',
    blurb: 'Detect when the user goes idle and the screen locks.',
    supported: () => 'IdleDetector' in window,
    run: async ({ set, addCleanup }) => {
      const perm = await w.IdleDetector.requestPermission();
      if (perm !== 'granted') {
        set('Idle permission denied.', 'err');
        return;
      }
      const detector = new w.IdleDetector();
      const show = () =>
        set(`user: ${detector.userState} · screen: ${detector.screenState}`, 'ok');
      detector.addEventListener('change', show);
      const controller = new AbortController();
      await detector.start({ threshold: 60000, signal: controller.signal });
      show();
      addCleanup(() => controller.abort());
    },
  },
  {
    id: 'bluetooth',
    title: 'Web Bluetooth',
    icon: 'bluetooth',
    iconFamily: 'brands',
    blurb: 'Discover and connect to nearby Bluetooth Low Energy devices.',
    supported: () => 'bluetooth' in navigator,
    run: async ({ set }) => {
      const device = await nav.bluetooth.requestDevice({ acceptAllDevices: true });
      set(`Selected device: ${device.name || device.id}`, 'ok');
    },
  },
  {
    id: 'nfc',
    title: 'Web NFC',
    icon: 'wifi',
    blurb: 'Scan nearby NFC tags (Android Chrome).',
    supported: () => 'NDEFReader' in window,
    run: async ({ set, addCleanup }) => {
      const reader = new w.NDEFReader();
      const controller = new AbortController();
      await reader.scan({ signal: controller.signal });
      reader.onreading = (e: any) =>
        set(`Read tag: ${e.serialNumber || '(records received)'}`, 'ok');
      set('Hold an NFC tag near your device…', 'info');
      addCleanup(() => controller.abort());
    },
  },
  {
    id: 'gamepad',
    title: 'Gamepad',
    icon: 'gamepad',
    blurb: 'Detect connected game controllers and read live input.',
    supported: () => 'getGamepads' in navigator,
    run: ({ set, addCleanup }) => {
      let raf = 0;
      const poll = () => {
        const pads = navigator.getGamepads().filter(Boolean);
        if (pads.length) {
          const pad = pads[0]!;
          const pressed = pad.buttons.filter((b) => b.pressed).length;
          set(`${pad.id} · ${pressed} button(s) down`, 'ok');
        } else {
          set('Connect a controller and press a button…', 'info');
        }
        raf = requestAnimationFrame(poll);
      };
      poll();
      addCleanup(() => cancelAnimationFrame(raf));
    },
  },
  {
    id: 'audio',
    title: 'Web Audio',
    icon: 'wave-square',
    blurb: 'Synthesize a tone with the Web Audio API oscillator graph.',
    supported: () => 'AudioContext' in window || 'webkitAudioContext' in window,
    run: ({ set }) => {
      const Ctx = w.AudioContext || w.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 523.25;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.62);
      osc.onended = () => ctx.close();
      set('Played a C5 tone.', 'ok');
    },
  },
  {
    id: 'mediasession',
    title: 'Media Session',
    icon: 'compact-disc',
    blurb: 'Publish now-playing metadata for OS media controls and lock screens.',
    supported: () => 'mediaSession' in navigator,
    run: ({ set }) => {
      nav.mediaSession.metadata = new w.MediaMetadata({
        title: 'Nimbus Demo Track',
        artist: 'PWABuilder',
        album: 'What the Web Can Do',
        artwork: [
          { src: '/assets/icons/icon_512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
      for (const action of ['play', 'pause', 'previoustrack', 'nexttrack'] as const) {
        try {
          nav.mediaSession.setActionHandler(action, () => {});
        } catch {
          /* action may be unsupported */
        }
      }
      set('Metadata published to the OS media session.', 'ok');
    },
  },
  {
    id: 'localfonts',
    title: 'Local Font Access',
    icon: 'font',
    blurb: 'Enumerate fonts installed on the device (Chromium desktop).',
    supported: () => 'queryLocalFonts' in window,
    run: async ({ set }) => {
      const fonts = await w.queryLocalFonts();
      set(`Found ${fonts.length} local fonts installed on this device.`, 'ok');
    },
  },
  {
    id: 'backgroundsync',
    title: 'Background Sync',
    icon: 'rotate',
    blurb: 'Queue a request that the service worker replays once you’re back online.',
    supported: () => 'serviceWorker' in navigator && 'SyncManager' in window,
    run: async ({ set }) => {
      try {
        await fetch('/sync-demo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ at: Date.now() }),
        });
        set('Request sent. Go offline and retry — it will be queued & replayed.', 'ok');
      } catch {
        set('Offline: request queued in the service worker for later.', 'info');
      }
    },
  },
];

@customElement('app-powers')
export class AppPowers extends LitElement {
  @state() private results: Record<string, { message: string; tone: Tone }> = {};
  @state() private busy: Record<string, boolean> = {};

  private cleanups = new Set<() => void>();

  static styles = [sharedStyles, powersStyles];

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore cleanup errors */
      }
    });
    this.cleanups.clear();
  }

  private async runPower(power: Power) {
    this.busy = { ...this.busy, [power.id]: true };
    const ctx: RunContext = {
      set: (message, tone = 'ok') => {
        this.results = { ...this.results, [power.id]: { message, tone } };
      },
      addCleanup: (fn) => this.cleanups.add(fn),
    };
    try {
      await power.run(ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.results = {
        ...this.results,
        [power.id]: { message: message || 'Failed.', tone: 'err' },
      };
    } finally {
      this.busy = { ...this.busy, [power.id]: false };
    }
  }

  render() {
    const supportedCount = powers.filter((p) => this.isSupported(p)).length;

    return html`
      <div class="page-head">
        <h1>Superpowers</h1>
        <p>
          A live playground of web platform capabilities. Each card
          feature-detects support and runs a real demo — no native code, no app
          store. ${supportedCount} of ${powers.length} are available in this
          browser right now.
        </p>
      </div>

      <div class="grid">
        ${powers.map((power) => this.renderCard(power))}
      </div>
    `;
  }

  private isSupported(power: Power): boolean {
    try {
      return power.supported();
    } catch {
      return false;
    }
  }

  private renderCard(power: Power) {
    const supported = this.isSupported(power);
    const result = this.results[power.id];
    const busy = this.busy[power.id];

    return html`
      <wa-card>
        <div class="power-card">
          <div class="power-head">
            <div class="ic"><wa-icon name="${power.icon}" family="${power.iconFamily ?? 'classic'}"></wa-icon></div>
            <h3>${power.title}</h3>
          </div>
          <p class="blurb">${power.blurb}</p>
          <div
            class="result ${result ? (result.tone === 'ok' ? 'ok' : result.tone === 'err' ? 'err' : '') : ''}"
          >
            ${result ? result.message : supported ? 'Ready.' : 'Not available in this browser.'}
          </div>
          <div class="power-foot">
            <wa-badge variant="${supported ? 'success' : 'neutral'}" appearance="outlined">
              ${supported ? 'Supported' : 'Unsupported'}
            </wa-badge>
            <wa-button
              size="s"
              variant="brand"
              ?disabled="${!supported || busy}"
              ?loading="${busy}"
              @click="${() => this.runPower(power)}"
            >
              Try it
            </wa-button>
          </div>
        </div>
      </wa-card>
    `;
  }
}
