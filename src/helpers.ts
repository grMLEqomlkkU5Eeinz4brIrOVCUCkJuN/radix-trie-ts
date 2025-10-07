import { BREAK, BreakType, ReduceCallback, ReduceReverseCallback } from "./types";


// A reduce implementation you can "break" out of
export const reduce = <T, R>(
	accumulator: T[],
	callback: ReduceCallback<T, R>,
	result: R
): R => {
	for (let i = 0; i < accumulator.length; i++) {
		const val = callback(result, accumulator[i], i, accumulator);
		if (val === BREAK) break;
		result = val;
	}
	return result;
};

/**
 * Funky function to loop backwards over a key, so
 * foo, then fo, then f
 */
export const reduceReverse = <T>(
	result: T,
	callback: ReduceReverseCallback<T>
): T => {
	const end = result as string;
	let current: T;
	for (let i = end.length; i > 0; i--) {
		current = end.slice(0, i) as T;
		const val = callback(current, result, i);
		if (val === BREAK) break;
		// if this is reached, it didn't break so return the original
		// if the loop ends here since no match was found
		current = result;
	}
	return current!;
};