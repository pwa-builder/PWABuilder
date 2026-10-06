import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { adminRoute } from './admin-route.ts';

type Fields = Record<string, unknown>;

export interface PageNavigation {
  page: number;
  canPrevious: boolean;
  canNext: boolean;
  previous: () => void;
  next: () => void;
}

export interface DashboardNavigation {
  analysis: PageNavigation;
  package: PageNavigation;
}

function fields(value: unknown): Fields {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Fields : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 8192) : 'Not available';
}

function items(value: unknown): unknown[] {
  return Array.isArray(value) ? value.slice(0, 100) : [];
}

function number(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'Not available';
}

function presence(value: unknown): string {
  return value === true ? 'Yes' : value === false ? 'No' : 'Not available';
}

function enumLabel(value: unknown, labels: readonly string[]): string {
  return typeof value === 'number' && Number.isInteger(value) ? labels[value] || 'Unknown'
    : typeof value === 'string' && labels.includes(value) ? value : 'Unknown';
}

const capabilityNames = [
  'HasManifest', 'Name', 'Id', 'ShortName', 'Description', 'BackgroundColor', 'Shortcuts',
  'Categories', 'Icons', 'ThemeColor', 'Scope', 'ScopeExtensions', 'Display', 'Orientation',
  'Language', 'Direction', 'Screenshots', 'FileHandlers', 'LaunchHandler', 'PreferRelatedApplication',
  'RelatedApplications', 'ProtocolHandlers', 'ShareTarget', 'IarcRatingId', 'DisplayOverride',
  'WindowControlsOverlay', 'TabbedDisplay', 'NoteTaking', 'StartUrl', 'Widgets', 'EdgeSidePanel',
  'IconsAreFetchable', 'IconTypesAreValid', 'IconSizesAreValid', 'IconTypesAreNotIcos',
  'ImagesAreNotBase64Encoded', 'HasSquare192x192PngAnyPurposeIcon', 'HasSquare512x512PngAnyPurposeIcon',
  'ScreenshotsAreFetchable', 'ScreenshotTypesAreValid', 'ScreenshotSizesAreValid', 'ShortcutIconsAreFetchable',
  'ShortcutIconTypesAreValid', 'ShortcutIconSizesAreValid', 'HasWideScreenshot', 'HasNarrowScreenshot',
  'HasServiceWorker', 'ServiceWorkerIsNotEmpty', 'PeriodicSync', 'BackgroundSync', 'PushNotifications',
  'OfflineSupport', 'HasHttps', 'ServesHtml',
] as const;

function origin(value: unknown): string {
  try {
    const url = new URL(text(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : 'Not available';
  } catch {
    return 'Not available';
  }
}

function row(label: string, value: string): TemplateResult {
  return html`<dt>${label}</dt><dd>${value}</dd>`;
}

function messages(label: string, values: unknown): TemplateResult {
  // These are the backend's bounded, sanitized support fields, never raw job objects.
  return html`<h3>${label}</h3><ul>${items(values).map(value => html`<li><pre>${text(value)}</pre></li>`)}</ul>`;
}

function detailLink(kind: 'analyses' | 'package-jobs', id: unknown): TemplateResult | typeof nothing {
  const path = typeof id === 'string' ? `/admin/${kind}/${encodeURIComponent(id)}` : '';
  return adminRoute(path) ? html`<a href=${path}>View diagnostics</a>` : nothing;
}

export function renderAnalysis(value: unknown, detail: boolean): TemplateResult {
  const data = fields(value);
  return html`<article>
    <h3>Analysis ${text(data.id)}</h3>
    <dl>
      ${row('Site origin', origin(data.siteOrigin))}
      ${row('Status', enumLabel(data.status, ['Queued', 'Processing', 'Completed', 'Failed']))}
      ${row('Created', text(data.createdAt))}
      ${row('Updated', text(data.updatedAt))}
      ${row('Failure summary', text(data.failureSummary))}
    </dl>
    ${detail ? html`
      <h3>Checks</h3>
      <ul>${items(data.checks).map(value => {
        const check = fields(value);
        return html`<li>${enumLabel(check.id, capabilityNames)}:
          ${enumLabel(check.status, ['InProgress', 'Skipped', 'Passed', 'Failed'])}</li>`;
      })}</ul>
      <h3>Sanitized error</h3><pre>${text(data.error)}</pre>
      ${messages('Sanitized logs', data.logs)}
    ` : detailLink('analyses', data.id)}
  </article>`;
}

export function renderPackage(value: unknown, detail: boolean): TemplateResult {
  const data = fields(value);
  const config = fields(data.configuration);
  return html`<article>
    <h3>Package ${text(data.supportReference)}</h3>
    <dl>
      ${row('Site origin', origin(data.siteOrigin))}
      ${row('Status', text(data.status))}
      ${row('Created', text(data.createdAt))}
      ${row('Updated', text(data.updatedAt))}
      ${row('Retry count', number(data.retryCount))}
      ${row('Failure summary', text(data.failureSummary))}
    </dl>
    ${detail ? html`
      <h3>Configuration</h3><dl>
        ${row('Name', text(config.name))}
        ${row('Package ID', text(config.packageId))}
        ${row('Version', text(config.appVersion))}
        ${row('Version code', number(config.appVersionCode))}
        ${row('Minimum SDK', number(config.minSdkVersion))}
        ${row('Signing mode', enumLabel(config.signingMode, ['new', 'mine', 'none', 'unknown']))}
        ${row('Uploaded key present', presence(config.hasUploadedKey))}
        ${row('Key password present', presence(config.hasKeyPassword))}
        ${row('Store password present', presence(config.hasStorePassword))}
      </dl>
      ${messages('Stages', data.stages)}
      ${messages('Sanitized errors', data.errors)}
      ${messages('Sanitized logs', data.logs)}
    ` : detailLink('package-jobs', data.supportReference)}
  </article>`;
}

function pageControls(label: string, count: number, navigation?: PageNavigation): TemplateResult {
  return html`<nav aria-label=${label}>
    <wa-button ?disabled=${!navigation?.canPrevious} @click=${navigation?.previous}>Previous</wa-button>
    <p>Page ${navigation?.page || 1} · ${count} ${count === 1 ? 'failure' : 'failures'} on this page</p>
    <wa-button ?disabled=${!navigation?.canNext} @click=${navigation?.next}>Next</wa-button>
  </nav>`;
}

export function renderDashboard(value: unknown, navigation?: DashboardNavigation): TemplateResult {
  const data = fields(value);
  const analyses = items(data.analyses);
  const packages = items(data.packages);
  return html`
    <p>Retained failures from the last 14 days, up to 50 per page. Package history is limited to the latest 500 indexed failures.
      Records may expire or change while browsing.</p>
    <section aria-labelledby="analysis-failures">
      <h2 id="analysis-failures">Recent analysis failures</h2>
      ${pageControls('Analysis failure pages', analyses.length, navigation?.analysis)}
      ${analyses.length ? analyses.map(value => renderAnalysis(value, false)) : html`<p>No analysis failures on this page.</p>`}
    </section>
    <section aria-labelledby="package-failures">
      <h2 id="package-failures">Recent package failures</h2>
      ${pageControls('Package failure pages', packages.length, navigation?.package)}
      ${packages.length ? packages.map(value => renderPackage(value, false)) : html`<p>No package failures on this page.</p>`}
    </section>
  `;
}
