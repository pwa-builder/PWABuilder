import { html, nothing, type TemplateResult } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { matchRoute, viewPath, type AppRoute, type View } from './utils/routes';

interface AppNavigateEvent extends Event {
  canIntercept: boolean;
  hashChange: boolean;
  downloadRequest: string | null;
  formData: FormData | null;
  navigationType: string;
  destination: { url: string; sameDocument: boolean };
  signal: AbortSignal;
  intercept(options: { handler: () => Promise<void> }): void;
}

const baseURL = import.meta.env.BASE_URL;
const navigation = (window as Window & { navigation?: EventTarget }).navigation;

class Router extends EventTarget {
  private content: TemplateResult | typeof nothing = nothing;
  currentView: View = 'notes';

  constructor() {
    super();
    const url = new URL(location.href);
    const route = this.match(url);
    if (route) void this.activate(route, url);

    if (navigation) {
      navigation.addEventListener('navigate', (event) => this.onNavigate(event as AppNavigateEvent));
    } else {
      // Normal query-string links also work without the Navigation API:
      // the browser loads index.html and owns history/back/forward. Guard
      // in-app links before unloading; beforeunload protects browser controls.
      document.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const link = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);
        if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        if (this.match(new URL(link.href)) && !this.canLeave()) event.preventDefault();
      });
    }
  }

  render(): TemplateResult | typeof nothing {
    return this.content;
  }

  private canLeave(): boolean {
    return window.dispatchEvent(new Event('nimbus-before-navigate', { cancelable: true }));
  }

  private onNavigate(event: AppNavigateEvent): void {
    if (!event.canIntercept || event.hashChange || event.downloadRequest !== null || event.formData) return;
    const url = new URL(event.destination.url);
    const route = this.match(url);
    if (!route) return;

    // Notes consumes share/shortcut parameters with replaceState. That change
    // must not remount the editor, but changing view must still navigate.
    if (event.navigationType === 'replace' && event.destination.sameDocument &&
        route.view === this.currentView && url.pathname === location.pathname) return;

    if (!this.canLeave()) {
      if (event.cancelable) event.preventDefault();
      // For non-cancelable traversals keep the unsaved editor mounted.
      return;
    }
    event.intercept({ handler: () => this.activate(route, url, event.signal) });
  }

  private match(url: URL): AppRoute | undefined {
    return url.origin === location.origin ? matchRoute(url, baseURL) : undefined;
  }

  private async activate(route: AppRoute, url: URL, signal?: AbortSignal): Promise<void> {
    if (route.view === 'about') {
      try {
        await import('./pages/app-about/app-about.js');
      } catch (error) {
        if (signal?.aborted) return;
        console.error('Nimbus could not load About', error);
        this.content = html`<p role="alert">Could not load About. Reload to try again.</p>`;
        this.dispatchEvent(new Event('route-changed'));
        return;
      }
    }
    if (signal?.aborted) return;
    this.currentView = route.view;
    this.content = route.view === 'about'
      ? html`<app-about></app-about>`
      : html`${keyed(url.pathname + url.search, html`<app-notes initial-tool="${route.tool}"></app-notes>`)}`;
    document.title = route.view === 'about' ? 'Nimbus · About' : 'Nimbus';
    this.dispatchEvent(new Event('route-changed'));
  }
}

export const router = new Router();

export function resolveRouterPath(view: View = 'notes'): string {
  return viewPath(baseURL, view);
}
