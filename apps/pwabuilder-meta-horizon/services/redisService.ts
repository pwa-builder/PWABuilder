import { createClient, RedisClientType } from "@redis/client";
import { DefaultAzureCredential } from "@azure/identity";
import { EntraIdCredentialsProviderFactory, REDIS_SCOPE_DEFAULT } from "@redis/entraid";

/**
 * A service for interacting with a Redis database. In local development, this will be implemented as an in-memory database. For non-local environments, it will be implemented as a Redis database.
 */
export interface RedisDatabaseService {
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
export class RedisService implements RedisDatabaseService {
    public readonly ready: Promise<void>;
    private readonly redis: RedisClientType;
    private readonly redisHost: string;

    constructor() {
        this.redisHost = process.env.REDIS_HOST || "";
        if (!this.redisHost) {
            throw new Error("REDIS_HOST environment variable is not set.");
        }

        this.redis = this.createRedisConnection();
        this.ready = this.initializeConnection();
    }

    private createRedisConnection(): RedisClientType {
        // Create credentials provider for authentication
        const credential = new DefaultAzureCredential();
        const credentialsProvider = EntraIdCredentialsProviderFactory.createForDefaultAzureCredential({
            credential,
            scopes: REDIS_SCOPE_DEFAULT,
            tokenManagerConfig: {
                expirationRefreshRatio: 0.8 // Refresh token after 80% of its lifetime
            }
        });

        return createClient({
            socket: {
                host: this.redisHost,
                port: 6380,
                tls: true,
                connectTimeout: 30000,  // 30 seconds to establish connection (Azure cold start)
                reconnectStrategy: (retries) => {
                    const delay = Math.min(retries * 100, 3000);
                    console.info(`Reconnecting to Redis, attempt ${retries}, waiting ${delay}ms`);
                    return delay;
                }
            },
            credentialsProvider,
            commandsQueueMaxLength: 1000,
            pingInterval: 30000  // Keep-alive ping every 30 seconds
        });
    }

    private async initializeConnection(): Promise<void> {
        try {
            this.redis.on("error", (err: Error) => {
                console.error("Redis connection error:", err);
            });

            this.redis.on("reconnecting", () => {
                console.info("Redis reconnecting...");
            });

            await this.redis.connect();
            console.info("Redis connected and authenticated with managed identity");
        } catch (error) {
            console.error("Failed to initialize Redis connection:", error);
            throw error;
        }
    }

    /**
     * Retrieves a JSON object from Redis.
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
     */
    async save<T>(key: string, value: T): Promise<void> {
        try {
            const expirationSeconds = 90 * 24 * 60 * 60; // 90 days in seconds

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis set timeout after 15 seconds for key: ${key}`)), 15000);
            });

            await Promise.race([
                this.redis.set(key, JSON.stringify(value), {
                    EX: expirationSeconds
                }),
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
     */
    async dequeue<T>(key: string): Promise<T | null> {
        try {
            const startTime = Date.now();

            if (!this.redis.isReady) {
                console.warn('Redis not ready, skipping dequeue for key:', key);
                return null;
            }

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis lpop timeout after 10 seconds for key: ${key}`)), 10000);
            });

            const json = await Promise.race([
                this.redis.lPop(key),
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

            try {
                console.error('Redis ready status after dequeue failure:', this.redis.isReady);
            } catch (diagError) {
                console.error('Failed to get Redis status:', diagError);
            }

            throw error;
        }
    }

    /**
     * Pushes the given value onto the end of the list with the given key.
     */
    async enqueue<T>(key: string, value: T): Promise<number> {
        let queueLength = await this.redis.lLen(key);
        if (queueLength >= 50) {
            throw new Error("Cannot enqueue Meta Horizon package because the queue is too long. Current queue length: " + queueLength);
        }

        queueLength = await this.redis.rPush(key, JSON.stringify(value));
        console.info(`Added ${key} to the queue ${key}. Queue length is now ${queueLength} `);

        return queueLength;
    }

    /**
     * Gets the length of the queue with the given key.
     */
    queueLength(key: string): Promise<number> {
        return this.redis.lLen(key);
    }

    /**
     * Checks if Redis connection is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            if (!this.redis.isReady) {
                return false;
            }

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

class InMemoryDatabaseService implements RedisDatabaseService {
    private readonly store: Map<string, string> = new Map();
    private readonly queues: Map<string, any[]> = new Map();
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
        return Promise.resolve(true);
    }
}

const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
if (isLocalDev) {
    console.info("Local development detected, using in-memory database.");
} else {
    console.info(`${process.env.NODE_ENV} environment detected.Using Redis for database service.`);
}
export const database = isLocalDev ?
    new InMemoryDatabaseService() as RedisDatabaseService :
    new RedisService() as RedisDatabaseService;
