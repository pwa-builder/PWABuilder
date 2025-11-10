import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { trace, metrics } from '@opentelemetry/api';

enum AnalyticsStatus {
    ENABLED = 1,
    DISABLED = 0,
    DEFAULT = -1,
}

let analyticsStatus: AnalyticsStatus = AnalyticsStatus.DEFAULT;
let tracer: any = null;
let meter: any = null;

export function setupAnalytics() {
    try {
        // Initialize Azure Monitor OpenTelemetry
        const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

        if (connectionString) {
            console.log('Setting up Azure Monitor OpenTelemetry...');

            // Additional environment variables to prevent Azure SDK conflicts
            process.env.AZURE_TRACING_DISABLED = 'true';
            process.env.APPLICATIONINSIGHTS_NO_AZURE_INSTRUMENTATION = 'true';

            // Disable Azure Monitor internal metrics that can cause shutdown conflicts
            process.env.APPLICATIONINSIGHTS_NO_STATSBEAT = 'true';
            process.env.APPLICATIONINSIGHTS_STATSBEAT_DISABLED = 'true';
            process.env.APPLICATIONINSIGHTS_NO_DIAGNOSTIC_CHANNEL = 'true';

            // Configure Azure Monitor with OpenTelemetry
            try {
                useAzureMonitor({
                    azureMonitorExporterOptions: {
                        connectionString,
                    },
                    // Configure sampling ratio if needed
                    samplingRatio: 1.0,
                });
                console.log('Azure Monitor useAzureMonitor() completed successfully');
            } catch (azureMonitorError) {
                console.warn('Error in useAzureMonitor, but continuing:', azureMonitorError);
                // Continue anyway - we'll still try to get tracer/meter
            }            // Create tracer and meter for custom telemetry
            tracer = trace.getTracer('pwabuilder-google-play', '1.0.0');
            meter = metrics.getMeter('pwabuilder-google-play', '1.0.0');

            analyticsStatus = AnalyticsStatus.ENABLED;
            console.log('Azure Monitor OpenTelemetry enabled successfully');

            // Note: Azure Monitor OpenTelemetry distro handles shutdown automatically
            // No need for manual shutdown handlers as they can conflict with built-in shutdown logic
        } else {
            console.warn('APPLICATIONINSIGHTS_CONNECTION_STRING not found, analytics disabled');
            analyticsStatus = AnalyticsStatus.DISABLED;
        }
    } catch (e) {
        analyticsStatus = AnalyticsStatus.DISABLED;
        // Check if it's a duplicate registration error
        const error = e as Error;
        if (error.message && error.message.includes('duplicate registration')) {
            console.warn("OpenTelemetry API already registered (likely by Azure SDK), continuing with existing registration...");
            // Try to get existing tracer and meter
            try {
                tracer = trace.getTracer('pwabuilder-google-play', '1.0.0');
                meter = metrics.getMeter('pwabuilder-google-play', '1.0.0');
                analyticsStatus = AnalyticsStatus.ENABLED;
                console.log('Using existing OpenTelemetry registration');
            } catch (getError) {
                console.warn("Could not get existing OpenTelemetry providers:", getError);
            }
        } else {
            console.warn("Azure Monitor OpenTelemetry couldn't be enabled", e);
        }
    }
} export function trackEvent(
    analyticsInfo: AnalyticsInfo,
    error: string | null,
    success: boolean
) {
    if (analyticsStatus === AnalyticsStatus.DEFAULT) {
        setupAnalytics();
    }

    if (analyticsStatus === AnalyticsStatus.DISABLED || !tracer) {
        console.warn("Analytics disabled, skipping event tracking");
        return;
    }

    try {
        const eventName = success ? 'AndroidPackageEvent' : 'AndroidPackageFailureEvent';

        // Create a span for the event
        const span = tracer.startSpan(eventName, {
            attributes: {
                'pwa.name': analyticsInfo.name,
                'pwa.url': analyticsInfo.url,
                'pwa.platform_id': analyticsInfo.platformId || 'unknown',
                'pwa.platform_version': analyticsInfo.platformIdVersion || 'unknown',
                'pwa.referrer': analyticsInfo.referrer || 'unknown',
                'pwa.success': success,
                'pwa.package_id': analyticsInfo.packageId,
            }
        });

        // Add correlation ID if available
        if (analyticsInfo.correlationId) {
            span.setAttributes({
                'pwa.correlation_id': analyticsInfo.correlationId
            });
        }

        // Add error information if this is a failure event
        if (!success && error) {
            span.setAttributes({
                'pwa.error': error
            });
            span.recordException(new Error(error));
        }

        // End the span
        span.end();

        // Create a metric counter for package events - with error handling
        if (meter) {
            try {
                const packageCounter = meter.createCounter('pwa_package_events', {
                    description: 'Count of PWA package creation events'
                });

                packageCounter.add(1, {
                    success: success.toString(),
                    platform: 'android'
                });
            } catch (metricError) {
                console.warn('Failed to record metric:', metricError);
            }
        }

    } catch (e) {
        console.error('Error tracking event with OpenTelemetry:', e);
    }
}

export type AnalyticsInfo = {
    url: string;
    name: string;
    packageId: string;
    platformId: string | null;
    platformIdVersion: string | null;
    correlationId: string | null;
    referrer: string | null;
};
