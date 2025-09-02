# PWABuilder

This project contains the source code for PWABuilder frontend [pwabuilder.com](https://www.pwabuilder.com) and backend API. 

The backend API is built using ASP.NET Core and the frontend is built using Lit web components, Shoelace web component library, Vite build system, and TypeScript.

The backend uses Azure Queues for storing PWA analysis tasks to be processed. It uses Redis cache in Azure for storing the results of PWA analyses.

Running locally, however, uses in-memory queues and cache, so no need to set up Azure services or Redis to run locally. Instead, just hit F5 and it will run locally.