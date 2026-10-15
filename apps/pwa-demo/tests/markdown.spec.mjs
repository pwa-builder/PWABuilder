import { test, expect } from '@playwright/test';

const markdown = `# A notebook with Markdown

Some **bold**, *italic*, ~~old~~, and \`inline code\`.

> A useful quotation

- First item
- Second item

1. Ordered item
2. Another item

- [x] Finished
- [ ] Still to do

| Tool | Purpose |
| --- | --- |
| Nimbus | Keep ideas |

\`\`\`js
const example = '<script>not executable</script>';
\`\`\`

[PWABuilder](https://www.pwabuilder.com)
`;

for (const url of ['http://127.0.0.1:4177/', 'http://127.0.0.1:4176/PWABuilder/']) {
  test.describe(`Markdown at ${url}`, () => {
    test('Write/Preview renders GFM, preserves the source, and works offline', async ({ page }) => {
      await page.goto(url);
      const write = page.getByRole('tab', { name: 'Write', exact: true });
      const preview = page.getByRole('tab', { name: 'Preview', exact: true });
      const body = page.getByRole('textbox', { name: 'Note text', exact: true });
      await expect(write).toHaveAttribute('aria-selected', 'true');
      await page.getByRole('textbox', { name: 'Note title', exact: true }).fill('Markdown sample');
      await body.fill(markdown);
      await preview.click();
      await expect(preview).toHaveAttribute('aria-selected', 'true');
      await expect(body).toBeHidden();
      const rendered = page.locator('markdown-preview');
      await expect(rendered.getByRole('heading', { level: 1 })).toHaveText('A notebook with Markdown');
      await expect(rendered.locator('strong')).toHaveText('bold');
      await expect(rendered.locator('em')).toHaveText('italic');
      await expect(rendered.locator('del')).toHaveText('old');
      await expect(rendered.locator('blockquote')).toContainText('A useful quotation');
      await expect(rendered.locator('ol li')).toHaveCount(2);
      await expect(rendered.getByRole('table')).toContainText('Keep ideas');
      await expect(rendered.locator('pre code')).toContainText('<script>not executable</script>');
      const checkboxes = rendered.getByRole('checkbox');
      await expect(checkboxes).toHaveCount(2);
      await expect(checkboxes.first()).toBeChecked();
      await expect(checkboxes.first()).toBeDisabled();
      await expect(checkboxes.last()).not.toBeChecked();
      const link = rendered.getByRole('link', { name: 'PWABuilder' });
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await write.click();
      await expect(body).toHaveValue(markdown);
      await body.fill(`${markdown}\n## A new thought`);
      await preview.click();
      await expect(rendered.getByRole('heading', { name: 'A new thought' })).toBeVisible();
      await preview.press('ArrowLeft');
      await expect(write).toHaveAttribute('aria-selected', 'true');
      await expect(write).toBeFocused();
      await write.press('ArrowRight');
      await expect(preview).toHaveAttribute('aria-selected', 'true');
      await expect(preview).toBeFocused();
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.waitForFunction(() =>
        document.querySelector('app-index').shadowRoot.querySelector('app-notes').shadowRoot.querySelector('.save-state').textContent === 'Saved on this device');
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      await page.context().setOffline(true);
      await page.reload();
      await expect(body).toHaveValue(`${markdown}\n## A new thought`);
      await preview.click();
      await expect(rendered.getByRole('heading', { name: 'A new thought' })).toBeVisible();
      await page.context().setOffline(false);
    });

    test('empty previews and switching notes never leak rendered content', async ({ page }) => {
      await page.goto(url);
      const body = page.getByRole('textbox', { name: 'Note text', exact: true });
      await page.getByRole('textbox', { name: 'Note title', exact: true }).fill('First Markdown note');
      await body.fill('# First note heading');
      await page.getByRole('tab', { name: 'Preview', exact: true }).click();
      await expect(page.locator('markdown-preview')).toContainText('First note heading');
      await page.getByRole('button', { name: 'New note', exact: true }).click();
      await expect(page.getByRole('tab', { name: 'Write', exact: true })).toHaveAttribute('aria-selected', 'true');
      await expect(body).toHaveValue('');
      await page.getByRole('tab', { name: 'Preview', exact: true }).click();
      await expect(page.locator('markdown-preview')).toHaveText('Nothing to preview yet.');
      await page.locator('.note-item').filter({ hasText: 'First Markdown note' }).click();
      await expect(body).toHaveValue('# First note heading');
      await expect(page.getByRole('tab', { name: 'Write', exact: true })).toHaveAttribute('aria-selected', 'true');
    });

    test('preview strips executable HTML without changing the note text', async ({ page }) => {
      await page.goto(url);
      const hostile = `# Safe heading
<script>window.markdownExecuted = true</script>
<img src="data:image/png;base64,broken" onerror="window.markdownExecuted = true">
<svg onload="window.markdownExecuted = true"><script>alert(1)</script></svg>
<iframe srcdoc="<script>alert(1)</script>"></iframe>
<style>body { display: none; }</style>
<a href="javascript:alert(1)" onclick="window.markdownExecuted = true">Unsafe link</a>
[Bad scheme](javascript:alert%281%29)
<input type="text" autofocus onfocus="window.markdownExecuted = true">
<p id="note-editor" style="position:fixed">A paragraph</p>`;
      const body = page.getByRole('textbox', { name: 'Note text', exact: true });
      await body.fill(hostile);
      await page.getByRole('tab', { name: 'Preview', exact: true }).click();
      const rendered = page.locator('markdown-preview');
      await expect(rendered.getByRole('heading', { name: 'Safe heading' })).toBeVisible();
      await expect(rendered.locator('script, style, svg, iframe, object, embed, form')).toHaveCount(0);
      const unsafeAttributes = await rendered.locator('*').evaluateAll((nodes) =>
        nodes.flatMap((node) => [...node.attributes].filter((attribute) =>
          /^on/i.test(attribute.name) || ['style', 'id', 'autofocus', 'srcdoc'].includes(attribute.name) ||
          /^javascript:/i.test(attribute.value)).map((attribute) => attribute.name))
      );
      expect(unsafeAttributes).toEqual([]);
      await expect(rendered.locator('input')).toHaveAttribute('type', 'checkbox');
      await expect(rendered.locator('input')).toBeDisabled();
      expect(await page.evaluate(() => window.markdownExecuted)).toBeUndefined();
      await page.getByRole('tab', { name: 'Write', exact: true }).click();
      await expect(body).toHaveValue(hostile);
    });
  });
}
