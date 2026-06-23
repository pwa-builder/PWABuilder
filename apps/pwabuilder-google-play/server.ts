// CRITICAL: Disable Azure SDK OpenTelemetry instrumentation BEFORE any imports
// to prevent conflicts with Azure Monitor OpenTelemetry
process.env.AZURE_TRACING_DISABLED = 'true';
process.env.APPLICATIONINSIGHTS_NO_AZURE_INSTRUMENTATION = 'true';
// Disable Azure Monitor internal metrics that can cause periodic shutdown issues
process.env.APPLICATIONINSIGHTS_NO_STATSBEAT = 'true';
process.env.APPLICATIONINSIGHTS_STATSBEAT_DISABLED = 'true';
process.env.APPLICATIONINSIGHTS_NO_DIAGNOSTIC_CHANNEL = 'true';

import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables FIRST before any OpenTelemetry setup
const configResult = dotenv.config({
    path: `./env/${app.get("env")}.env`
});
if (configResult.error) {
    console.error("Error loading .env file", configResult.error);
} else {
    console.info("Configured with environment file", configResult.parsed);
}

// Now setup Azure Monitor OpenTelemetry after environment is configured
import { setupAnalytics } from "./services/analytics.js";
setupAnalytics();

// Add global error handlers for diagnostics
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const port = process.env.PORT || 5858;

const jdk8Path = process.env.JDK8PATH;
const androidDevToolsPath = process.env.ANDROIDTOOLSPATH;
if (!jdk8Path || !androidDevToolsPath) {
    console.error("Couldn't find environment variables for JDK8 path or Android Dev tools", app.get("env"), jdk8Path, androidDevToolsPath);
}

// Kick off multiple background job processors for concurrent queue processing.
// Each processor independently polls Azure Queue Storage and processes one job at a time.
// Azure Queue's visibility timeout ensures no duplicate processing across processors or instances.
import { PackageJobProcessor } from './services/packageJobProcessor.js';
const processorCount = 2;
for (let i = 0; i < processorCount; i++) {
    const jobProcessor = new PackageJobProcessor();
    jobProcessor.start();
}
console.info(`Started ${processorCount} job processors on this instance.`);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});