import { GooglePlayPackageJob } from "./googlePlayPackageJob.js";
import { PackageCreationProgress } from "./packageCreationProgress.js";

/**
 * A logger that writes logs to a Google Play packaging job's log storage.
 */
export class PackageJobLogger {
    /**
     * Creates a new logger for the specified app package job.
     */
    constructor(private readonly job: GooglePlayPackageJob) {
    }

    info(message: string, ...optionalArgs: any[]): void {
        this.log("info", message, optionalArgs);
    }

    warn(message: string, ...optionalArgs: any[]): void {
        this.log("warn", message, optionalArgs);
    }

    error(message: string, ...optionalArgs: any[]): void {
        this.log("error", message, optionalArgs);
    }

    logProgress(progress: PackageCreationProgress): void {
        const level = progress.level || "info";
        this.log(level, progress.message);
    }

    private log(level: "info" | "warn" | "error", message: string, ...optionalArgs: any[]): void {
        const timestamp = new Date().toISOString();
        const optionsArgsStr = optionalArgs ? " " + optionalArgs.map(arg => JSON.stringify(arg || "")).join(" ") : "";
        const logEntry = `${timestamp} [${level}]: ${message}${optionsArgsStr}`;

        this.job.logs.push(logEntry);
        if (level === "error") {
            this.job.errors.push(logEntry);
        }

        const consoleMethod = level === "warn" ? console.warn
            : level === "error" ? console.error
                : console.info;

        const args = optionalArgs && optionalArgs.length > 0 ? [message, optionalArgs] : [message];
        consoleMethod(...args);
    }
}