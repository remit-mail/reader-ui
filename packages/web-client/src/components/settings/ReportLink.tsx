export function ReportLink({ href }: { href: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="inline-flex min-h-11 items-center font-medium text-accent hover:underline"
		>
			Report an issue
		</a>
	);
}
