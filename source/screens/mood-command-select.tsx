import {Select} from '@inkjs/ui';
import {Box, Text} from 'ink';
import {moodOptions} from '../components/mood-check-in/mood-options.js';
import {colors} from '../theme/colors.js';
import {
	type JournalMood,
	parseJournalMood,
} from '../utils/journal-frontmatter.js';

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
				<Text color={colors.textPrimary}>
					Unknown mood &quot;{invalidMood}&quot;. Choose one:
				</Text>
			</Box>

			<Select
				defaultValue="neutral"
				options={selectOptions}
				onChange={value => {
					const mood = parseJournalMood(value);
					if (mood) {
						onSelectMood(mood);
					}
				}}
			/>

			<Box marginTop={1}>
				<Text color={colors.textHint}>Enter to write | Esc to cancel</Text>
			</Box>
		</Box>
	);
}
