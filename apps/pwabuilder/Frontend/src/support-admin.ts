import { LitElement, css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import { AdminClient, safeError } from './support/admin-client.ts';
import { adminRoute, callbackPath } from './support/admin-route.ts';
import { renderAnalysis, renderDashboard, renderPackage } from './support/admin-diagnostics.ts';
import type { PageNavigation } from './support/admin-diagnostics.ts';

type Section = 'analysis' | 'package';
interface PagingState {
  current?: string;
  next?: string;
  previous: string[];
}

function cursor(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,3000}$/.test(value) ? value : undefined;
}

function dashboard(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

@customElement('support-admin')
export class SupportAdmin extends LitElement {
  @state() private data: unknown = null;
  @state() private message = '';
  @state() private busy = false;
  @state() private signedIn = false;
  @state() private interactionRequired = false;
  @state() private pathname = window.location.pathname;
  @state() private paging: Record<Section, PagingState> = { analysis: { previous: [] }, package: { previous: [] } };
  private readonly client = new AdminClient();
  private request?: AbortController;
  private generation = 0;
  private readonly onNavigation = (): void => { void this.load(); };
  private readonly onPageHide = (): void => { this.clear(); };
  private readonly onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      this.clear();
      this.message = 'Page restored. Retry to reload private diagnostics.';
    }
  };

  static styles = css`
    :host { display: block; font: 1rem/1.5 system-ui, sans-serif; color: #202030; }
    .content { max-width: 70rem; margin: 2rem auto; padding: 0 1rem; }
    nav { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
    article { border: 1px solid #aaa; border-radius: .5rem; padding: 1rem; margin: 1rem 0; }
    dl { display: grid; grid-template-columns: minmax(8rem, 1fr) 3fr; gap: .4rem 1rem; }
    dt { font-weight: bold; }
    dd { margin: 0; overflow-wrap: anywhere; white-space: pre-line; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; font-size: .9rem; }
    a { color: #4140a0; }
    @media (max-width: 40rem) { dl { display: block; } dd { margin-bottom: .8rem; } }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    // MSAL's silent-renew iframe must not start another diagnostics/auth flow.
    if (window.self !== window.top) {
      return;
    }
    window.addEventListener('popstate', this.onNavigation);
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('pageshow', this.onPageShow);
    void this.load();
  }

  disconnectedCallback(): void {
    this.clear();
    window.removeEventListener('popstate', this.onNavigation);
    window.removeEventListener('pagehide', this.onPageHide);
    window.removeEventListener('pageshow', this.onPageShow);
    super.disconnectedCallback();
  }

  private clear(): number {
    this.request?.abort();
    this.data = null;
    this.paging = { analysis: { previous: [] }, package: { previous: [] } };
    this.busy = false;
    return ++this.generation;
  }

  private async load(): Promise<void> {
    const generation = this.clear();
    this.pathname = window.location.pathname;
    this.message = '';
    this.interactionRequired = false;
    if (!adminRoute(this.pathname) && this.pathname !== callbackPath) {
      this.message = 'This support link is not valid.';
      return;
    }
    this.busy = true;
    const request = new AbortController();
    this.request = request;
    try {
      await this.client.initialize();
      if (generation !== this.generation) {
        return;
      }
      this.pathname = window.location.pathname;
      this.signedIn = this.client.signedIn;
      if (!this.signedIn) {
        this.message = 'Sign in to view private support diagnostics.';
        return;
      }
      const data = await this.client.get(this.pathname, request.signal);
      if (generation === this.generation) {
        this.data = data;
        const page = dashboard(data);
        this.paging = {
          analysis: { current: cursor(page.analysisPageToken), next: cursor(page.analysisContinuationToken), previous: [] },
          package: { current: cursor(page.packagePageToken), next: cursor(page.packageContinuationToken), previous: [] },
        };
      }
    } catch (error: unknown) {
      if (generation === this.generation) {
        this.showError(error);
      }
    } finally {
      if (generation === this.generation) {
        this.busy = false;
      }
    }
  }

  private async changePage(section: Section, forward: boolean): Promise<void> {
    const state = this.paging[section];
    const destination = forward ? state.next : state.previous.at(-1);
    if (this.busy || !state.current || !destination || adminRoute(this.pathname)?.kind !== 'dashboard') {
      return;
    }
    this.request?.abort();
    const generation = ++this.generation;
    const request = new AbortController();
    this.request = request;
    this.busy = true;
    this.message = '';
    try {
      const result = dashboard(await this.client.get('/admin', request.signal, {
        analysisCursor: section === 'analysis' ? destination : this.paging.analysis.current,
        packageCursor: section === 'package' ? destination : this.paging.package.current,
      }));
      if (generation !== this.generation) {
        return;
      }
      const field = section === 'analysis' ? 'analyses' : 'packages';
      this.data = { ...dashboard(this.data), [field]: result[field] };
      this.paging = {
        ...this.paging,
        [section]: {
          current: cursor(result[`${section}PageToken`]),
          next: cursor(result[`${section}ContinuationToken`]),
          previous: forward ? [...state.previous, state.current] : state.previous.slice(0, -1),
        },
      };
    } catch (error: unknown) {
      if (generation === this.generation) {
        this.clear();
        this.showError(error);
      }
    } finally {
      if (generation === this.generation) {
        this.busy = false;
      }
    }
  }

  private pageNavigation(section: Section): PageNavigation {
    const state = this.paging[section];
    return {
      page: state.previous.length + 1,
      canPrevious: !this.busy && !!state.current && state.previous.length > 0,
      canNext: !this.busy && !!state.current && !!state.next,
      previous: (): void => { void this.changePage(section, false); },
      next: (): void => { void this.changePage(section, true); },
    };
  }

  private showError(error: unknown): void {
    const safe = safeError(error);
    this.message = safe.message;
    this.interactionRequired = safe.interactionRequired;
  }

  private async authenticate(signOut: boolean): Promise<void> {
    const generation = this.clear();
    this.busy = true;
    this.message = '';
    if (signOut) {
      this.signedIn = false;
    }
    try {
      if (signOut) {
        await this.client.signOut();
      } else {
        await this.client.signIn(this.pathname);
      }
    } catch (error: unknown) {
      if (generation === this.generation) {
        this.showError(error);
      }
    } finally {
      if (generation === this.generation) {
        this.busy = false;
      }
    }
  }

  private navigate(event: MouseEvent): void {
    const anchor = event.composedPath().find(target => target instanceof HTMLAnchorElement);
    if (!(anchor instanceof HTMLAnchorElement) || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    const route = adminRoute(anchor.getAttribute('href') || '');
    if (route) {
      event.preventDefault();
      this.clear();
      window.history.pushState(null, '', route.pathname);
      void this.load();
    }
  }

  render(): TemplateResult {
    const route = adminRoute(this.pathname);
    return html`<div class="content" @click=${this.navigate}>
      <slot name="heading"></slot>
      <p>Restricted diagnostics. Access is verified by the support API.</p>
      <nav aria-label="Support navigation">
        <a href="/admin">Dashboard</a>
        <wa-button ?disabled=${this.busy} @click=${(): Promise<void> => this.authenticate(false)}>
          ${this.signedIn || this.interactionRequired ? 'Sign in again' : 'Sign in'}
        </wa-button>
        <wa-button ?disabled=${this.busy || !this.signedIn} @click=${(): Promise<void> => this.authenticate(true)}>Sign out</wa-button>
        <wa-button ?disabled=${this.busy} @click=${this.load}>Retry</wa-button>
      </nav>
      <p role="status" aria-live="polite">${this.busy ? 'Loading support diagnostics…' : this.message}</p>
      ${this.data === null ? nothing : route?.kind === 'analysis' ? renderAnalysis(this.data, true)
        : route?.kind === 'package' ? renderPackage(this.data, true) : renderDashboard(this.data, {
          analysis: this.pageNavigation('analysis'), package: this.pageNavigation('package'),
        })}
    </div>`;
  }
}
