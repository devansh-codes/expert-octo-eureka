import { TypeSafeEventEmitter } from './TypeSafeEventEmitter';

// Step 1: Define a more complex event map
type AppEvents = {
    'user:created': { id: number; name: string; timestamp: Date };
    'user:deleted': { id: number; reason: string };
    'app:start': void;
    'error': Error;
};

console.log("--- Advanced Type-Safe Event Emitter Demo ---");

// Step 2: Create an instance
const appEmitter = new TypeSafeEventEmitter<AppEvents>();

// Step 3: Demonstrate the '.on()' method
appEmitter.on('user:created', (payload) => {
    console.log(`[ON] User Created: ID=${payload.id}, Name=${payload.name}, Time=${payload.timestamp.toLocaleTimeString()}`);
});

// Step 4: Demonstrate the '.once()' method
appEmitter.once('user:deleted', (payload) => {
    // This will only run for the first 'user:deleted' event
    console.log(`[ONCE] User Deleted: ID=${payload.id}. Reason: ${payload.reason}. This message will only appear once.`);
});

// Step 5: Demonstrate the Wildcard listener '*'
appEmitter.on('*', ({ event, payload }) => {
    const payloadString = payload ? JSON.stringify(payload, null, 2) : 'No Payload';
    console.log(`[WILDCARD *] Event fired: "${String(event)}"\nPayload:\n${payloadString}\n`);
});

// Step 6: Demonstrate error handling
appEmitter.on('error', (error) => {
    console.error(`[ERROR] An error was caught by the emitter: ${error.message}`);
});
appEmitter.on('user:created', () => {
    throw new Error("Something went wrong in this specific listener!");
});

// Step 7: Demonstrate 'getListenerCount'
console.log(`\nListener Counts Before Emit:`);
console.log(`- user:created listeners: ${appEmitter.getListenerCount('user:created')}`); // Should be 2
console.log(`- user:deleted listeners: ${appEmitter.getListenerCount('user:deleted')}`); // Should be 1
console.log(`- Wildcard (*) listeners: ${appEmitter.getListenerCount('*')}`);       // Should be 1

// Step 8: Emit events to see everything in action
console.log("\n--- Emitting Events ---");
appEmitter.emit('app:start');
appEmitter.emit('user:created', { id: 101, name: 'Charlie', timestamp: new Date() });
appEmitter.emit('user:deleted', { id: 202, reason: 'Account cleanup' });
// This second 'user:deleted' event will NOT trigger the 'once' listener again.
appEmitter.emit('user:deleted', { id: 303, reason: 'Redundant account' });
console.log("-------------------------\n");


// Step 9: Check listener counts again
console.log(`Listener Counts After 'once' has fired:`);
console.log(`- user:created listeners: ${appEmitter.getListenerCount('user:created')}`); // Still 2
console.log(`- user:deleted listeners: ${appEmitter.getListenerCount('user:deleted')}`); // Should be 0 now
console.log(`- Wildcard (*) listeners: ${appEmitter.getListenerCount('*')}`);       // Still 1

console.log("\nDemo finished.");
