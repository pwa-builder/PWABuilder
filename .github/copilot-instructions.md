---
description: 'Guidelines for building C# and TypeScript applications'
applyTo: '**/*.cs, **/*.ts, **/*.js, **/*.css'
---

# Project Context
- This repository contains PWABuilder, a website for software developers that helps web devs create progressive web apps (PWAs) and publish them to app stores.
- The main repository is for PWABuilder.com, the web app. Its code is located in `apps/pwabuilder`. It is a C# web app using ASP.NET Core. It serves a SPA frontend, located in `apps/pwabuilder/Frontend`, which is built with TypeScript, Lit, and Shoelace. The frontend uses the Vite build system. It communicates with the backend via a REST API.
- The repository also contains some PWABuilder-related tooling. For example, `/apps/cli` contains the PWABuilder command line app, `/apps/pwabuilder-vscode` contains VSCode tooling for PWABuilder, `/docs` contains the documentation web site (docs.pwabuilder.com) for PWABuilder.
- Frontend is built with Typescript for type safety
- Frontend uses Lit web components for custom elements and SPA pages.
- Frontend uses the extrnal Shoelace library for prebuilt, styled components.

## Typescript Development
- Enable strict mode in tsconfig.json for maximum type safety
- Define types for method returns
- Implement generic components and composables where applicable
- New web components should inherit from LitElement
- Where possible, prefer to use existing web components from the Shoelace library
- Adhere to the single responsibility principle for components
- For TypeScript files, use kebab-case for file names.
- For custom web components built with Lit, keep them small and focused on one concern.
- All TypeScript classes should be PascalCase.

## C# Development
- When writing C#, always use the latest version C#, currently C# 13 features.
- Write clear and concise comments for each function.
- Use file-scoped namespaces and single-line using directives.
- Prioritize pattern matching for all conditional logic whenever possible.
- Prefer switch expressions when appropriate.
- Use `nameof(...)` instead of string literals when referencing members.
- Use `is null` / `is not null` (not `== null` / `!= null`).
- Use the null-conditional operator (`?.`) when helpful.
- Mark classes as `sealed` whenever possible to improve performance and clarity.
- Follow standard C# conventions for member ordering within classes:
  - Place **static fields** first, grouped together at the top.
  - Follow with instance fields.
  - Then properties.
  - Then constructors.
  - Then methods.
  - Group related members together and order by visibility (e.g., public before private).
- Do not use LINQ query syntax (e.g. `from x in y select x`). Always prefer LINQ method syntax (`.Select()`, `.Where()`, ...) for consistency and clarity.
- Do not insert more than one consecutive empty line, keep whitespace intentional and minimal.
- Avoid excessive comments. Only add comments when the logic is non-obvious or complex — clean code should explain itself.
- All constructors, methods, events and properties must include XML documentation to support maintainability and developer tooling.  
  - When the XML documentation is already defined in an interface or base class, use only `/// <inheritdoc/>` to inherit the documentation instead of duplicating it.

## General Instructions
- Make only high confidence suggestions when reviewing code changes.
- Write code with good maintainability practices, including comments on why certain design decisions were made.
- Handle edge cases and write clear exception handling.
- For libraries or external dependencies, mention their usage and purpose in comments.

## Naming Conventions

- For C#, follow PascalCase for component names, method names, and public members.
- For C#, use camelCase for private fields and local variables. Don't prefix private variables with underscores.

## Nullable Reference Types

- Declare variables non-nullable, and check for `null` at entry points.
- For C#, always use `is null` or `is not null` instead of `== null` or `!= null`.
- Trust the C# null annotations and don't add null checks when the type system says a value cannot be null.

## Testing

- Always include test cases for critical paths of the application.
- Guide users through creating unit tests.
- Copy existing style in nearby files for test method names and capitalization.
- Explain integration testing approaches for API endpoints.
- Demonstrate how to mock dependencies for effective testing.
- Show how to test authentication and authorization logic.
- Explain test-driven development principles as applied to API development.