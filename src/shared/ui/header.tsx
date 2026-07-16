import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';

type Props = {
	readonly heading: string;
};

export default function Header({heading}: Props) {
	return (
		<Box flexDirection="column">
			<Box>
				<Text bold color={colors.primary}>
					$jerd
				</Text>
			</Box>
			<Text color={colors.typoPrimary}>{heading}</Text>
		</Box>
	);
}
