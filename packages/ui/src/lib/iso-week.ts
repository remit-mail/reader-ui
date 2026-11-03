const MS_PER_DAY = 86_400_000;

const parse = (date: string): Date => {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

/** The ISO 8601 week a `YYYY-MM-DD` date falls in: weeks start on Monday, and week 1 holds the year's first Thursday. */
export function isoWeek(date: string): number {
	const day = parse(date);
	const weekday = (day.getUTCDay() + 6) % 7;
	const thursday = new Date(day.getTime() + (3 - weekday) * MS_PER_DAY);
	const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
	return Math.floor((thursday.getTime() - yearStart) / MS_PER_DAY / 7) + 1;
}
