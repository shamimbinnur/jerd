import {Box, Text, useInput} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';
import MainFrame from '../../shared/ui/main-frame.js';

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
		<MainFrame>
			<Box flexDirection="column" flexGrow={1}>
				<Header heading="Setup complete" />

				<Box marginTop={1}>
					<Text color={colors.typoPositive}>
						Project initialized for {userName}.
					</Text>
				</Box>

				<Box marginTop={2}>
					<Text color={colors.typoSecondary}>
						Continue in your project directory:
					</Text>
				</Box>

				<Box
					borderColor={colors.borderPrimary}
					borderStyle="round"
					marginTop={1}
					paddingX={1}
				>
					<Text bold color={colors.primary}>
						{cdCommand}
					</Text>
				</Box>

				<Box flexGrow={1} />

				<Box>
					<Text color={colors.typoTertiary}>Enter/Esc/Q exit</Text>
				</Box>
			</Box>
		</MainFrame>
	);
}
