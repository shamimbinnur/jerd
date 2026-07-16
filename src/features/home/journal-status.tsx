import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';

type Props = {
	readonly status: string;
};

// Status messages are centered below the home actions so transient save/open
// feedback does not shift the primary controls.
export default function JournalStatus({status}: Props) {
	return (
		<Box flexDirection="column" marginTop={3}>
			<Box justifyContent="center">
				<Text color={colors.typoPositive}>{status}</Text>
			</Box>
		</Box>
	);
}
