# Type-Safe Event Emitter

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

This project is a demonstration of an advanced, type-safe event emitter built entirely with TypeScript. It moves beyond traditional string-based event systems by leveraging TypeScript's powerful type system to provide compile-time safety, intelligent autocompletion, and a superior developer experience.

## The Problem with Traditional Event Emitters

In standard JavaScript, event emitters often rely on string literals for event names and accept any data as a payload. This can lead to common runtime errors that are hard to track down:
-   Typos in event names (`'user-created'` vs `'user:created'`).
-   Incorrect payload structures (e.g., sending a `string` instead of an `object`).
-   Forgetting to provide a payload when one is required.

This project solves these issues by creating a strict contract between event names and their corresponding payload types, enforced by the TypeScript compiler.

## Core Features

-   ✅ **100% Type-Safe:** Events and payloads are checked at compile-time, eliminating a whole class of runtime errors.
-   👂 **`on(eventName, listener)`:** Register listeners for specific events.
-   ☝️ **`once(eventName, listener)`:** Register a listener that is automatically removed after its first invocation.
-   ⭐️ **Wildcard Listeners `on('*', listener)`:** Subscribe to *all* events with a single listener, perfect for logging, debugging, or analytics.
-   🧮 **`getListenerCount(eventName)`:** Utility to check how many active listeners exist for an event.
-   🔥 **Built-in Error Handling:** Listeners are wrapped in `try...catch` blocks to prevent one misbehaving listener from crashing the entire application.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or newer recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to get the project running on your local machine.

**1. Clone the repository:**
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

**2. Install dependencies:**
This command downloads the necessary development tools (i.e., TypeScript).
```bash
npm install
```

**3. Run the demo:**
This command will compile the TypeScript code into JavaScript (in the `/dist` folder) and then execute the demo script.
```bash
npm start
```
You will see the output of the `src/index.ts` file in your terminal, demonstrating the various features of the event emitter.

## Code Overview

-   `src/TypeSafeEventEmitter.ts`: The core of the project. This file contains the generic, reusable `TypeSafeEventEmitter` class with all its public and private methods.
-   `src/index.ts`: A demonstration file that shows how to import and use the event emitter. It defines a set of application events and showcases how TypeScript catches potential errors.

## Usage Example

Using the emitter is designed to be intuitive and safe.

**1. Define your events and their payloads:**
```typescript
// Define a map of all possible events and their payload types
type AppEvents = {
    'user:created': { id: number; name: string; timestamp: Date };
    'user:deleted': { id: number; reason: string };
    'app:start': void; // An event with no payload
    'error': Error;
};
```

**2. Create and use an emitter instance:**
```typescript
import { TypeSafeEventEmitter } from './TypeSafeEventEmitter';

const appEmitter = new TypeSafeEventEmitter<AppEvents>();

// Register a listener (payload is fully typed)
appEmitter.on('user:created', (payload) => {
    console.log(`User created with ID: ${payload.id}`);
});

// Emit an event
appEmitter.emit('user:created', { 
    id: 101, 
    name: 'Alice', 
    timestamp: new Date() 
});

// The compiler would throw an error on the following lines:
// appEmitter.emit('user:created', { id: 102 }); // ❌ ERROR: Missing properties 'name' and 'timestamp'
// appEmitter.emit('user:signup'); // ❌ ERROR: Event 'user:signup' does not exist
```

## Showcasing TypeScript Features

This project was specifically designed to highlight several powerful TypeScript features:

-   **Generics (`<T extends EventMap>`):** Makes the `TypeSafeEventEmitter` class reusable for any event structure you can define.
-   **Mapped Types (`[K in keyof T]`):** Used to create the internal `listeners` object, ensuring its keys perfectly match the defined event names.
-   **Conditional Types (`...args: T[K] extends void ? ...`):** Cleverly used in the `emit` method's signature to make the `payload` argument optional *only* if its type is `void`.
-   **Method Overloading:** Allows the `on`, `off`, and `getListenerCount` methods to have different signatures and behaviors when used with a specific event name versus the `*` wildcard, while keeping the method name consistent.
