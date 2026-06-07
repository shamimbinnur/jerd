import {Box, Text} from 'ink';
import {colors} from '../../theme/colors.js';

type Props = {
	readonly status: string;
};

export default function JournalStatus({status}: Props) {
	return (
		<Box flexDirection="column" marginTop={3}>
			<Box justifyContent="center">
				<Text color={colors.successAccent}>{status}</Text>
			</Box>
		</Box>
	);
}
