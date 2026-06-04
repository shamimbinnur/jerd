import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';
import type {JournalMood} from '../utils/journal.js';

const moodOptions: Array<{
	readonly label: string;
	readonly mood: JournalMood;
	readonly symbol: string;
}> = [
	{label: 'Happy', mood: 'happy', symbol: 'H'},
	{label: 'Calm', mood: 'calm', symbol: 'C'},
	{label: 'Neutral', mood: 'neutral', symbol: 'N'},
	{label: 'Sad', mood: 'sad', symbol: 'S'},
	{label: 'Angry', mood: 'angry', symbol: 'A'},
];

type Props = {
	readonly selectedIndex: number;
};

export {moodOptions};

export default function MoodCheckIn({selectedIndex}: Props) {
	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color={colors.textPrimary}>How are you feeling?</Text>
			</Box>

			<Box
				borderColor={colors.panelBorder}
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
								color={isSelected ? colors.brand : colors.textPrimary}
								inverse={isSelected}
							>
								{isSelected ? '> ' : '  '}
								{option.symbol} {option.label}
							</Text>
						</Box>
					);
				})}
			</Box>

			<Box marginTop={1}>
				<Text color={colors.textHint}>Enter to write | Esc to cancel</Text>
			</Box>
		</Box>
	);
}
