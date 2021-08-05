import { html, TemplateResult } from 'lit';

export function BaseTemplate(template: TemplateResult<1>) {
  return html`
    <fast-design-system-provider use-defaults>
      ${template}
    </fast-design-system-provider>
  `;
}
