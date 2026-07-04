import {Box, Text, useInput} from 'ink';
import {colors} from '../theme/colors.js';

type Props = {
	readonly cdCommand: string;
	readonly onExit: () => void;
	readonly userName: string;
};

export default function PostInitPrompt({cdCommand, onExit, userName}: Props) {
	useInput((input, key) => {
		const normalizedInput = input?.toLowerCase() ?? '';

		if (normalizedInput === 'q' || key.escape || key.return) {
			onExit();
		}
	});

	return (
		<Box
			borderColor={colors.panelBorder}
			borderStyle="round"
			flexDirection="column"
			paddingX={2}
			paddingY={1}
			width={48}
		>
			<Text bold color={colors.successAccent}>
				Jerd project initialized, {userName}.
			</Text>
			<Box marginTop={1}>
				<Text color={colors.textPrimary}>
					Go to your project directory:{' '}
					<Text bold color={colors.brand}>
						{cdCommand}
					</Text>
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text color={colors.textPrimary}>
					<Text color={colors.textHint}>Press enter to exit</Text>
				</Text>
			</Box>
		</Box>
	);
}
