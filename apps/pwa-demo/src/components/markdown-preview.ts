import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked } from 'marked';
import createDOMPurify from 'dompurify';

// Marked supplies GFM (tables, fenced code, task lists); DOMPurify is the
// boundary between note content and HTML, including imported/shared notes.
const markdown = new Marked({ gfm: true, async: false });
const sanitizer = createDOMPurify(window);
sanitizer.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof HTMLAnchorElement) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  if (node instanceof HTMLInputElement) {
    node.setAttribute('type', 'checkbox');
    node.setAttribute('disabled', '');
  }
  if (node instanceof HTMLImageElement) {
    node.setAttribute('referrerpolicy', 'no-referrer');
  }
});

@customElement('markdown-preview')
export class MarkdownPreview extends LitElement {
  @property() source = '';

  static styles = css`
    :host { display: block; min-width: 0; }
    article {
      min-height: 260px; box-sizing: border-box; padding: 14px;
      font-size: 1rem; line-height: 1.6; overflow-wrap: anywhere;
    }
    article > :first-child { margin-top: 0; }
    article > :last-child { margin-bottom: 0; }
    .empty { color: var(--wa-color-text-quiet); }
    h1, h2, h3, h4, h5, h6 { line-height: 1.3; margin: 1.4em 0 .6em; }
    h1 { font-size: 1.8em; }
    h2 { font-size: 1.5em; }
    h1, h2 { padding-bottom: .3em; border-bottom: 1px solid var(--wa-color-surface-border); }
    p, ul, ol, blockquote, pre, table { margin: 0 0 1em; }
    ul, ol { padding-left: 1.8em; }
    li + li { margin-top: .25em; }
    li > p { margin: .5em 0; }
    blockquote { padding: 0 1em; border-left: 4px solid var(--wa-color-surface-border); color: var(--wa-color-text-quiet); }
    code { font-family: ui-monospace, monospace; font-size: .9em; background: var(--wa-color-surface-lowered); border-radius: 4px; padding: .15em .35em; }
    pre { overflow-x: auto; padding: 14px; border-radius: 8px; background: var(--wa-color-surface-lowered); }
    pre code { padding: 0; background: none; overflow-wrap: normal; }
    table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
    th, td { padding: 8px 12px; border: 1px solid var(--wa-color-surface-border); }
    th { background: var(--wa-color-surface-lowered); }
    img { max-width: 100%; height: auto; }
    a { color: var(--wa-color-text-link, #0969da); text-decoration: underline; }
    a:focus-visible { outline: 2px solid var(--wa-color-brand); outline-offset: 3px; }
    hr { border: 0; border-top: 1px solid var(--wa-color-surface-border); margin: 1.5em 0; }
    input[type='checkbox'] { margin-right: .5em; }
  `;

  render() {
    if (!this.source.trim()) {
      return html`<article class="empty">Nothing to preview yet.</article>`;
    }
    const rendered = markdown.parse(this.source, { async: false });
    const safe = sanitizer.sanitize(rendered, {
      ALLOWED_TAGS: [
        'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'del', 's', 'blockquote', 'ul', 'ol', 'li',
        'pre', 'code', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'input', 'details', 'summary', 'sup', 'sub', 'kbd',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'start', 'align', 'type', 'checked', 'disabled'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    });
    return html`<article>${unsafeHTML(safe)}</article>`;
  }
}
