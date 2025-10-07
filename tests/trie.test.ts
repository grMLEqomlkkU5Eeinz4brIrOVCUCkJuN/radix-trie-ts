import { Trie } from "../src/index";

// Test data for fuzzy search tests
const names = {
	"John": "person",
	"Johnny": "person", 
	"Scott": "person",
	"scott": "person",
	"Sarah": "person",
	"Sam": "person"
};

describe("Radix Trie", () => {
	describe("Add", () => {
		it("add a value to the tree.", () => {
			const trie = new Trie().add("foo", 5);

			expect(trie.get("foo")).toBe(5);
		});

		it("add values to the tree from an array to the constructor.", () => {
			const trie = new Trie([
				["foo", 5],
				["foos", 9],
			]);

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("add values to the tree from a map to the constructor.", () => {
			const map = new Map([
				["foo", 5],
				["foos", 9],
			]);
			const trie = new Trie(map);

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("add values to the tree from an object to the constructor.", () => {
			const trie = new Trie({
				foo: 5,
				foos: 9,
			});

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("should only overwrite value.", () => {
			const trie = new Trie().add("foo", 5).add("foos", 4);
			expect(trie.get("foo")).toBe(5);

			trie.add("foo", 6);
			expect(trie.get("foo")).toBe(6);
			expect(trie.get("foos")).toBe(4);
		});

		it("add values to the tree from an array.", () => {
			const trie = new Trie().add([
				["foo", 5],
				["foos", 9],
			]);

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("add values to the tree from a map.", () => {
			const map = new Map([
				["foo", 5],
				["foos", 9],
			]);
			const trie = new Trie().add(map);

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("add values to the tree from an object.", () => {
			const trie = new Trie().add({
				foo: 5,
				foos: 9,
			});

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("add two values to the tree, compressed.", () => {
			const trie = new Trie().add("foo", 5).add("foos", 9);

			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foos")).toBe(9);
		});

		it("consolidates prefixes with new entries", () => {
			const trie = new Trie().add("foo", 5);

			expect(trie.store.has("foo")).toBe(true);

			trie.add("faa", 3);

			expect(trie.store.has("foo")).toBe(false);
			expect(trie.store.has("f")).toBe(true);
			expect(trie.get("foo")).toBe(5);
			expect(trie.get("faa")).toBe(3);
		});

		it("consolidates prefixes with new entries #2", () => {
			const trie = new Trie().add("foo", 5);

			expect(trie.store.has("foo")).toBe(true);

			trie.add("foobar", 3).add("foobared");

			expect(trie.store.has("foo")).toBe(true);
			expect(trie.store.has("foobar")).toBe(false);
			expect(trie.get("foo")).toBe(5);
			expect(trie.get("foobar")).toBe(3);
			expect(trie.get("foobared")).toBe(true);
		});

		it("handles complex data types", () => {
			const trie = new Trie({
				"string": "text",
				"number": 42,
				"boolean": true,
				"array": [1, 2, 3],
				"object": { nested: "data" },
				"null": null
			});

			expect(trie.get("string")).toBe("text");
			expect(trie.get("number")).toBe(42);
			expect(trie.get("boolean")).toBe(true);
			expect(trie.get("array")).toEqual([1, 2, 3]);
			expect(trie.get("object")).toEqual({ nested: "data" });
			expect(trie.get("null")).toBe(null);
		});
	});

	describe("Delete", () => {
		it("deletes a value.", () => {
			const trie = new Trie().add("foo", 5);

			expect(trie.get("foo")).toBe(5);

			trie.delete("foo");

			expect(trie.get("foo")).toBe(null);
		});

		it("deletes a value with nodes.", () => {
			const trie = new Trie().add("foo", 5).add("foobar");

			expect(trie.get("foo")).toBe(5);

			trie.delete("foo");

			expect(trie.get("foo")).toBe(null);
			expect(trie.get("foobar")).toBe(true);
		});

		it("deletes a value split over more than one node", () => {
			const trie = new Trie().add("dog").add("doge").add("dogs");

			expect(trie.get("doge")).toBe(true);
			trie.delete("doge");

			expect(trie.get("doge")).toBe(null);
			expect(trie.get("dog")).toBe(true);
			expect(trie.get("dogs")).toBe(true);
		});

		it("deletes a value with more than one node", () => {
			const trie = new Trie().add("dog").add("doge").add("dogs");

			expect(trie.get("doge")).toBe(true);
			trie.delete("dog");

			expect(trie.get("doge")).toBe(true);
			expect(trie.get("dogs")).toBe(true);
			expect(trie.get("dog")).toBe(null);
		});

		it("chains deletes and additions together", () => {
			const trie = new Trie().add("dog").add("doge").add("dogs");

			expect(trie.get("doge")).toBe(true);
			expect(trie.get("dog")).toBe(true);
			trie.delete("dog");
			trie.delete("doge");

			expect(trie.get("doge")).toBe(null);
			expect(trie.get("dogs")).toBe(true);
			expect(trie.get("dog")).toBe(null);
			expect(trie.store.keys().next().value).toBe("dogs");
		});
	});

	describe("Get", () => {
		it("gets a value when it exists", () => {
			const trie = new Trie().add("bar", 15).add("barstool", false);

			expect(trie.get("bar")).toBe(15);
			expect(trie.get("barstool")).toBe(false);
		});

		it("returns null when a value does not exist", () => {
			const trie = new Trie().add("bar", 15).add("barstool", false);

			expect(trie.get("barkeep")).toBe(null);
			expect(trie.get("barstool")).toBe(false);
		});
	});

	describe("Has", () => {
		it("returns true if a key exists", () => {
			const trie = new Trie().add("bar", 15).add("barstool", false);

			expect(trie.has("barstool")).toBe(true);
		});

		it("returns false when a key does not exist", () => {
			const trie = new Trie().add("bar", 15).add("barstool", false);

			expect(trie.has("barkeep")).toBe(false);
		});
	});

	describe("FuzzyGet", () => {
		it("gets a list of all key/value pairs that at least partially match a key", () => {
			const trie = new Trie().add("bar", 15).add("barstool", false);

			expect([...trie.fuzzyGet("bar")]).toEqual([
				["bar", 15],
				["barstool", false],
			]);
		});

		it("gets a list of all key/value pairs that at least partially match a key #2", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			expect([...trie.fuzzyGet("b")]).toEqual([
				["b", "b"],
				["bar", 15],
				["barstool", false],
			]);
		});

		it("searches regardless of case.", () => {
			const results = new Trie(names).fuzzyGet("sc");
			const resultsArr = [...results];

			expect(resultsArr.length).toBe(2);
			expect(resultsArr[0][0]).toBe("scott");
			expect(resultsArr[1][0]).toBe("Scott");
		});

		it("searches regardless of case #2.", () => {
			const results = new Trie(names).fuzzyGet("john");
			const resultsArr = [...results];

			expect(resultsArr.length).toBe(2);
			expect(resultsArr[0][0]).toBe("John");
			expect(resultsArr[1][0]).toBe("Johnny");
		});

		it("should return no results for a key that does not exist.", () => {
			const results = new Trie(names).fuzzyGet("zelda");
			const resultsArr = [...results];

			expect(resultsArr.length).toBe(0);
		});
	});

	describe("Entries", () => {
		it("returns all the entries of a trie", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			expect([...trie.entries()]).toEqual([
				["b", "b"],
				["bar", 15],
				["barstool", false],
			]);
		});
	});

	describe("toJSON", () => {
		it("converts all entries to stringified JSON", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			expect(trie.toJSON()).toBe("{\"b\":\"b\",\"bar\":15,\"barstool\":false}");
		});
	});

	describe("Keys", () => {
		it("returns all the keys of a trie", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			expect([...trie.keys()]).toEqual(["b", "bar", "barstool"]);
		});
	});

	describe("Values", () => {
		it("returns all the values of a trie", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			expect([...trie.values()]).toEqual(["b", 15, false]);
		});
	});

	describe("forEach", () => {
		it("executes a callback once for each key/value pair.", () => {
			const trie = new Trie()
				.add("bar", 15)
				.add("barstool", false)
				.add("b", "b");

			const values = ["b", 15, false];
			const keys = ["b", "bar", "barstool"];
			let returnedKeys: string[] = [];
			let returnedValues: any[] = [];
			let thisObj: any = {};
			const callback = function (key: string, value: any) {
				returnedValues.push(value);
				returnedKeys.push(key);
				this[key] = value;
			};

			trie.forEach(callback, thisObj);

			expect(thisObj.bar).toBe(15);
			expect(returnedValues).toEqual(["b", 15, false]);
			expect(returnedKeys).toEqual(["b", "bar", "barstool"]);
		});
	});

	describe("TypeScript-specific features", () => {
		it("supports generic typing", () => {
			const trie = new Trie<string>();
			trie.add("test", "value");

			const result: string | null = trie.get("test");
			expect(result).toBe("value");
		});

		it("handles mixed types correctly", () => {
			const trie = new Trie();
			trie.add("string", "text");
			trie.add("number", 42);
			trie.add("boolean", true);
			trie.add("array", [1, 2, 3]);
			trie.add("object", { key: "value" });

			expect(typeof trie.get("string")).toBe("string");
			expect(typeof trie.get("number")).toBe("number");
			expect(typeof trie.get("boolean")).toBe("boolean");
			expect(Array.isArray(trie.get("array"))).toBe(true);
			expect(typeof trie.get("object")).toBe("object");
		});

		it("supports generator iteration with proper typing", () => {
			const trie = new Trie({
				"a": 1,
				"ab": 2,
				"abc": 3
			});

			const entries: [string, any][] = [];
			for (const entry of trie.entries()) {
				entries.push(entry);
			}

			expect(entries).toEqual([
				["a", 1],
				["ab", 2],
				["abc", 3]
			]);
		});

		it("maintains type safety with fuzzy search", () => {
			const trie = new Trie({
				"hello": "world",
				"help": "me",
				"he": "prefix"
			});

			const results: [string, any][] = [];
			for (const result of trie.fuzzyGet("hel")) {
				results.push(result);
			}

			expect(results.length).toBe(3);
			expect(results[0][0]).toBe("he");
			expect(results[1][0]).toBe("hello");
			expect(results[2][0]).toBe("help");
		});
	});

	describe("Edge cases", () => {
		it("handles empty string keys", () => {
			const trie = new Trie();
			trie.add("", "empty");
			
			// Empty string keys are not supported in this implementation
			expect(trie.get("")).toBe(null);
			expect(trie.has("")).toBe(false);
		});

		it("handles very long keys", () => {
			const longKey = "a".repeat(1000);
			const trie = new Trie();
			trie.add(longKey, "long");
			
			expect(trie.get(longKey)).toBe("long");
		});

		it("handles special characters in keys", () => {
			const trie = new Trie();
			trie.add("key-with-dashes", "dash");
			trie.add("key_with_underscores", "underscore");
			trie.add("key.with.dots", "dot");
			trie.add("key with spaces", "space");
			
			expect(trie.get("key-with-dashes")).toBe("dash");
			expect(trie.get("key_with_underscores")).toBe("underscore");
			expect(trie.get("key.with.dots")).toBe("dot");
			expect(trie.get("key with spaces")).toBe("space");
		});

		it("handles unicode characters", () => {
			const trie = new Trie();
			trie.add("café", "french");
			trie.add("naïve", "accent");
			trie.add("🚀", "rocket");
			
			expect(trie.get("café")).toBe("french");
			expect(trie.get("naïve")).toBe("accent");
			expect(trie.get("🚀")).toBe("rocket");
		});
	});
});
