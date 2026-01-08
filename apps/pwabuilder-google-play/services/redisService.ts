import { Redis } from "ioredis";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * A service for interacting with a Redis database. In local development, this will be implemented as an in-memory database. For non-local environments, it will be implemented as a Redis database.
 */
export interface DatabaseService {
    ready: Promise<void>;
    getJson<T>(key: string): Promise<T | null>;
    save<T>(key: string, value: T): Promise<void>;
    dequeue<T>(key: string): Promise<T | null>;
    enqueue<T>(key: string, value: T): Promise<number>;
    queueLength(key: string): Promise<number>;
    healthCheck(): Promise<boolean>;
}

/**
 * Database service that connects to PWABuilder's Redis instance in Azure.
 */
export class RedisService implements DatabaseService {
    public readonly ready: Promise<void>;
    private readonly redis: Redis;
    private readonly redisHost: string;
    private readonly credential: DefaultAzureCredential;

    /**
     *
     */
    constructor() {
        this.redisHost = process.env.REDIS_HOST || "";
        if (!this.redisHost) {
            throw new Error("REDIS_HOST environment variable is not set.");
        }

        this.credential = new DefaultAzureCredential();
        this.redis = this.createRedisConnection();
        this.ready = this.initializeConnection();
    }

    private createRedisConnection(): Redis {
        return new Redis({
            host: this.redisHost,
            port: 6380,
            tls: {
                servername: this.redisHost
            },
            connectTimeout: 30000,     // 30 seconds to establish connection (Azure cold start)
            commandTimeout: 10000,     // 10 seconds for individual commands
            lazyConnect: true,         // Don't connect immediately
            maxRetriesPerRequest: 3,   // Reasonable retries
            enableReadyCheck: false,   // Disable ready check - we'll authenticate first then manually signal ready
            keepAlive: 30000,          // Keep connections alive
            family: 4,                 // Force IPv4 for better Azure compatibility
            reconnectOnError: (err) => {
                const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
                return targetErrors.some(targetError => err.message.includes(targetError));
            }
        });
    }

    private async initializeConnection(): Promise<void> {
        try {
            // Set up error handler before connecting
            this.redis.on("error", (err: Error) => {
                console.error("Redis connection error:", err);
            });

            this.redis.on("close", () => {
                console.warn("Redis connection closed");
            });

            // Connect to Redis
            await this.redis.connect();
            console.info("Redis connected, authenticating with managed identity...");

            // Get token and extract OID for username
            const token = await this.credential.getToken("https://redis.azure.com/.default");
            const username = this.extractOidFromToken(token.token);

            // Authenticate with HELLO 3 AUTH command (combines protocol switch and auth)
            await this.redis.call("HELLO", "3", "AUTH", username, token.token);
            console.info("Redis authenticated successfully with managed identity");

            // Set up reconnection handler to re-authenticate
            this.redis.on("reconnecting", () => {
                console.info("Redis reconnecting...");
            });

            // Re-authenticate after reconnection
            this.redis.on("connect", async () => {
                if (this.redis.status === "reconnecting" || this.redis.status === "connecting") {
                    console.info("Re-authenticating after reconnection...");
                    try {
                        const token = await this.credential.getToken("https://redis.azure.com/.default");
                        const username = this.extractOidFromToken(token.token);
                        await this.redis.call("HELLO", "3", "AUTH", username, token.token);
                        console.info("Re-authentication successful");
                    } catch (authError) {
                        console.error("Redis re-authentication failed:", authError);
                    }
                }
            });
        } catch (error) {
            console.error("Failed to initialize Redis connection:", error);
            throw error;
        }
    }

    /**
     * Extracts the Object ID (OID) from an Azure AD JWT token.
     * The OID is used as the username for Redis authentication with managed identity.
     * @param token The JWT access token
     * @returns The Object ID from the token
     */
    private extractOidFromToken(token: string): string {
        try {
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            // We need to decode the payload (middle part)
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }

            // Decode the base64-encoded payload
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

            // Extract the OID claim
            if (!payload.oid) {
                throw new Error('Token does not contain an OID claim');
            }

            return payload.oid;
        } catch (error) {
            console.error('Failed to extract OID from token:', error);
            throw new Error('Failed to extract OID from Azure AD token');
        }
    }

    /**
     * Retrieves a JSON object from Redis.
```     * @param key The key under which the object is stored
     * @returns The parsed JSON object, or null if not found
     */
    async getJson<T>(key: string): Promise<T | null> {
        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis get timeout after 15 seconds for key: ${key}`)), 15000);
            });

            const json = await Promise.race([
                this.redis.get(key),
                timeoutPromise
            ]);

            if (!json) {
                return null;
            }
            return JSON.parse(json) as T;
        } catch (error) {
            console.error(`Error in getJson for key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Stores the given object as a JSON string in Redis.
     * @param key The key under which to store the object
     * @param value The object to store
     */
    async save<T>(key: string, value: T): Promise<void> {
        try {
            const expirationSeconds = 90 * 24 * 60 * 60; // 90 days in seconds

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis set timeout after 15 seconds for key: ${key}`)), 15000);
            });

            await Promise.race([
                this.redis.set(key, JSON.stringify(value), 'EX', expirationSeconds),
                timeoutPromise
            ]);

            console.info("Saved object to redis", key);
        } catch (error) {
            console.error(`Error saving JSON to Redis with key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Finds a list with the given key and removes and returns the first item from it.
     * @param key The key of the list to pop from.
     * @returns The popped item serialized as JSON, or null if the list was empty.
     */
    async dequeue<T>(key: string): Promise<T | null> {
        try {
            const startTime = Date.now();

            // Check Redis status first
            const redisStatus = this.redis.status;
            if (redisStatus !== 'ready') {
                console.warn(`Redis status is ${redisStatus}, skipping dequeue for key: ${key}`);
                return null;
            }

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis lpop timeout after 10 seconds for key: ${key}`)), 10000);
            });

            const json = await Promise.race([
                this.redis.lpop(key),
                timeoutPromise
            ]);

            const duration = Date.now() - startTime;

            if (duration > 2000) {
                console.warn(`Slow Redis lpop operation: ${duration}ms for key: ${key} `);
            }

            if (!json) {
                return null;
            }

            return JSON.parse(json) as T;
        } catch (error) {
            console.error(`Error in dequeue for key ${key}: `, error);

            // If there's a connection error, provide diagnostics but don't try to reconnect here
            // Let the Redis client handle reconnection automatically
            try {
                const redisStatus = this.redis.status;
                console.error(`Redis status after dequeue failure: ${redisStatus}`);
            } catch (diagError) {
                console.error('Failed to get Redis status:', diagError);
            }

            throw error;
        }
    }    /**
     * Pushes the given value onto the end of the list with the given key.
     * @param key The key of the list to push onto.
     * @param value The value to push onto the list. This will be converted to a JSON string.
     */
    async enqueue<T>(key: string, value: T): Promise<number> {
        const totalItems = await this.redis.rpush(key, JSON.stringify(value));
        console.info(`Added ${key} to the queue ${key}. Queue length is now ${totalItems} `);
        return totalItems;
    }

    /**
     * Gets the length of the queue with the given key.
     * @param key The key of the list to get the length of.
     * @returns The length of the list.
     */
    queueLength(key: string): Promise<number> {
        return this.redis.llen(key);
    }

    /**
     * Checks if Redis connection is healthy
     * @returns Promise<boolean> indicating if Redis is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            if (this.redis.status !== 'ready') {
                return false;
            }

            // Try a simple ping with timeout
            const pingPromise = this.redis.ping();
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Health check timeout')), 3000);
            });

            await Promise.race([pingPromise, timeoutPromise]);
            return true;
        } catch (error) {
            console.warn('Redis health check failed:', error);
            return false;
        }
    }
}

class InMemoryDatabaseService implements DatabaseService {
    private readonly store: Map<string, string> = new Map(); // key is ID of the object, value is the JSON string.
    private readonly queues: Map<string, any[]> = new Map(); // key is the name of the queue, value is an array of JSON strings representing the items in the queue.
    public readonly ready = Promise.resolve();

    getJson<T>(key: string): Promise<T | null> {
        const jsonOrNull = this.store.get(key) || null;
        if (!jsonOrNull) {
            return Promise.resolve(null);
        }

        return Promise.resolve(JSON.parse(jsonOrNull) as T);
    }

    save<T>(key: string, value: T): Promise<void> {
        console.info("Saving object to in-memory storage", key);
        this.store.set(key, JSON.stringify(value));
        return Promise.resolve();
    }

    dequeue<T>(key: string): Promise<T | null> {
        const list = this.queues.get(key) || [];
        const firstItemInList = list.shift();
        if (!firstItemInList) {
            return Promise.resolve(null);
        }

        return Promise.resolve(JSON.parse(firstItemInList) as T);
    }

    enqueue<T>(key: string, value: T): Promise<number> {
        const list = this.queues.get(key) || [];
        list.push(JSON.stringify(value));
        this.queues.set(key, list);
        return Promise.resolve(list.length);
    }

    queueLength(key: string): Promise<number> {
        const list = this.queues.get(key) || [];
        return Promise.resolve(list.length);
    }

    healthCheck(): Promise<boolean> {
        // In-memory database is always healthy
        return Promise.resolve(true);
    }
}

// export our database singleton. For local development, this will be an in-memory database. For other environments, it will be a Redis database in Azure.
const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
if (isLocalDev) {
    console.info("Local development detected, using in-memory database.");
} else {
    console.info(`${process.env.NODE_ENV} environment detected.Using Redis for database service.`);
}
export const database = isLocalDev ?
    new InMemoryDatabaseService() as DatabaseService :
    new RedisService() as DatabaseService;