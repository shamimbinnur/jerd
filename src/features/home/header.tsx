import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import {getGreeting} from './greeting.js';

type Props = {
	readonly now: Date;
	readonly userName?: string;
};

export default function Header({now, userName}: Props) {
	return (
		<Box flexDirection="column">
			<Box>
				<Text bold color={colors.primary}>
					$jerd
				</Text>
			</Box>
			<Text color={colors.typoPrimary}>
				{getGreeting(now)}
				{userName ? `, ${userName}` : ''}
			</Text>
		</Box>
	);
}
