import {Select} from '@inkjs/ui';
import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import {
	type JournalMood,
	parseJournalMood,
} from '../../core/journal/frontmatter.js';
import {moodOptions} from './options.js';

type Props = {
	readonly invalidMood: string;
	readonly onSelectMood: (mood: JournalMood) => void;
};

const selectOptions = moodOptions.map(option => ({
	label: option.mood,
	value: option.mood,
}));

export default function MoodCommandSelect({invalidMood, onSelectMood}: Props) {
	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text color={colors.typoPrimary}>
					Unknown mood &quot;{invalidMood}&quot;. Choose one:
				</Text>
			</Box>

			<Select
				defaultValue="calm"
				options={selectOptions}
				onChange={value => {
					const mood = parseJournalMood(value);
					if (mood) {
						onSelectMood(mood);
					}
				}}
			/>

			<Box marginTop={1}>
				<Text color={colors.typoTertiary}>Enter to write | Esc to cancel</Text>
			</Box>
		</Box>
	);
}
