"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeSafeEventEmitter = void 0;
/**
 * A type-safe event emitter class with advanced features like 'once', wildcard listeners, and more.
 * It uses generics and advanced mapped types to enforce a strict contract between event names
 * and their corresponding payload types.
 */
class TypeSafeEventEmitter {
    constructor() {
        // A map for regular event listeners.
        this.listeners = {};
        // A separate Set for wildcard ('*') listeners.
        this.wildcardListeners = new Set();
    }
    on(eventName, listener) {
        if (eventName === '*') {
            this.wildcardListeners.add(listener);
        }
        else {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = new Set();
            }
            this.listeners[eventName].add(listener);
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
    once(eventName, listener) {
        // Create a wrapper function that calls the original listener and then removes itself.
        const onceWrapper = (payload) => {
            listener(payload);
            this.off(eventName, onceWrapper);
        };
        // We add the wrapper function as the listener.
        this.on(eventName, onceWrapper);
        return this;
    }
    off(eventName, listener) {
        if (eventName === '*') {
            this.wildcardListeners.delete(listener);
        }
        else {
            const eventListeners = this.listeners[eventName];
            if (eventListeners) {
                eventListeners.delete(listener);
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
    emit(...args) {
        const [eventName, payload] = args;
        // Notify specific listeners
        const eventListeners = this.listeners[eventName];
        if (eventListeners) {
            [...eventListeners].forEach((listener) => {
                try {
                    listener(payload);
                }
                catch (err) {
                    // FIX: Cast `this` to `any` to bypass complex type checking for the recursive emit call.
                    // We know this is safe because our EventMap requires an 'error' event.
                    this.emit('error', err instanceof Error ? err : new Error('An error occurred in a listener.'));
                }
            });
        }
        // Notify wildcard listeners
        if (this.wildcardListeners.size > 0) {
            const wildcardEventData = { event: eventName, payload: payload };
            [...this.wildcardListeners].forEach((listener) => {
                try {
                    listener(wildcardEventData);
                }
                catch (err) {
                    // FIX: Cast `this` to `any` for the same reason as above.
                    this.emit('error', err instanceof Error ? err : new Error('An error occurred in a wildcard listener.'));
                }
            });
        }
    }
    getListenerCount(eventName) {
        if (eventName === '*') {
            return this.wildcardListeners.size;
        }
        return this.listeners[eventName]?.size || 0;
    }
    /**
     * Removes all listeners for a specific event, or all listeners if no event is specified.
     */
    removeAllListeners(eventName) {
        if (eventName) {
            if (eventName === '*') {
                this.wildcardListeners.clear();
            }
            else {
                delete this.listeners[eventName];
            }
        }
        else {
            this.listeners = {};
            this.wildcardListeners.clear();
        }
        return this;
    }
}
exports.TypeSafeEventEmitter = TypeSafeEventEmitter;
