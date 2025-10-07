/**
 * Type definitions for the Radix Trie implementation
 */

// Type for the break constant used in reduce functions
export const BREAK = "TRIE_BREAK_REDUCE" as const;
export type BreakType = typeof BREAK;

// Empty string constant
export const EMPTY_STRING = "" as const;

// Type for values that can be stored in the trie
export type TrieValue = any;

// Type for keys that can be used in the trie
export type TrieKey = string;

// Type for iterable data structures that can be added to the trie
export type IterableData<T = any> = 
  | Array<[TrieKey, T]>
  | Map<TrieKey, T>
  | Record<string, T>;

// Type guard to check if a value is iterable
export type CanIterate<T> = T extends IterableData ? T : never;

// Type for the reduce callback function
export type ReduceCallback<T, R> = (result: R, item: T, index: number, array: T[]) => R | BreakType;

// Type for the reduce reverse callback function
export type ReduceReverseCallback<T> = (current: T, result: T, index: number) => T | BreakType;

// Type for the forEach callback function
export type ForEachCallback<T> = (key: string, value: T) => void;

// Type for entries generator
export type EntriesGenerator<T> = Generator<[string, T], void, unknown>;

// Type for keys generator
export type KeysGenerator = Generator<string, void, unknown>;

// Type for values generator
export type ValuesGenerator<T> = Generator<T, void, unknown>;

// Type for fuzzy get generator
export type FuzzyGetGenerator<T> = Generator<[string, T], void, unknown>;
