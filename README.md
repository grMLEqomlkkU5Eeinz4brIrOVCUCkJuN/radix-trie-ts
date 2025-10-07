# Radix Trie TypeScript

A TypeScript implementation of a Radix Trie (also known as a compressed prefix tree) data structure. This is a TypeScript port of the original [radix-trie-js](https://www.npmjs.com/package/radix-trie-js) project with enhanced type safety and modern TypeScript features.

## Features

- **Type Safety**: Full TypeScript support with generic types for values
- **Memory Efficient**: Compressed trie structure that reduces memory usage
- **Fast Operations**: O(k) time complexity for insert, delete, and search operations where k is the key length
- **Fuzzy Search**: Built-in fuzzy matching for autocomplete functionality
- **Iterable**: Supports ES6 iteration protocols with generators
- **Flexible Input**: Accepts arrays, objects, and Maps for bulk operations

## Installation

```bash
npm install radix-trie-ts
```

## Usage

### Basic Usage

```typescript
import { Trie } from 'radix-trie-ts';

// Create a trie with the key "foo" and value 5
const trie = new Trie<number>().add("foo", 5);

// Get the value
console.log(trie.get("foo")); // 5
```

### Creating from Different Data Structures

```typescript
import { Trie } from 'radix-trie-ts';

// From an array of key-value pairs
const trie1 = new Trie<number>([
  ["foo", 5],
  ["foobar", 9],
]);

// From an object
const trie2 = new Trie<number>({
  foo: 5,
  foobar: 9,
});

// From a Map
const map = new Map<string, number>([
  ["foo", 5],
  ["foobar", 9],
]);
const trie3 = new Trie<number>(map);
```

### TypeScript Generic Types

```typescript
// Specify the value type for better type safety
const stringTrie = new Trie<string>();
stringTrie.add("hello", "world");
stringTrie.add("hi", "there");

const numberTrie = new Trie<number>();
numberTrie.add("count", 42);
numberTrie.add("total", 100);

// Mixed types (defaults to 'any')
const mixedTrie = new Trie();
mixedTrie.add("string", "value");
mixedTrie.add("number", 42);
mixedTrie.add("boolean", true);
```

## API Reference

### Constructor

```typescript
new Trie<T>(value?: T | IterableData<T> | null, isRoot?: boolean)
```

Creates a new trie instance. The generic type `T` specifies the type of values stored in the trie.

### Methods

#### `add(key, value?, root?)`

Inserts a key with the given value. Returns the trie instance for method chaining.

```typescript
// Single key-value pair
const trie = new Trie<number>().add("bar", 4);

// Bulk insert from array
trie.add([
  ["foo", 5],
  ["foobar", 9],
]);

// Bulk insert from object
trie.add({
  foo: 5,
  foobar: 9,
});

// Bulk insert from Map
const map = new Map<string, number>([
  ["foo", 5],
  ["foobar", 9],
]);
trie.add(map);
```

#### `delete(key, root?)`

Deletes a key/value pair from the trie.

```typescript
const trie = new Trie<number>().add("foo", 1).add("bar", 8);
console.log(trie.get("foo")); // 1

trie.delete("foo");
console.log(trie.get("foo")); // null
```

#### `get(key)`

Gets the value for a given key. Returns `null` if the key doesn't exist.

```typescript
const trie = new Trie<number>().add("bar", 4);
console.log(trie.get("bar")); // 4
console.log(trie.get("nonexistent")); // null
```

#### `fuzzyGet(searchKey)`

Returns an iterator for all keys and values that match or partially match the search key (case-insensitive). Perfect for autocomplete functionality.

```typescript
const trie = new Trie<boolean>();
trie.add("hi", true).add("Hello", false);

// Get first match
const firstMatch = trie.fuzzyGet("h").next();
console.log(firstMatch.value); // ["hi", true]

// Get all matches
const allMatches = [...trie.fuzzyGet("h")];
console.log(allMatches); // [["hi", true], ["Hello", false]]

// Partial match
const partialMatches = Array.from(trie.fuzzyGet("hel"));
console.log(partialMatches); // [["Hello", false]]
```

#### `has(key)`

Returns `true` if the given key exists in the trie.

```typescript
const trie = new Trie<number>().add("bar", 4);
console.log(trie.has("bar")); // true
console.log(trie.has("baz")); // false
```

#### `entries()`

Returns an iterator for all key-value pairs in the trie.

```typescript
const trie = new Trie<number>();
trie.add("ten", 10).add("five", 5).add("three", 3);

// Get first entry
const firstEntry = trie.entries().next();
console.log(firstEntry.value); // ["five", 5]

// Get all entries
const allEntries = [...trie.entries()];
console.log(allEntries); // [["five", 5], ["ten", 10], ["three", 3]]

// Convert to array
const entriesArray = Array.from(trie.entries());
console.log(entriesArray); // [["five", 5], ["ten", 10], ["three", 3]]
```

#### `keys()`

Returns an iterator for all keys in the trie.

```typescript
const trie = new Trie<number>();
trie.add("ten", 10).add("five", 5).add("three", 3);

// Get all keys
const allKeys = [...trie.keys()];
console.log(allKeys); // ["five", "ten", "three"]

// Convert to array
const keysArray = Array.from(trie.keys());
console.log(keysArray); // ["five", "ten", "three"]
```

#### `values()`

Returns an iterator for all values in the trie.

```typescript
const trie = new Trie<number>();
trie.add("ten", 10).add("five", 5).add("three", 3);

// Get all values
const allValues = [...trie.values()];
console.log(allValues); // [5, 10, 3]

// Convert to array
const valuesArray = Array.from(trie.values());
console.log(valuesArray); // [5, 10, 3]
```

#### `toJSON()`

Returns a JSON string representation of all entries in the trie.

```typescript
const trie = new Trie<number | boolean | string>({
  ten: 10,
  active: false,
  hello: "world"
});

console.log(trie.toJSON());
// {"ten":10,"active":false,"hello":"world"}
```

#### `forEach(callback, thisArg?)`

Executes a callback function once for each key-value pair.

```typescript
const trie = new Trie<number>().add("bar", 15).add("barstool", 20);

const result: Record<string, number> = {};
const callback = function(this: Record<string, number>, key: string, value: number) {
  this[key] = value;
};

trie.forEach(callback, result);

console.log(result.bar); // 15
console.log(result.barstool); // 20
```

## TypeScript Features

### Type Safety

The implementation provides full TypeScript support with:

- **Generic Types**: Specify the type of values stored in the trie
- **Type Guards**: Built-in type checking for iterable data structures
- **Strict Typing**: All methods are properly typed with return types and parameter types

### Type Definitions

```typescript
// Core types
type TrieValue = any; // Default value type
type TrieKey = string; // Key type (always string)

// Iterable data structures
type IterableData<T> = 
  | Array<[TrieKey, T]>
  | Map<TrieKey, T>
  | Record<string, T>;

// Generator types
type EntriesGenerator<T> = Generator<[string, T], void, unknown>;
type KeysGenerator = Generator<string, void, unknown>;
type ValuesGenerator<T> = Generator<T, void, unknown>;
type FuzzyGetGenerator<T> = Generator<[string, T], void, unknown>;
```

### Advanced Usage Examples

```typescript
// Custom value type
interface User {
  id: number;
  name: string;
  email: string;
}

const userTrie = new Trie<User>();
userTrie.add("john", { id: 1, name: "John Doe", email: "john@example.com" });
userTrie.add("jane", { id: 2, name: "Jane Smith", email: "jane@example.com" });

// Type-safe retrieval
const user = userTrie.get("john");
if (user) {
  console.log(user.email); // TypeScript knows this is a string
}

// Fuzzy search with custom type
const searchResults = [...userTrie.fuzzyGet("j")];
// searchResults is typed as [string, User][]
```

## Performance Characteristics

- **Time Complexity**:
  - Insert: O(k) where k is the key length
  - Delete: O(k) where k is the key length
  - Search: O(k) where k is the key length
  - Fuzzy Search: O(n) where n is the number of nodes

- **Space Complexity**: O(n) where n is the total number of characters in all keys

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## License

MIT License - Copyright (c) 2024 grml

Based on the original radix-trie-js implementation by Scott Davis (2017)

## Keywords

radix trie, trie, radix, typescript, data-structure, tree, autocomplete, prefix tree, compressed trie
