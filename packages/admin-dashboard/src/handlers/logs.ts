import type { LogEntry } from "cyrus-core";

/**
 * GET /api/admin/logs — recent log entries from in-memory ring buffer
 *
 * Query params:
 *   ?limit=100       Max entries to return (default 100)
 *   ?since=<timestamp>  Only entries after this timestamp (ms)
 */
export function handleGetLogs(
	getLogEntries?: (limit?: number, sinceTimestamp?: number) => LogEntry[],
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return async (request: any) => {
		if (!getLogEntries) {
			return { success: true, data: { entries: [], count: 0 } };
		}

		const query = request.query || {};
		const limit = query.limit ? parseInt(query.limit, 10) : 100;
		const since = query.since ? parseInt(query.since, 10) : undefined;

		const entries = getLogEntries(limit, since);
		return {
			success: true,
			data: { entries, count: entries.length },
		};
	};
}
