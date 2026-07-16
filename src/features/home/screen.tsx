import {Box} from 'ink';
import ActionGrid from './action-grid.js';
import EntrySummary from './entry-summary.js';
import Header from './header.js';
import JournalStatus from './journal-status.js';

type Props = {
	readonly journalEntryCount: number;
	readonly journalStatus?: string;
	readonly now?: Date;
	readonly userName?: string;
};

export default function Home({
	journalEntryCount,
	journalStatus,
	now,
	userName,
}: Props) {
	const currentTime = now ?? new Date();

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header now={currentTime} userName={userName} />

			<Box flexDirection="column" marginTop={2}>
				<EntrySummary journalEntryCount={journalEntryCount} now={currentTime} />
				<ActionGrid />
			</Box>

			{journalStatus ? <JournalStatus status={journalStatus} /> : null}
		</Box>
	);
}
