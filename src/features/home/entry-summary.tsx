import {Box, Text} from 'ink';
import BigText from 'ink-big-text';
import {colors} from '../../shared/theme/colors.js';

type Props = {
	readonly journalEntryCount: number;
	readonly now: Date;
};

// Keep large counts compact so the BigText value stays inside the summary box.
const formatEntryCount = (count: number) => {
	if (count < 1000) {
		return String(count);
	}

	const compact = count / 1000;
	const rounded = Math.round(compact * 10) / 10;
	return `${rounded % 1 === 0 ? String(rounded.toFixed(0)) : String(rounded)}K`;
};

const formatDisplayDate = (date: Date) =>
	new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);

export default function EntrySummary({journalEntryCount, now}: Props) {
	return (
		<Box justifyContent="center">
			<Box
				alignItems="center"
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				width={33}
			>
				<Text color={colors.typoSecondary}>{formatDisplayDate(now)}</Text>

				<Box alignItems="center" flexDirection="column" justifyContent="center">
					<BigText
						colors={[colors.primary]}
						font="tiny"
						text={formatEntryCount(journalEntryCount)}
					/>
				</Box>

				<Box
					paddingX={1}
					borderColor={colors.typoSecondary}
					backgroundColor={colors.typoTertiary}
				>
					<Text color={colors.typoPrimary}>Entries Recorded</Text>
				</Box>
			</Box>
		</Box>
	);
}
