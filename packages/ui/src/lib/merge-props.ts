type Props = object;
type MergedRecord = Record<string, unknown>;

type TupleTypes<T extends readonly unknown[]> = T[number];

type UnionToIntersection<U> = (
	U extends unknown
		? (arg: U) => void
		: never
) extends (arg: infer I) => void
	? I
	: never;

type MergedProps<T extends readonly (Props | null | undefined)[]> =
	UnionToIntersection<TupleTypes<{ [K in keyof T]: NonNullable<T[K]> }>>;

type Handler = (...args: unknown[]) => unknown;

function isEventHandlerKey(key: string): boolean {
	return /^on[A-Z]/.test(key);
}

function isHandler(value: unknown): value is Handler {
	return typeof value === "function";
}

function chainHandlers(first: Handler, second: Handler): Handler {
	return (...args) => {
		first(...args);
		second(...args);
	};
}

export function mergeProps<T extends readonly (Props | null | undefined)[]>(
	...sources: T
): MergedProps<T> {
	const merged: MergedRecord = {};

	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			const previous = merged[key];
			if (isEventHandlerKey(key) && isHandler(previous) && isHandler(value)) {
				merged[key] = chainHandlers(previous, value);
			} else if (value !== undefined || !(key in merged)) {
				merged[key] = value;
			}
		}
	}

	return merged as MergedProps<T>;
}
