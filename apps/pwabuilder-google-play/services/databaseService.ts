import { Redis } from "ioredis";

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
}

/**
 * Database service that connects to PWABuilder's Redis instance in Azure.
 */
export class RedisService implements DatabaseService {
    public readonly ready: Promise<void>;
    private readonly redis: Redis;

    /**
     *
     */
    constructor() {
        const connectionString = process.env.REDIS_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("REDIS_CONNECTION_STRING environment variable is not set.");
        }

        // Configure Redis with proper timeouts and retry logic for Azure deployment scenarios
        this.redis = new Redis(connectionString, {
            connectTimeout: 30000,     // 30 seconds to establish connection (Azure cold start)
            commandTimeout: 15000,     // 15 seconds for individual commands (Azure warmup)
            lazyConnect: true,         // Don't connect immediately
            maxRetriesPerRequest: 5,   // More retries for deployment scenarios
            enableReadyCheck: true,
            keepAlive: 30000,          // Keep connections alive
            family: 4,                 // Force IPv4 for better Azure compatibility
            reconnectOnError: (err) => {
                const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
                return targetErrors.some(targetError => err.message.includes(targetError));
            }
        });

        this.ready = new Promise((resolve, reject) => {
            this.redis.on("ready", () => {
                console.info("Redis ready to accept commands");
                resolve();
            });

            this.redis.on("error", (err: Error) => {
                console.error("Redis connection error:", err);
                reject(err);
            });

            this.redis.on("connect", () => {
                console.info("Redis connected successfully");
            });

            this.redis.on("close", () => {
                console.warn("Redis connection closed");
            });

            this.redis.on("reconnecting", () => {
                console.info("Redis reconnecting...");
            });

            // Connect to Redis
            this.redis.connect().catch(reject);
        });
    }

    /**
     * Retrieves a JSON object from Redis.
     * @param key The key under which the object is stored
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
            console.debug(`Starting Redis lpop for key: ${key}`);

            // Health check: Ping Redis first to ensure connection is healthy
            try {
                await this.redis.ping();
            } catch (pingError) {
                console.warn(`Redis ping failed before lpop for key ${key}:`, pingError);
                // Try to reconnect if ping fails
                await this.redis.connect();
            }

            // First check if the list exists and has items to avoid blocking on empty lists
            const listLength = await this.redis.llen(key);
            if (listLength === 0) {
                console.debug(`Queue ${key} is empty, skipping lpop`);
                return null;
            }

            console.debug(`Queue ${key} has ${listLength} items, proceeding with lpop`);

            // Use a shorter timeout for lpop since we know the list has items
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Redis lpop timeout after 10 seconds for key: ${key} (list length: ${listLength})`)), 10000);
            });

            const json = await Promise.race([
                this.redis.lpop(key),
                timeoutPromise
            ]);

            const duration = Date.now() - startTime;
            console.debug(`Redis lpop completed in ${duration}ms for key: ${key}`);

            if (duration > 2000) {
                console.warn(`Slow Redis lpop operation: ${duration}ms for key: ${key}`);
            }

            if (!json) {
                console.warn(`Redis lpop returned null despite list having ${listLength} items for key: ${key}`);
                return null;
            }

            return JSON.parse(json) as T;
        } catch (error) {
            console.error(`Error in dequeue for key ${key}:`, error);

            // If lpop times out, let's try to diagnose Redis state
            try {
                const listLength = await this.redis.llen(key);
                const redisInfo = await this.redis.info('memory');
                console.error(`Redis diagnostics after lpop failure - List length: ${listLength}, Memory info: ${redisInfo.split('\n')[1]}`);
            } catch (diagError) {
                console.error('Failed to get Redis diagnostics:', diagError);
            }

            throw error;
        }
    }

    /**
     * Pushes the given value onto the end of the list with the given key.
     * @param key The key of the list to push onto.
     * @param value The value to push onto the list. This will be converted to a JSON string.
     */
    async enqueue<T>(key: string, value: T): Promise<number> {
        const totalItems = await this.redis.rpush(key, JSON.stringify(value));
        console.info(`Added ${key} to the queue ${key}. Queue length is now ${totalItems}`);
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
}

// export our database singleton. For local development, this will be an in-memory database. For other environments, it will be a Redis database in Azure.
const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
if (isLocalDev) {
    console.info("Local development detected, using in-memory database.");
} else {
    console.info(`${process.env.NODE_ENV} environment detected. Using Redis for database service.`);
}
export const database = isLocalDev ?
    new InMemoryDatabaseService() as DatabaseService :
    new RedisService() as DatabaseService;