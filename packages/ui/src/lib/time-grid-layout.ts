/** A moment as a wall clock reads it in one zone: the day and minutes from midnight. */
export interface ZonedMoment {
	date: string;
	minute: number;
}

const partsFormat = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
	let format = partsFormat.get(timeZone);
	if (!format) {
		format = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		});
		partsFormat.set(timeZone, format);
	}
	return format;
}

export function zonedMoment(iso: string, timeZone: string): ZonedMoment {
	const parts = Object.fromEntries(
		formatter(timeZone)
			.formatToParts(new Date(iso))
			.map((part) => [part.type, part.value]),
	);
	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		minute: Number(parts.hour) * 60 + Number(parts.minute),
	};
}

export interface TimedSpan {
	id: string;
	start: ZonedMoment;
	end: ZonedMoment;
}

export interface PlacedSpan {
	id: string;
	/** Minutes from midnight on this day, end exclusive. */
	top: number;
	bottom: number;
	column: number;
	columns: number;
}

/**
 * The timed events on one day, clipped to it and laid out side by side where
 * they overlap: each cluster of overlapping events shares its width evenly.
 */
export function layoutDay(
	date: string,
	spans: readonly TimedSpan[],
): PlacedSpan[] {
	const onDay = spans
		.filter((span) => span.start.date <= date && span.end.date >= date)
		.map((span) => ({
			id: span.id,
			top: span.start.date < date ? 0 : span.start.minute,
			bottom: span.end.date > date ? 1440 : span.end.minute,
		}))
		.filter((span) => span.bottom > span.top || span.top === span.bottom)
		.map((span) => ({ ...span, bottom: Math.max(span.bottom, span.top + 15) }))
		.sort((a, b) => a.top - b.top || b.bottom - a.bottom);

	const placed: PlacedSpan[] = [];
	let cluster: PlacedSpan[] = [];
	let clusterEnd = -1;
	const close = () => {
		const columns = Math.max(0, ...cluster.map((span) => span.column)) + 1;
		for (const span of cluster) span.columns = columns;
		placed.push(...cluster);
		cluster = [];
	};
	for (const span of onDay) {
		if (span.top >= clusterEnd && cluster.length > 0) close();
		const taken = new Set(
			cluster
				.filter((other) => other.bottom > span.top)
				.map((other) => other.column),
		);
		let column = 0;
		while (taken.has(column)) column += 1;
		cluster.push({ ...span, column, columns: 1 });
		clusterEnd = Math.max(clusterEnd, span.bottom);
	}
	if (cluster.length > 0) close();
	return placed;
}

export interface DaySpan {
	id: string;
	/** First and last day, inclusive. */
	first: string;
	last: string;
}

export interface PlacedBar {
	id: string;
	startIndex: number;
	span: number;
	lane: number;
}

/** All-day events as bars across the days in view, stacked into lanes. */
export function layoutAllDay(
	days: readonly string[],
	spans: readonly DaySpan[],
): PlacedBar[] {
	const lanes: number[][] = [];
	const bars: PlacedBar[] = [];
	const visible = spans
		.filter(
			(span) => span.last >= days[0] && span.first <= days[days.length - 1],
		)
		.sort(
			(a, b) => a.first.localeCompare(b.first) || b.last.localeCompare(a.last),
		);
	for (const span of visible) {
		const startIndex = Math.max(
			0,
			days.indexOf(span.first < days[0] ? days[0] : span.first),
		);
		const lastDay =
			span.last > days[days.length - 1] ? days[days.length - 1] : span.last;
		const endIndex = days.indexOf(lastDay);
		let lane = lanes.findIndex((taken) =>
			taken.every((index) => index < startIndex || index > endIndex),
		);
		if (lane === -1) {
			lane = lanes.length;
			lanes.push([]);
		}
		for (let index = startIndex; index <= endIndex; index += 1)
			lanes[lane].push(index);
		bars.push({
			id: span.id,
			startIndex,
			span: endIndex - startIndex + 1,
			lane,
		});
	}
	return bars;
}
