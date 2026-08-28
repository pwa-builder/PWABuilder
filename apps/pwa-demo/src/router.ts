// A lightweight client-side router built on the web platform Navigation API.
// See https://developer.chrome.com/docs/web-platform/navigation-api/ for details.

import { html, nothing, type TemplateResult } from 'lit';

// URLPattern is used for route matching. Load the polyfill when the browser
// doesn't ship it natively (e.g. older Safari/Firefox).
if (!(globalThis as any).URLPattern) {
  await import('urlpattern-polyfill');
}

const URLPatternCtor: any = (globalThis as any).URLPattern;

export interface Route {
  path: string;
  title?: string;
  render: () => TemplateResult;
  load?: () => Promise<unknown>;
}

export interface RouterConfig {
  routes: Route[];
  fallback?: Route;
}

const baseURL: string = (import.meta as any).env.BASE_URL;

export class Router extends EventTarget {
  readonly routes: Route[];
  private readonly fallback?: Route;
  private content: TemplateResult | typeof nothing = nothing;

  constructor(config: RouterConfig) {
    super();
    this.routes = config.routes;
    this.fallback = config.fallback;

    const navigation = (window as any).navigation;
    if (navigation) {
      navigation.addEventListener('navigate', (event: any) =>
        this.onNavigate(event)
      );
    }

    const url = new URL(window.location.href);
    const route = this.match(url);
    if (route?.load) {
      void this.activate(route);
    } else if (route) {
      this.setContent(route);
    }
  }

  render(): TemplateResult | typeof nothing {
    return this.content;
  }

  private onNavigate(event: any): void {
    if (
      !event.canIntercept ||
      event.hashChange ||
      event.downloadRequest !== null ||
      event.formData
    ) {
      return;
    }

    const url = new URL(event.destination.url);
    if (url.origin !== window.location.origin) {
      return;
    }

    if (!this.match(url)) {
      return;
    }

    event.intercept({
      handler: () => this.activate(this.match(url)!),
    });
  }

  private match(url: URL): Route | undefined {
    const route = this.routes.find((r) =>
      new URLPatternCtor({ pathname: r.path }).test({ pathname: url.pathname })
    );
    return route ?? this.fallback;
  }

  private async activate(route: Route): Promise<void> {
    if (route.load) {
      await route.load();
    }
    this.setContent(route);
    this.dispatchEvent(new CustomEvent('route-changed', { detail: { route } }));
  }

  private setContent(route: Route): void {
    this.content = route.render();
    if (route.title) {
      document.title = route.title;
    }
  }
}

export const router = new Router({
  routes: [
    {
      path: resolveRouterPath(),
      title: 'Nimbus',
      render: () => html`<app-home></app-home>`,
    },
    {
      path: resolveRouterPath('notes'),
      title: 'Nimbus · Notes',
      load: () => import('./pages/app-notes/app-notes.js'),
      render: () => html`<app-notes></app-notes>`,
    },
    {
      path: resolveRouterPath('sketch'),
      title: 'Nimbus · Sketch',
      load: () => import('./pages/app-sketch/app-sketch.js'),
      render: () => html`<app-sketch></app-sketch>`,
    },
    {
      path: resolveRouterPath('capture'),
      title: 'Nimbus · Capture',
      load: () => import('./pages/app-capture/app-capture.js'),
      render: () => html`<app-capture></app-capture>`,
    },
    {
      path: resolveRouterPath('powers'),
      title: 'Nimbus · Superpowers',
      load: () => import('./pages/app-powers/app-powers.js'),
      render: () => html`<app-powers></app-powers>`,
    },
    {
      path: resolveRouterPath('about'),
      title: 'Nimbus · About',
      load: () => import('./pages/app-about/app-about.js'),
      render: () => html`<app-about></app-about>`,
    },
  ],
});

// Resolve a path against whatever Base URL was passed to the vite build.
export function resolveRouterPath(unresolvedPath?: string): string {
  let resolvedPath = baseURL;
  if (unresolvedPath) {
    resolvedPath = resolvedPath + unresolvedPath;
  }
  return resolvedPath;
}
