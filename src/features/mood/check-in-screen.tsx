import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';
import {moodOptions} from './options.js';

type Props = {
	readonly selectedIndex: number;
};

export default function MoodCheckIn({selectedIndex}: Props) {
	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header heading="How are you feeling?" />

			<Box
				marginTop={1}
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				paddingX={2}
				paddingY={1}
			>
				{moodOptions.map((option, index) => {
					const isSelected = index === selectedIndex;
					return (
						<Box key={option.mood}>
							<Text
								bold={isSelected}
								color={isSelected ? colors.primary : colors.typoPrimary}
								inverse={isSelected}
							>
								{isSelected ? '➜ ' : '  '}
								{option.symbol} {option.label}
							</Text>
						</Box>
					);
				})}
			</Box>

			<Box flexGrow={1} />

			<Box>
				<Text color={colors.typoTertiary}>
					↑/↓ choose · Enter write · Esc back
				</Text>
			</Box>
		</Box>
	);
}
