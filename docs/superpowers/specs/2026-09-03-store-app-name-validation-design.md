# Store App Name Validation Design

## Problem

PWABuilder applies the shared `AppNameInputPattern` to the Windows, Android, and iOS packaging forms. The pattern currently rejects ampersands, so a valid customer-facing name such as `Fandango: Movies & Series` fails client-side validation before packaging.

The colon already passes the current pattern. The ampersand is the character causing this report.

## Design

Remove the ampersand from the shared app-name blacklist. Continue using the shared pattern in all three packaging forms so Windows, Android, and iOS accept both ampersands and colons without changing their platform-specific required and length constraints.

Keep the remaining blacklist entries unchanged. This avoids broadening validation beyond the requested characters or changing packaging payloads and backend behavior.

## Validation Behavior

- `Fandango: Movies & Series` is valid in the Windows, Android, and iOS app-name controls.
- Existing required and length validation remains unchanged for each platform.
- Characters that remain in the shared blacklist, such as `|`, are still invalid.
- Validation errors continue to use each form's existing UI behavior.

## Testing

Add a Playwright regression test that renders each packaging form, enters `Fandango: Movies & Series`, and confirms the app-name control is valid. Include a rejected-character assertion to prove the existing blacklist remains active.

Run the targeted packaging test and the frontend build. Use Spiderloop automation to verify the rendered form has no browser console or same-origin network errors and satisfies the required UI gates.
