import {Box, Text} from 'ink';
import {colors} from '../../theme/colors.js';
import {getGreeting} from '../../utils/greeting.js';

type Props = {
	readonly now: Date;
	readonly userName?: string;
};

export default function Header({now, userName}: Props) {
	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>
			<Text color={colors.textPrimary}>
				{getGreeting(now)}
				{userName ? `, ${userName}` : ''}
			</Text>
		</Box>
	);
}
