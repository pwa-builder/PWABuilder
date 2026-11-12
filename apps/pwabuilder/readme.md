# PWABuilder

This project contains the source code for PWABuilder frontend [pwabuilder.com](https://www.pwabuilder.com) and backend API. 

The backend API is built using ASP.NET Core and the frontend is built using Lit web components, [WebAwesome](https://webawesome.com/docs) web component library, Vite build system, and TypeScript.

The backend uses Redis atomic lists for storing PWA analysis tasks to be processed. It uses Redis cache in Azure for storing the results of PWA analyses.

Running locally, however, uses in-memory queues and cache, so no need to set up Redis to run locally. Instead, just hit F5 and it will run locally.

## Admin sign-in persistence

The private `/admin` diagnostics page uses MSAL's `localStorage` account and token cache
to reuse sign-in across tabs and browser restarts. Passwords and diagnostic records
are not stored. Redirect state and the validated return path remain in tab-scoped
`sessionStorage`; admin API requests still use bearer tokens, not authentication cookies.

MSAL renews tokens silently when permitted by Microsoft Entra session and MFA policies.
Expired or revoked sessions can still require interactive sign-in. Use **Sign out** on
shared devices to clear the cached sign-in and end the Microsoft session. Clearing site
data or using a separate browser profile also prevents reuse of the cached sign-in.