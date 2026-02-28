export interface LogEntry {
	timestamp: number;
	level: "DEBUG" | "INFO" | "WARN" | "ERROR";
	component: string;
	message: string;
}

/**
 * Fixed-size ring buffer for storing recent log entries in memory.
 * Used by the admin dashboard to display logs without requiring
 * external log aggregation.
 */
export class LogBuffer {
	private entries: LogEntry[];
	private head = 0;
	private count = 0;
	private readonly capacity: number;

	constructor(capacity = 500) {
		this.capacity = capacity;
		this.entries = new Array(capacity);
	}

	push(entry: LogEntry): void {
		this.entries[this.head] = entry;
		this.head = (this.head + 1) % this.capacity;
		if (this.count < this.capacity) {
			this.count++;
		}
	}

	getEntries(limit?: number, sinceTimestamp?: number): LogEntry[] {
		if (this.count === 0) return [];

		// Read entries in chronological order
		const start = this.count < this.capacity ? 0 : this.head; // oldest entry
		const result: LogEntry[] = [];

		for (let i = 0; i < this.count; i++) {
			const idx = (start + i) % this.capacity;
			const entry = this.entries[idx]!;
			if (sinceTimestamp && entry.timestamp <= sinceTimestamp) continue;
			result.push(entry);
		}

		if (limit && limit > 0 && result.length > limit) {
			// Return the most recent `limit` entries
			return result.slice(-limit);
		}

		return result;
	}

	clear(): void {
		this.head = 0;
		this.count = 0;
		this.entries = new Array(this.capacity);
	}

	get size(): number {
		return this.count;
	}
}
