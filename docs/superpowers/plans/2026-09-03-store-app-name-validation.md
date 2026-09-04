# Store App Name Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow ampersands and colons in Windows, Android, and iOS packaging app names while preserving all existing platform length rules and the rest of the shared blacklist.

**Architecture:** Keep the three forms on the existing shared `AppNameInputPattern`. Change only the shared blacklist entry for ampersand; colon already passes. Exercise the rendered WebAwesome inputs in Playwright so the regression test covers the shared rule as wired into every store form.

**Tech Stack:** TypeScript, Lit, WebAwesome, Playwright, Vite

---

## File Structure

- Modify `apps/pwabuilder/Frontend/src/script/utils/constants.ts`: remove ampersand from the shared app-name blacklist.
- Modify `apps/pwabuilder/Frontend/tests/packaging.spec.ts`: add a browser regression test for Windows, Android, and iOS app-name controls.

### Task 1: Add the Cross-Platform Regression Test and Fix the Shared Pattern

**Files:**
- Modify: `apps/pwabuilder/Frontend/tests/packaging.spec.ts`
- Modify: `apps/pwabuilder/Frontend/src/script/utils/constants.ts:3`

- [ ] **Step 1: Write the failing browser regression test**

Append this test to `apps/pwabuilder/Frontend/tests/packaging.spec.ts`:

```typescript
test('Windows, Android, and iOS app names allow ampersands and colons', async ({ page }) => {
  const validationResults = await page.evaluate(async () => {
    const siteUrl = 'https://example.com';
    const manifest = {
      dir: 'auto',
      display: 'standalone',
      name: 'Example App',
      short_name: 'Example',
      start_url: '/',
      scope: '/',
      lang: 'en',
      description: 'Example description',
      theme_color: '#000000',
      background_color: '#ffffff',
      icons: [],
      screenshots: []
    };

    sessionStorage.setItem('current_url', siteUrl);
    sessionStorage.setItem(
      'PWABuilderManifest',
      JSON.stringify({
        siteUrl,
        manifestUrl: `${siteUrl}/manifest.webmanifest`,
        manifest,
        initialManifest: manifest,
        isGenerated: false,
        isEdited: false
      })
    );

    const formDefinitions = [
      {
        store: 'Windows',
        tagName: 'windows-form',
        modulePath: '/src/script/components/windows-form.ts',
        inputId: 'app-name-input'
      },
      {
        store: 'Android',
        tagName: 'android-form',
        modulePath: '/src/script/components/android-form.ts',
        inputId: 'app-name-input'
      },
      {
        store: 'iOS',
        tagName: 'ios-form',
        modulePath: '/src/script/components/ios-form.ts',
        inputId: 'appNameInput'
      }
    ] as const;

    const results: Array<{
      store: string;
      acceptsCustomerName: boolean;
      rejectsBlacklistedName: boolean;
    }> = [];

    for (const definition of formDefinitions) {
      await import(definition.modulePath);
      await customElements.whenDefined(definition.tagName);
      document.body.innerHTML = `<${definition.tagName}></${definition.tagName}>`;

      const form = document.querySelector(definition.tagName) as HTMLElement & {
        updateComplete: Promise<void>;
        shadowRoot: ShadowRoot;
      } | null;

      if (!form) {
        throw new Error(`Unable to render the ${definition.store} packaging form.`);
      }

      await form.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const input = form.shadowRoot.getElementById(definition.inputId) as HTMLElement & {
        value: string;
        checkValidity(): boolean;
        updateComplete: Promise<void>;
      } | null;

      if (!input) {
        throw new Error(`Unable to find the ${definition.store} app-name input.`);
      }

      input.value = 'Fandango: Movies & Series';
      await input.updateComplete;
      const acceptsCustomerName = input.checkValidity();

      input.value = 'Fandango | Movies';
      await input.updateComplete;
      const rejectsBlacklistedName = !input.checkValidity();

      results.push({
        store: definition.store,
        acceptsCustomerName,
        rejectsBlacklistedName
      });
    }

    return results;
  });

  expect(validationResults).toEqual([
    {
      store: 'Windows',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    },
    {
      store: 'Android',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    },
    {
      store: 'iOS',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    }
  ]);
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

From `apps/pwabuilder/Frontend`, run:

```powershell
npx playwright test tests\packaging.spec.ts --grep "app names allow ampersands and colons" --project=chromium
```

Expected: FAIL because each `acceptsCustomerName` value is `false` while ampersand remains in `AppNameInputPattern`.

- [ ] **Step 3: Remove ampersand from the shared blacklist**

In `apps/pwabuilder/Frontend/src/script/utils/constants.ts`, replace the app-name pattern with:

```typescript
export const AppNameInputPattern = '[^\\|\\$\\@\\#\\>\\<\\)\\(\\!\\%\\*]+$';
```

Do not remove any other blacklist entry. Colon requires no implementation change because it is already accepted.

- [ ] **Step 4: Run the targeted test to verify it passes**

From `apps/pwabuilder/Frontend`, run:

```powershell
npx playwright test tests\packaging.spec.ts --grep "app names allow ampersands and colons" --project=chromium
```

Expected: PASS for Chromium with all three store results accepting `Fandango: Movies & Series` and rejecting `Fandango | Movies`.

- [ ] **Step 5: Build the frontend**

From `apps/pwabuilder/Frontend`, run:

```powershell
npm run build
```

Expected: TypeScript compilation and the Vite production build complete successfully.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- apps\pwabuilder\Frontend\src\script\utils\constants.ts apps\pwabuilder\Frontend\tests\packaging.spec.ts
git commit -m "Fix store app name validation" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 7b50483b-b7b3-4c4c-9455-6305916ef08d"
```

### Task 2: Verify the Rendered Packaging UI

**Files:**
- Verify only: `apps/pwabuilder/Frontend/src/script/components/windows-form.ts`
- Verify only: `apps/pwabuilder/Frontend/src/script/components/android-form.ts`
- Verify only: `apps/pwabuilder/Frontend/src/script/components/ios-form.ts`

- [ ] **Step 1: Initialize Spiderloop**

Call `spiderloop-init_project` with the repository root:

```text
C:\Users\juhimang\.copilot\repos\copilot-worktrees\pwabuilder\user-judahgabriel-fluffy-succotash
```

Expected: Spiderloop reports the detected Vite project, development command, port, and routes.

- [ ] **Step 2: Start the configured development server**

Run the command and port returned by Spiderloop in a detached background process. Wait until the server responds before opening the browser.

Expected: the configured local URL responds and the process remains running.

- [ ] **Step 3: Exercise the three store forms**

Use Playwright MCP to open the configured root route. For each Windows, Android, and iOS packaging form, enter `Fandango: Movies & Series` in the app-name input and confirm the control does not expose an invalid state or the special-character error.

Expected: all three inputs accept the customer name; their existing required and length behavior remains present.

- [ ] **Step 4: Run Spiderloop Tier 1 gates**

For the verified route, capture the accessibility snapshot, browser console errors, and same-origin network responses with status 400 or greater. Evaluate the required gates from Spiderloop's `references/gates.md`.

Expected: no Tier 1 accessibility failure, browser console error, or same-origin network failure caused by this change.

- [ ] **Step 5: Inspect the final diff**

Run:

```powershell
git --no-pager diff main...HEAD --check
git --no-pager status --short
```

Expected: no whitespace errors; only the committed design, plan, shared pattern, and regression test are changed.
