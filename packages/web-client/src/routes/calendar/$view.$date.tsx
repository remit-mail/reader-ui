// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * /calendar/{view}/{date} — the calendar screen, at one zoom, on one day.
 *
 * Both are path segments: the zooms are mutually exclusive surfaces (R5), and
 * the day is where the screen opened (R4). An unreadable segment is rewritten
 * rather than refused, keeping the half that was readable.
 */
import {
	createFileRoute,
	Navigate,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { CalendarScreen } from "../../components/calendar/CalendarScreen";
import { useLayoutTier } from "../../hooks/useLayoutTier";
import {
	calendarSearchSchema,
	canonicalCalendarParams,
	isoDate,
} from "../../lib/calendar-route";
import { useCalendarAddress } from "../../routing";

export const Route = createFileRoute("/calendar/$view/$date")({
	validateSearch: calendarSearchSchema,
	beforeLoad: ({ params, search, location }) => {
		const canonical = canonicalCalendarParams(params, isoDate(new Date()));
		if (canonical.view === params.view && canonical.date === params.date)
			return;
		throw redirect({
			to: "/calendar/$view/$date",
			params: canonical,
			search,
			hash: location.hash,
			replace: true,
		});
	},
	component: CalendarViewLayout,
});

function CalendarViewLayout() {
	const { view, date } = useCalendarAddress();
	const isPhone = useLayoutTier() === "phone";
	if (isPhone && view === "year")
		return (
			<Navigate
				to="/calendar/$view/$date"
				params={{ view: "month", date }}
				search={true}
				replace
			/>
		);
	return <CalendarScreen isPhone={isPhone} detail={<Outlet />} />;
}
