import dotenv from 'dotenv';
import app from './app.js';
// import { PackageJobProcessor } from './services/packageJobProcessor.js';

const configResult = dotenv.config({
    path: `./env/${app.get("env")}.env`
});
if (configResult.error) {
    console.error("Error loading .env file", configResult.error);
} else {
    console.info("Configured with environment file", configResult.parsed);
}

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

// Kick off our background job processor. 
// This periodically polls Redis for new Google Play packaging jobs and processes them.
//const jobProcessor = new PackageJobProcessor();
//jobProcessor.start();

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});