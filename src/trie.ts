import { 
	BREAK, 
	EMPTY_STRING, 
	TrieValue, 
	TrieKey, 
	IterableData, 
	CanIterate,
	EntriesGenerator,
	KeysGenerator,
	ValuesGenerator,
	FuzzyGetGenerator
} from "./types";
import { reduce, reduceReverse } from "./helpers";

// Type guard to check if a value can be iterated over
const canIterate = <T>(value: any): value is IterableData<T> => {
	return (
		Array.isArray(value) || 
    value instanceof Map || 
    value instanceof Object
	);
};

//Set a key-value pair in the trie store
const set = function<T>(this: Trie<T>, key: TrieKey, value: T): void {
	if (value instanceof Trie) {
		this.store.set(key, value as Trie<T>);
	} else {
		this.store.set(key, new Trie(value, false));
	}
};

// Add many key-value pairs from an iterable data structure
const addMany = function<T>(this: Trie<T>, keyValueMap: IterableData<T>): void {
	if (keyValueMap instanceof Object) {
		if (Array.isArray(keyValueMap)) {
			keyValueMap.forEach((pair) => this.add(pair[0], pair[1]));
		} else {
			Object.getOwnPropertyNames(keyValueMap).forEach((key) =>
				this.add(key, (keyValueMap as Record<string, T>)[key])
			);
		}
	}
	if (keyValueMap instanceof Map) {
		keyValueMap.forEach((v, k) => this.add(k, v));
	}
};

// Generator function for entries
const entries = function* (
	this: Trie,
	prefix: string = EMPTY_STRING,
	useKey: boolean = true,
	useValue: boolean = true
): EntriesGenerator<TrieValue> {
	for (const [key, trie] of this.store) {
		const entireKey = prefix + key;

		// already end of a word, so let's add it
		if (trie.value !== null) {
			if (useKey && useValue) {
				yield [entireKey, trie.value];
			} else if (useKey) {
				yield [entireKey, trie.value];
			} else if (useValue) {
				yield [entireKey, trie.value];
			}
		}

		// get all possible results of child nodes
		yield* entries.call(trie, entireKey, useKey, useValue);
	}
};

// Generator function for fuzzy get operations
const fuzzyGet = function* (
	this: Trie,
	getKey: string | null,
	prefix: string = EMPTY_STRING
): FuzzyGetGenerator<TrieValue> {
	const getKeyLowerCase = getKey === null ? null : getKey.toLowerCase();
	for (const [key, trie] of this.store) {
		const keyLowerCase = key.toLowerCase();
		// already end of a word, so let's add it
		if (getKeyLowerCase !== null && getKeyLowerCase === keyLowerCase) {
			yield* checkFuzzyGetHit(prefix + key, trie);
		} else {
			// search for substring hits
			if (getKeyLowerCase === null) {
				// had a previous hit, so return all subsequent results
				yield* checkFuzzyGetHit(prefix + key, trie);
			} else {
				// loop backwards through the search term and see if there is a hit
				if (getKeyLowerCase[0] !== keyLowerCase[0]) continue; // short circuit if it will never be a hit

				for (let i = getKeyLowerCase.length; i > 0; i--) {
					const currentPrefix = getKeyLowerCase.slice(0, i);
					if (keyLowerCase.indexOf(currentPrefix) === 0) {
						yield* checkFuzzyGetHit(
							prefix + key,
							trie,
							getKeyLowerCase.length === 1 ? null : getKeyLowerCase.slice(i)
						);
						break;
					}
				}
			}
		}
	}
};

// Helper function for fuzzy get hits
const checkFuzzyGetHit = function* (
	entireKey: string,
	trie: Trie,
	newSearch: string | null = null
): FuzzyGetGenerator<TrieValue> {
	if (trie.value !== null) yield [entireKey, trie.value];

	yield* fuzzyGet.call(trie, newSearch, entireKey);
};

// Radix Trie implementation in TypeScript
export class Trie<T = any> {
	public store: Map<TrieKey, Trie<T>>;
	public value: T | null;

	constructor(value: T | IterableData<T> | null = null, isRoot: boolean = true) {
		this.store = new Map();

		if (isRoot) {
			this.value = null;
			if (canIterate<T>(value)) {
				addMany.call(this, value);
			}
		} else {
			this.value = value as T;
		}
	}

	// Add a key-value pair to the trie
	add(key: TrieKey | IterableData<T>, value: T = true as T, root: Trie<T> = this): Trie<T> {
		if (canIterate(key)) {
			// passing in either an array, map or object of keys and values
			addMany.call(this, key);
			return root;
		}

		// if the key exists already, overwrite it
		if (this.store.has(key)) {
      this.store.get(key)!.value = value; // only overwrite value
      return root;
		}

		let didNotloop = true;
		const addKey = reduceReverse(
			key,
			(reducedKey: string, originalAddKey: string, currentIndex: number) => {
				// check for partial collisions over all existing keys
				for (const [originalKey, trie] of this.store) {
					if (originalKey.indexOf(reducedKey) === 0) {
						// partial match of an existing prefix

						didNotloop = false;
						if (originalKey === reducedKey) {
              // exact match found
              this.store.get(originalKey)!.add(key.slice(currentIndex), value);
						} else {
							// partial collision found
							if (reducedKey === key) {
								// the reducedKey is the full key we are inserting, so add the value
								set.call(this, reducedKey, value);
							} else {
								set.call(this, reducedKey, null);
							}
							// set the existing collided-with key/value
							this.store.get(reducedKey)!.store.set(
								originalKey.slice(reducedKey.length),
								trie
							);
							this.store.delete(originalKey); // clean up and delete the old one

							// save current one too if there are more letters in the key
							// that still need to be added
							if (reducedKey !== key)
                this.store.get(reducedKey)!.add(key.slice(currentIndex), value);
						}
						// no need to keep iterating, found the largest common prefix
						return BREAK;
					}
				}
				return reducedKey;
			}
		);

		if (addKey === key && didNotloop) {
			// no other leafs matched or partially matched, so save it here
			set.call(this, key, value);
		}

		return root;
	}

	// Delete a key from the trie
	delete(key: TrieKey, root: Trie<T> = this): Trie<T> | boolean {
		// if the key exists already, delete it
		if (this.store.has(key)) {
			const trie = this.store.get(key)!;

			if (trie.store.size) {
				// has other nodes branching off, so just remove value
				trie.value = null;
				return root === this ? root : this.store.size === 1; // if it equals 1, it is a redundant edge
			} else {
				// no other nodes, remove the whole entry
				this.store.delete(key);
				return root === this
					? root
					: this.store.size === 1 && this.value === null; // if it equals 1, it is a redundant edge
			}
		} else {
			// check for partial hits
			let result: boolean | undefined;
			const delKey = reduceReverse(
				key,
				(reducedKey: string, originalDeleteKey: string, currentIndex: number) => {
					// check for partial collisions over all existing keys
					for (const [originalKey, trie] of this.store) {
						if (originalKey === reducedKey) {
							const trie = this.store.get(originalKey)!;
							result = this.store
								.get(reducedKey)!
								.delete(originalDeleteKey.slice(reducedKey.length), root) as boolean;

							return BREAK;
						}
					}
					return reducedKey;
				}
			);
			if (result === true) {
				// an edge was left redundant after deletion, so compact it
				const redundantEdge = this.store
					.get(delKey)!
					.store.entries()
					.next().value;
				if (redundantEdge) {
					this.store.set(
						delKey + redundantEdge[0], // key
						redundantEdge[1]
					); // value
					this.store.delete(delKey);
				}
			}
		}

		return root;
	}

	// Check if a key exists in the trie
	has(key: TrieKey): boolean {
		return this.get(key) !== null;
	}

	// Get the value for a key from the trie
	get(key: TrieKey): T | null {
		// if the key exists already, return it
		if (this.store.has(key)) {
			return this.store.get(key)!.value;
		}

		let getIndex: number;
		const getKey = reduce(
			key.split(""),
			(newKey: string, letter: string, currentIndex: number, array: string[]) => {
				// if this iteration of the key exists, get the value from that
				// node with the remaining key's letters
				if (this.store.has(newKey)) {
					getIndex = currentIndex; // save the current index so we know where to split the key
					return BREAK;
				}

				return newKey + letter;
			},
			EMPTY_STRING
		);

		if (this.store.has(getKey)) {
			return this.store.get(getKey)!.get(key.slice(getIndex!));
		} else {
			// no matches
			return null;
		}
	}

	// Convert the trie to JSON string
	toJSON(): string {
		const result: Record<string, T> = {};
		for (const [key, value] of this.entries()) {
			result[key] = value;
		}
		return JSON.stringify(result);
	}

	// Fuzzy get generator - finds keys that match partially
	*fuzzyGet(getKey: string): FuzzyGetGenerator<T> {
		yield* fuzzyGet.call(this, getKey);
	}

	// Iterate over all key-value pairs
	forEach(callback: (key: string, value: T) => void, thisArg: any = null): void {
		for (const [key, value] of this.entries()) {
			callback.call(thisArg, key, value);
		}
	}

	// Generator for all entries
	*entries(): EntriesGenerator<T> {
		yield* entries.call(this);
	}

	// Generator for all keys
	*keys(): KeysGenerator {
		for (const [key] of entries.call(this, EMPTY_STRING, true, false)) {
			yield key;
		}
	}

	// Generator for all values
	*values(): ValuesGenerator<T> {
		for (const [, value] of entries.call(this, EMPTY_STRING, false, true)) {
			yield value;
		}
	}
}

export default Trie;
