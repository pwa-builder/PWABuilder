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

        this.redis = new Redis(connectionString);
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
        });
    }

    /**
     * Retrieves a JSON object from Redis.
     * @param key The key under which the object is stored
     * @returns The parsed JSON object, or null if not found
     */
    async getJson<T>(key: string): Promise<T | null> {
        const json = await this.redis.get(key);
        if (!json) {
            return null;
        }
        return JSON.parse(json) as T;
    }

    /**
     * Stores the given object as a JSON string in Redis.
     * @param key The key under which to store the object
     * @param value The object to store
     */
    async save<T>(key: string, value: T): Promise<void> {
        try {
            const expirationSeconds = 90 * 24 * 60 * 60; // 90 days in seconds
            const result = await this.redis.set(key, JSON.stringify(value), 'EX', expirationSeconds);
            console.info("Saved object to redis", key, result);
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
        const json = await this.redis.lpop(key);
        if (!json) {
            return null;
        }

        return JSON.parse(json) as T;
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