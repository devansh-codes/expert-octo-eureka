export type EventMap = {
    [key: string]: any;
    error: Error; // A conventional event for handling errors.
};

/**
 * A mapped type that creates a union of all possible event structures for the wildcard listener.
 * For each event `K` in the EventMap `T`, it creates an object `{ event: K; payload: T[K] }`.
 * The final type is a union of all these objects.
 * e.g., { event: 'user:created', payload: { id: number, ... } } | { event: 'user:deleted', payload: { id: number } }
 */
export type WildcardEvent<T extends EventMap> = {
    [K in keyof T]: { event: K; payload: T[K] };
}[keyof T];

/**
 * Defines the structure for a regular listener function.
 */
export type Listener<T> = (payload: T) => void;

/**
 * Defines the structure for a wildcard listener function, which receives the event name and payload.
 */
export type WildcardListener<T extends EventMap> = (eventData: WildcardEvent<T>) => void;

/**
 * A type-safe event emitter class with advanced features like 'once', wildcard listeners, and more.
 * It uses generics and advanced mapped types to enforce a strict contract between event names
 * and their corresponding payload types.
 */
export class TypeSafeEventEmitter<T extends EventMap> {
    // A map for regular event listeners.
    private listeners: { [K in keyof T]?: Set<Listener<T[K]>> } = {};

    // A separate Set for wildcard ('*') listeners.
    private wildcardListeners: Set<WildcardListener<T>> = new Set();

    /**
     * Overloaded method to register a listener for a specific event or a wildcard event.
     * TypeScript's overload support allows us to have different function signatures for the same method name,
     * providing a clean and type-safe API for different use cases.
     *
     * @param eventName The name of the event, or '*' for a wildcard listener.
     * @param listener The function to be called when the event is emitted.
     */
    on<K extends keyof T>(eventName: K, listener: Listener<T[K]>): this;
    on(eventName: '*', listener: WildcardListener<T>): this;
    on<K extends keyof T>(eventName: K | '*', listener: Listener<T[K]> | WildcardListener<T>): this {
        if (eventName === '*') {
            this.wildcardListeners.add(listener as WildcardListener<T>);
        } else {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = new Set();
            }
            this.listeners[eventName]!.add(listener as Listener<T[K]>);
        }
        return this;
    }

    /**
     * Registers a listener that is called at most once for a specific event.
     * The listener is immediately removed after it is called the first time.
     *
     * @param eventName The name of the event to listen for.
     * @param listener The function to be called.
     */
    once<K extends keyof T>(eventName: K, listener: Listener<T[K]>): this {
        // Create a wrapper function that calls the original listener and then removes itself.
        const onceWrapper = (payload: T[K]) => {
            listener(payload);
            this.off(eventName, onceWrapper as Listener<T[K]>);
        };
        // We add the wrapper function as the listener.
        this.on(eventName, onceWrapper as Listener<T[K]>);
        return this;
    }

    /**
     * Overloaded method to remove a specific or wildcard listener.
     */
    off<K extends keyof T>(eventName: K, listener: Listener<T[K]>): this;
    off(eventName: '*', listener: WildcardListener<T>): this;
    off<K extends keyof T>(eventName: K | '*', listener: Listener<T[K]> | WildcardListener<T>): this {
        if (eventName === '*') {
            this.wildcardListeners.delete(listener as WildcardListener<T>);
        } else {
            const eventListeners = this.listeners[eventName];
            if (eventListeners) {
                eventListeners.delete(listener as Listener<T[K]>);
            }
        }
        return this;
    }

    /**
     * Emits an event to all corresponding listeners.
     * After notifying specific listeners, it also notifies all wildcard listeners.
     *
     * @param {...any[]} args The arguments for the event, consisting of the event name and an optional payload.
     */
    emit<K extends keyof T>(...args: T[K] extends void ? [eventName: K] : [eventName: K, payload: T[K]]): void {
        const [eventName, payload] = args;

        // Notify specific listeners
        const eventListeners = this.listeners[eventName];
        if (eventListeners) {
            [...eventListeners].forEach((listener) => {
                try {
                    listener(payload as T[K]);
                } catch (err) {
                    // FIX: Cast `this` to `any` to bypass complex type checking for the recursive emit call.
                    // We know this is safe because our EventMap requires an 'error' event.
                    (this as any).emit('error', err instanceof Error ? err : new Error('An error occurred in a listener.'));
                }
            });
        }

        // Notify wildcard listeners
        if (this.wildcardListeners.size > 0) {
            const wildcardEventData = { event: eventName, payload: payload as T[K] };
            [...this.wildcardListeners].forEach((listener) => {
                try {
                    listener(wildcardEventData as WildcardEvent<T>);
                } catch (err) {
                    // FIX: Cast `this` to `any` for the same reason as above.
                    (this as any).emit('error', err instanceof Error ? err : new Error('An error occurred in a wildcard listener.'));
                }
            });
        }
    }

    /**
     * Gets the number of listeners for a given event or for wildcard listeners.
     */
    getListenerCount<K extends keyof T>(eventName: K): number;
    getListenerCount(eventName: '*'): number;
    getListenerCount<K extends keyof T>(eventName: K | '*'): number {
        if (eventName === '*') {
            return this.wildcardListeners.size;
        }
        return this.listeners[eventName]?.size || 0;
    }

    /**
     * Removes all listeners for a specific event, or all listeners if no event is specified.
     */
    removeAllListeners<K extends keyof T>(eventName?: K | '*'): this {
        if (eventName) {
            if (eventName === '*') {
                this.wildcardListeners.clear();
            } else {
                delete this.listeners[eventName];
            }
        } else {
            this.listeners = {};
            this.wildcardListeners.clear();
        }
        return this;
    }
}